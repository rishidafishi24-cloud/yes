#!/usr/bin/env python3
"""Mix a music track under a video's audio, lowering the music while there is speech.

  mix_music.py IN_VIDEO MUSIC OUT [--music-db -18]

The music loops to the video's length. If the video has no audio, only the music is used.
Record the music track's source and license in the license file yourself (see sources.py add).
"""
import argparse
import json
import subprocess
import sys


def has_audio(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries",
                          "stream=index", "-of", "json", path], capture_output=True, text=True).stdout
    return bool(json.loads(out or "{}").get("streams"))


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("video"); p.add_argument("music"); p.add_argument("output")
    p.add_argument("--music-db", type=float, default=-18.0)
    a = p.parse_args()
    music = f"[1:a]volume={a.music_db}dB[m]"
    if has_audio(a.video):
        fc = (f"[0:a]asplit[v1][v2];{music};"
              "[m][v2]sidechaincompress=threshold=0.04:ratio=10:attack=20:release=400[duck];"
              "[v1][duck]amix=inputs=2:duration=first:normalize=0[a]")
    else:
        fc = f"{music};[m]anull[a]"
    cmd = ["ffmpeg", "-y", "-i", a.video, "-stream_loop", "-1", "-i", a.music, "-filter_complex", fc,
           "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", a.output]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        sys.exit(f"mix failed:\n{res.stderr[-1500:]}")
    print(f"wrote {a.output}")


if __name__ == "__main__":
    main()
