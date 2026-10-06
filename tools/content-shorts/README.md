# Shorts toolkit

Edits video files you supply into vertical shorts in your style, and checks them before the Content Reviewer sees them. Standard library Python plus ffmpeg.

```sh
python3 shorts.py reframe in.mp4 vert.mp4 --mode blur --duration 45   # 1080x1920, blurred fill or crop
python3 shorts.py style vert.mp4 styled.mp4 --preset punchy --text "Hook text"
python3 shorts.py loudness styled.mp4 final.mp4                       # about -14 LUFS
python3 shorts.py check final.mp4 --license license.json              # exit 0 only if every check passes
python3 shorts.py presets
```

Edit `PRESETS` in `shorts.py` to add your own style (an ffmpeg filter string and a speed).

## What `check` verifies

Resolution 1080x1920, duration within the limit, no black or frozen stretches, loudness between -18 and -10 LUFS, no clipping, an audio track, and a valid license file.

## License file

```json
{"items": [{"name": "clip1", "source": "Pexels", "license": "Pexels License", "url": "https://..."}]}
```

Every item needs a `source`, a `license` (not "unknown" or "all rights reserved"), and a `url` or `file`. The `check` fails without one. The `content-pipeline` skill makes this a hard gate for the Content Reviewer.

## Scope

This toolkit edits and checks files. It does not download videos or publish anything. What footage you feed it, and whether you have the right to use it, is your responsibility. Reposting videos you don't have rights to risks strikes, demonetization, or removal on every platform.

Tested on synthetic video only (reframe, style, loudness, and the pass and fail cases of `check`). It has not been run on real footage, and the `--text` overlay depends on your ffmpeg having drawtext support.
