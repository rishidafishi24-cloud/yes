#!/usr/bin/env python3
"""Captions: transcribe speech with faster-whisper and burn subtitles into a video.

  captions.py transcribe IN OUT.srt [--model tiny]   (needs: pip install faster-whisper)
  captions.py burn IN SUBS.srt OUT [--size 16]        (needs only ffmpeg)
  captions.py auto IN OUT [--model tiny]              (transcribe, then burn)

faster-whisper downloads its model on first use, so that step needs internet access.
"""
import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def fmt(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def transcribe(src, out_srt, model="tiny"):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit("faster-whisper is not installed: pip install faster-whisper")
    segments, _ = WhisperModel(model, compute_type="int8").transcribe(src, vad_filter=True)
    n = 0
    with open(out_srt, "w") as f:
        for seg in segments:
            text = seg.text.strip()
            if not text:
                continue
            n += 1
            f.write(f"{n}\n{fmt(seg.start)} --> {fmt(seg.end)}\n{text}\n\n")
    print(f"wrote {out_srt} ({n} captions)")
    return n


def burn(src, srt, out, size=16):
    if Path(srt).stat().st_size == 0:
        shutil.copy(src, out)
        print(f"no captions to burn; copied {src} to {out}")
        return
    with tempfile.TemporaryDirectory() as d:
        tmp = Path(d) / "subs.srt"
        shutil.copy(srt, tmp)
        style = f"FontSize={size},Bold=1,Outline=2,Shadow=0,Alignment=2,MarginV=70"
        vf = f"subtitles={tmp}:force_style='{style}'"
        res = subprocess.run(["ffmpeg", "-y", "-i", src, "-vf", vf, "-c:v", "libx264", "-preset", "veryfast",
                              "-crf", "20", "-c:a", "copy", "-pix_fmt", "yuv420p", out],
                             capture_output=True, text=True)
    if res.returncode != 0:
        sys.exit(f"burn failed:\n{res.stderr[-1200:]}")
    print(f"wrote {out}")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    t = sub.add_parser("transcribe"); t.add_argument("input"); t.add_argument("output")
    t.add_argument("--model", default="tiny")
    b = sub.add_parser("burn"); b.add_argument("input"); b.add_argument("srt"); b.add_argument("output")
    b.add_argument("--size", type=int, default=16)
    a = sub.add_parser("auto"); a.add_argument("input"); a.add_argument("output")
    a.add_argument("--model", default="tiny")
    args = p.parse_args()
    if args.cmd == "transcribe":
        transcribe(args.input, args.output, args.model)
    elif args.cmd == "burn":
        burn(args.input, args.srt, args.output, args.size)
    else:
        with tempfile.TemporaryDirectory() as d:
            srt = str(Path(d) / "auto.srt")
            transcribe(args.input, srt, args.model)
            burn(args.input, srt, args.output)


if __name__ == "__main__":
    main()
