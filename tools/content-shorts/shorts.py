#!/usr/bin/env python3
"""Shorts toolkit: reframe to vertical, apply a style preset, and check a short.

Standard library only. Needs ffmpeg and ffprobe on PATH.

  shorts.py reframe IN OUT [--mode blur|crop] [--start S] [--duration D]
  shorts.py style   IN OUT --preset NAME [--text TEXT]
  shorts.py loudness IN OUT          (normalize audio to about -14 LUFS)
  shorts.py check   VIDEO [--license license.json] [--max-seconds 60]
  shorts.py presets
"""
import argparse
import json
import re
import subprocess
import sys

W, H = 1080, 1920

# Style presets: ffmpeg video filters and a playback speed. Edit or add your own.
PRESETS = {
    "clean": {"vf": "", "speed": 1.0},
    "warm": {"vf": "eq=saturation=1.15:contrast=1.05,colorbalance=rs=.06:bs=-.06", "speed": 1.0},
    "punchy": {"vf": "eq=saturation=1.3:contrast=1.15:brightness=0.02,unsharp=5:5:0.8", "speed": 1.05},
    "dreamy": {"vf": "eq=saturation=0.9:contrast=0.95,gblur=sigma=0.6", "speed": 0.95},
}

BAD_LICENSES = {"", "unknown", "all rights reserved", "all-rights-reserved", "none", "n/a"}


def run(cmd, capture=False):
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        sys.exit(f"command failed: {' '.join(cmd[:3])}...\n{res.stderr[-1500:]}")
    return res if capture else None


def probe(path):
    out = run(["ffprobe", "-v", "error", "-print_format", "json", "-show_streams",
               "-show_format", path], capture=True).stdout
    return json.loads(out)


def cmd_reframe(a):
    trim = []
    if a.start is not None:
        trim += ["-ss", str(a.start)]
    if a.duration is not None:
        trim += ["-t", str(a.duration)]
    if a.mode == "crop":
        vf = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1"
        cmd = ["ffmpeg", "-y", *trim, "-i", a.input, "-vf", vf]
    else:
        fc = (f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
              f"gblur=sigma=30[bg];[0:v]scale={W}:-2:force_original_aspect_ratio=decrease[fg];"
              f"[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1[v]")
        cmd = ["ffmpeg", "-y", *trim, "-i", a.input, "-filter_complex", fc, "-map", "[v]", "-map", "0:a?"]
    run(cmd + ["-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-c:a", "aac", "-b:a", "160k",
               "-pix_fmt", "yuv420p", "-movflags", "+faststart", a.output])
    print(f"wrote {a.output} ({W}x{H})")


def cmd_style(a):
    if a.preset not in PRESETS:
        sys.exit(f"unknown preset {a.preset}; choose from {', '.join(PRESETS)}")
    p = PRESETS[a.preset]
    vf = [p["vf"]] if p["vf"] else []
    if p["speed"] != 1.0:
        vf.append(f"setpts=PTS/{p['speed']}")
    if a.text:
        safe = re.sub(r"[^A-Za-z0-9 .,!?'-]", "", a.text)
        vf.append(f"drawtext=text='{safe}':fontcolor=white:fontsize=64:borderw=4:bordercolor=black:"
                  f"x=(w-text_w)/2:y=h*0.12")
    cmd = ["ffmpeg", "-y", "-i", a.input]
    if vf:
        cmd += ["-vf", ",".join(vf)]
    if p["speed"] != 1.0:
        cmd += ["-af", f"atempo={p['speed']}"]
    run(cmd + ["-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-c:a", "aac",
               "-pix_fmt", "yuv420p", "-movflags", "+faststart", a.output])
    print(f"wrote {a.output} (preset {a.preset})")


def cmd_loudness(a):
    run(["ffmpeg", "-y", "-i", a.input, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:v", "copy",
         "-c:a", "aac", "-b:a", "160k", a.output])
    print(f"wrote {a.output} (normalized to about -14 LUFS)")


def check_license(path):
    """Every entry needs a source, a license and a url or file. Returns a list of problems."""
    try:
        data = json.load(open(path))
    except (OSError, ValueError) as e:
        return [f"license file unreadable: {e}"]
    items = data.get("items") if isinstance(data, dict) else None
    if not items:
        return ["license file has no items"]
    problems = []
    for i, it in enumerate(items):
        name = it.get("name", f"item {i}")
        if not it.get("source"):
            problems.append(f"{name}: missing source")
        if str(it.get("license", "")).strip().lower() in BAD_LICENSES:
            problems.append(f"{name}: missing or disallowed license")
        if not (it.get("url") or it.get("file")):
            problems.append(f"{name}: missing url or file")
    return problems


def cmd_check(a):
    info = probe(a.video)
    v = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
    has_audio = any(s["codec_type"] == "audio" for s in info["streams"])
    results = {}
    if v is None:
        sys.exit("no video stream")
    dur = float(info["format"]["duration"])
    results["resolution"] = (f"{v['width']}x{v['height']}", (v["width"], v["height"]) == (W, H))
    results["duration"] = (f"{dur:.1f}s", 1 <= dur <= a.max_seconds)

    bd = run(["ffmpeg", "-i", a.video, "-vf", "blackdetect=d=0.5:pix_th=0.1", "-an", "-f", "null", "-"],
             capture=True).stderr
    black = len(re.findall(r"black_start", bd))
    results["black_frames"] = (f"{black} stretches", black == 0)
    fz = run(["ffmpeg", "-i", a.video, "-vf", "freezedetect=n=-60dB:d=2", "-an", "-f", "null", "-"],
             capture=True).stderr
    frozen = len(re.findall(r"freeze_start", fz))
    results["frozen"] = (f"{frozen} stretches", frozen == 0)

    if has_audio:
        ln = run(["ffmpeg", "-i", a.video, "-af", "ebur128=peak=true", "-vn", "-f", "null", "-"],
                 capture=True).stderr
        lufs = re.findall(r"I:\s+(-?\d+\.?\d*) LUFS", ln)
        peak = re.findall(r"Peak:\s+(-?\d+\.?\d*) dBFS", ln)
        if lufs:
            i = float(lufs[-1])
            results["loudness"] = (f"{i} LUFS", -18 <= i <= -10)
        if peak:
            results["clipping"] = (f"{peak[-1]} dBFS peak", float(peak[-1]) < -0.1)
    else:
        results["audio"] = ("no audio track", False)

    if a.license:
        probs = check_license(a.license)
        results["license"] = ("ok" if not probs else "; ".join(probs), not probs)
    else:
        results["license"] = ("no license file given", False)

    ok = all(r[1] for r in results.values())
    for k, (val, good) in results.items():
        print(f"{'PASS' if good else 'FAIL'}  {k}: {val}")
    print("RESULT:", "PASS" if ok else "FAIL")
    sys.exit(0 if ok else 1)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("reframe")
    r.add_argument("input"); r.add_argument("output")
    r.add_argument("--mode", choices=["blur", "crop"], default="blur")
    r.add_argument("--start", type=float); r.add_argument("--duration", type=float)
    r.set_defaults(fn=cmd_reframe)
    s = sub.add_parser("style")
    s.add_argument("input"); s.add_argument("output")
    s.add_argument("--preset", required=True); s.add_argument("--text")
    s.set_defaults(fn=cmd_style)
    ln = sub.add_parser("loudness")
    ln.add_argument("input"); ln.add_argument("output")
    ln.set_defaults(fn=cmd_loudness)
    c = sub.add_parser("check")
    c.add_argument("video"); c.add_argument("--license")
    c.add_argument("--max-seconds", type=float, default=60)
    c.set_defaults(fn=cmd_check)
    pr = sub.add_parser("presets")
    pr.set_defaults(fn=lambda a: [print(f"{k}: {v}") for k, v in PRESETS.items()])
    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
