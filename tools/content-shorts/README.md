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

## Batch runner

```sh
python3 batch.py batch.json     # baseline v0 plus one-change variants, each checked
```

`batch.json` names the input, the license file, a baseline, and exactly one parameter to vary (`preset`, `mode`, `text`, `captions`, `music`, `start`, or `duration`). It writes `vN.mp4`, a variant record `vN.json` (what changed, tools, settings, check results), `index.json`, and `pick_template.md`. Attach the videos and the filled-in pick template to a Paperclip issue; your picks and reasons there feed the Learning packet.

## Captions, music, sources

```sh
python3 captions.py auto in.mp4 out.mp4            # whisper transcribe, then burn in
python3 captions.py burn in.mp4 subs.srt out.mp4   # burn an existing .srt
python3 mix_music.py in.mp4 track.mp3 out.mp4      # music under the audio, ducked during speech
python3 sources.py search pexels "ocean waves"     # also: pixabay, nasa, archive
python3 sources.py get pexels "ocean waves" --index 0 --out clip.mp4 --license license.json
python3 sources.py add license.json --name N --source S --license L --url U
```

`get` downloads the clip and records its license entry. Pexels and Pixabay need free API keys in `PEXELS_API_KEY` and `PIXABAY_API_KEY`. The Internet Archive search only returns items that declare a public domain, CC0, or CC BY license. CC BY needs credit to the author.

## What `check` verifies

Resolution 1080x1920, duration within the limit, no black or frozen stretches, loudness between -18 and -10 LUFS, no clipping, an audio track, and a valid license file.

## License file

```json
{"items": [{"name": "clip1", "source": "Pexels", "license": "Pexels License", "url": "https://..."}]}
```

Every item needs a `source`, a `license` (not "unknown" or "all rights reserved"), and a `url` or `file`. The `check` fails without one. The `content-pipeline` skill makes this a hard gate for the Content Reviewer.

## Scope

This toolkit edits and checks files. The only downloading it does is `sources.py get`, which fetches footage from the four licensed sources above and records the license. It does not scrape other videos and it does not publish anything. What footage you feed it, and whether you have the right to use it, is your responsibility. Reposting videos you don't have rights to risks strikes, demonetization, or removal on every platform.

## Test status

Tested on synthetic video: reframe, style, loudness, `check` pass and fail cases, batch runs (a preset variant and a music variant), the caption burn-in, and music mixing. The source parsers were tested against fixture data written from the providers' documented response shapes, **not against the live APIs**. Whisper transcription (`transcribe`, `auto`, and `captions: true` in a batch) was **not run**, because it needs to download a model and the test environment blocked that. None of it has run on real footage. `--text` and captions need an ffmpeg build with drawtext and libass support.
