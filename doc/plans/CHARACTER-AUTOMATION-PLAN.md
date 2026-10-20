# CHARACTER + VTUBER AUTOMATION — plan for the channel network (yes repo, branch ai-learning)

For: the `business` agent and every weak model working on the channel network.
Written 2026-10-20. Project: CHANNEL NETWORK ONLY. Never read or write the game, lab, animation,
trading or Godot repos. If the owner wants art from the animation project, the OWNER copies the file
by hand into this repo.

Owner decisions (2026-10-20):
- Use: AUTO VIDEOS (script in → finished video out, nobody performs) + SHORTS cut from them.
  No live streams for now.
- Style: ALL THREE, tested against each other: 2D PNG-tuber, 2D cut-out rig (Live2D-like), 3D anime
  (VRoid / VRM). The style itself is an experiment variable.
- Voice: DEPENDS ON THE CHANNEL. Free AI voice (disclosed) or an invented persona voice, or the
  owner's own voice on 1–2 channels. Never a real person's voice.
- Budget $0. Every download or install needs the owner's yes (exact name, size, licence).

Where it fits in the channel plan: this is PHASE 1.5. It starts after the toolkit fixes C-T1…C-T6
are done (it needs C-T4's 1920x1080 profile and C-T6's caption fix), and before the AI-news and
persona channels make their test videos. The sleep/ambient channel does not need a character and can
go ahead without this.

---------------------------------------------------------------------------------------------------

## PART 0 — The whole idea in one picture

```
episode.json  (the script: lines, who says them, emotion, which lines become shorts)
    │
    ├─ 1. VOICE      voice.py      → audio/line_001.wav … + full.wav     (Kokoro AI voice OR owner records)
    ├─ 2. LIP-SYNC   lipsync.py    → mouth/line_001.json …               (Rhubarb Lip Sync: mouth shapes + times)
    ├─ 3. PUPPET     puppet2d.py   → render/character.mp4                (PNG-tuber or cut-out rig, Python)
    │                vrm-render/   → render/character.mp4                (3D VRM model, Node + headless browser)
    ├─ 4. COMPOSE    compose.py    → render/final_long.mp4               (captions from the script, "AI voice" tag, music)
    ├─ 5. SHORTS     shorts_cut.py → render/short_01.mp4 …               (vertical 1080x1920, ≤ 60 s)
    └─ 6. CHECK      shorts.py check (existing) + charcheck.py + render log checks → PASS/FAIL
                     → owner watches → owner uploads (agents never upload)
```
One command at the end (ticket CH-9): `python make_episode.py episodes/<name>/episode.json`.

Why this design:
- Every step is a plain program with a file in and a file out. A weak model builds and tests ONE step
  at a time; each step has a check that needs no AI.
- No AI is needed to MOVE the character: the mouth comes from the audio (Rhubarb), blinks and
  breathing come from simple maths. So it is free, repeatable and never "melts" like AI video.
- AI is used only where it is cheap and safe: the voice (Kokoro, local, free) and, optionally, a
  starting picture for the 2D art that the owner fixes by hand.

---------------------------------------------------------------------------------------------------

## PART 1 — The tools (all free; licences checked 2026-10-20)

| Tool | What it does | Licence | Runs on | Install (owner says yes first) |
|---|---|---|---|---|
| Python 3.10–3.12 + ffmpeg | glue, image compositing, video encoding | free | PC | already planned in Phase 0 |
| Pillow (Python) | draws the 2D character frames | HPND (free) | CPU | `pip install pillow` |
| Kokoro (`kokoro` on PyPI, model hexgrad/Kokoro-82M) | AI voice from text, local, many built-in voices | Apache-2.0 | CPU is fine | `pip install kokoro soundfile`; first run downloads the model (about 330 MB) |
| Rhubarb Lip Sync | listens to a .wav and outputs mouth shapes A–H, X with times | MIT (output belongs to you) | CPU | Windows zip from github.com/DanielSWolf/rhubarb-lip-sync/releases |
| VRoid Studio (pixiv) | free app to MAKE a 3D anime character, exports `.vrm` | free app; you set your model's own terms | PC (Windows) | from vroid.com or Steam |
| @pixiv/three-vrm 3.5.5 + three.js | loads and poses a `.vrm` in a web page | MIT | browser | `npm install` in `tools/character/vrm-render/` |
| playwright-core | drives the browser to render frames | Apache-2.0 | PC | `npm install playwright-core` — use the INSTALLED Edge (`channel: 'msedge'`), no browser download |
| Inochi2D (Creator/Session) | open-source Live2D-style rigging + live tracking | BSD-2-Clause | PC | NOT needed now (it is for live streaming). Our cut-out rig (Part 5) does the auto-video job. Keep as a later option. |

NOT used, and why:
- AI "talking head" video tools (SadTalker, LivePortrait, Hallo, etc.): they need an NVIDIA GPU (the
  owner has an AMD RX 580), several have non-commercial parts, and they often make faces melt. Our
  rig is free, stable and owned by us.
- Paid VTuber apps, Live2D Cubism Pro, voice cloning services: cost money or clone voices.
- Any real person's face, voice or likeness: never.

---------------------------------------------------------------------------------------------------

## PART 2 — Rules for every ticket here (on top of the channel plan's rules)

1. One ticket = one step of the pipeline. Files only in `tools/character/` and `episodes/`, plus the
   ticket's tests. Never edit `tools/content-shorts/*` here except to CALL it (C-T tickets fix it).
2. ORACLE FIRST. Every ticket starts by running its check and pasting the raw output (it should fail
   or not exist yet), and ends by pasting it passing.
3. Tests: stdlib `unittest` in `tools/character/tests/test_*.py`, run with
   `python -m unittest discover -s tools/character/tests -v`. Tests make their own tiny fake inputs
   (a 1-second sine-wave .wav, 64x64 coloured PNG layers) — never depend on a real model download.
   Tests that need Kokoro, Rhubarb or a browser are marked and skipped with a clear message when the
   tool is missing: `@unittest.skipUnless(shutil.which("rhubarb"), "rhubarb not installed")`.
4. Use `sys.executable` to call Python from Python (never `python3` — Windows). Use
   `shutil.which("ffmpeg")` and fail with a clear message if missing.
5. Repeatable: the same episode.json + same seed → the same video. Blinks and idle motion use a
   seeded random (`random.Random(seed)`), never the time of day.
6. Never invent a voice name, a VRM expression name or a command flag. LIST them first
   (`python -c "..."` to list Kokoro voices; `rhubarb --help`; read the VRM file's expression list)
   and paste the list. Guessing = invented-API.
7. Weak models never judge how the character LOOKS or SOUNDS. They paste numbers, file paths and
   check results. The owner watches and decides.
8. Disclosure: if the voice is AI, the video shows a small "AI voice" tag for the first 5 seconds and
   the description file says it. The persona is presented as an original animated character, never
   as a real human.
9. No mass spam: the pipeline makes it easy to make 100 videos; the channel rules still say each
   video needs a real script with real value and the owner's approval. Same template + different
   words over and over is what YouTube demonetizes as "inauthentic/mass-produced".
10. Two failed attempts → stop and ask. Log the failure label in the routing log.

---------------------------------------------------------------------------------------------------

## PART 3 — Folders and file formats (copy exactly)

```
tools/character/
  requirements.txt          # pillow, kokoro, soundfile — pinned versions, added in CH-0
  charcheck.py              # checks a character folder (2D) or a .vrm file (3D)
  voice.py                  # step 1
  lipsync.py                # step 2
  puppet2d.py               # step 3 for png + cutout styles
  vrm-render/               # step 3 for the vrm style (Node)
    package.json  render.mjs  page.html  page.mjs
  compose.py                # step 4
  shorts_cut.py             # step 5
  make_episode.py           # all steps in order
  tests/
characters/<name>/          # one folder per character (any style)
  character.json
  (2D) layers/*.png   (3D) model.vrm
  LICENSE.json              # where every file came from
episodes/<name>/
  episode.json
  audio/  mouth/  render/   # made by the tools (render/ is git-ignored: videos are big)
  upload/description.txt    # made by compose.py for the owner to paste
```

### 3.1 character.json
```json
{
  "name": "Nova",
  "style": "png",                    // "png" | "cutout" | "vrm"
  "seed": 7,
  "voice": { "type": "kokoro", "voice_id": "<from the listed voices>", "speed": 1.0 },
  // or: "voice": { "type": "owner" }
  "canvas": [1024, 1024],            // 2D only: the size of every layer PNG
  "fps": 30,
  "framing": {
    "long":  { "x": 0.70, "y": 1.00, "height": 0.95, "anchor": "bottom" },   // where the character sits on a 1920x1080 frame (fractions)
    "short": { "x": 0.50, "y": 1.00, "height": 0.62, "anchor": "bottom" }    // on 1080x1920
  },
  "idle": { "bob_px": 6, "bob_seconds": 3.2, "breath_scale": 0.012, "blink_every": [2.0, 6.0], "blink_frames": 4 },
  "talk": { "bounce_px": 3, "head_tilt_deg": 2.5 },
  "emotions": ["neutral", "happy", "sad", "angry", "surprised"],
  "rest_pose": { "arm_down_rad": 1.2 }                                       // vrm only, see Part 6
}
```

### 3.2 episode.json
```json
{
  "channel": "ai-news",
  "character": "characters/nova",
  "title": "3 AI tools that changed this week",
  "background": "assets/bg/studio_01.png",       // licensed image, 1920x1080 (a 1080x1920 one for shorts)
  "music": null,                                  // or a licensed track listed in the licence file
  "seed": 1,
  "lines": [
    { "id": "001", "text": "Hi, I'm Nova. Three AI tools changed this week.", "emotion": "happy", "short": "s1" },
    { "id": "002", "text": "First up ...", "emotion": "neutral", "short": "s1" },
    { "id": "003", "text": "...", "emotion": "surprised" }
  ],
  "sources": ["https://… (real link for every news claim)"]
}
```
`"short": "s1"` = this line belongs to short number 1. A short is all lines with the same tag, in
order, and must be ≤ 60 seconds of audio.

---------------------------------------------------------------------------------------------------

## PART 4 — Step by step, with exact behaviour

### Step 1 — VOICE (`voice.py`, ticket CH-2)
`python voice.py episodes/<name>/episode.json`
- Kokoro mode (`voice.type == "kokoro"`):
  1. Before writing code: list the installed voices and paste them (read the Kokoro package/README for
     how; do not guess the names). Pick only from that list. The owner listens to 3 and picks one per
     character (this IS the channel plan's free voice test, C8).
  2. For each line: make `audio/line_<id>.wav` (mono, 24 kHz is what Kokoro gives; keep it), at
     `voice.speed`.
  3. Join all lines into `audio/full.wav` with 0.35 s of silence between lines; write
     `audio/timing.json`: `[{ "id": "001", "start": 0.0, "end": 2.84 }, ...]` (seconds in full.wav).
  - Invented persona voice: if the installed Kokoro can mix two built-in voices (check its docs; do
    not guess), the persona may use a fixed mix (e.g. 60% voice A + 40% voice B) saved in
    character.json. This makes a voice no real person has. If mixing is not supported, use one voice
    with a fixed speed.
- Owner mode (`voice.type == "owner"`):
  1. `voice.py` writes `audio/RECORD-THESE.txt` listing every line with its id, and STOPS with
     `WAITING FOR OWNER RECORDINGS: 0/<n>`.
  2. The owner records each line (Audacity is free) as `audio/line_<id>.wav`, mono.
  3. Running `voice.py` again checks them and builds `full.wav` + `timing.json` as above.
- Checks (exit 1 with `FAIL voice: <reason>` if any fails; else first line `PASS voice`):
  every line has a .wav; each lasts ≥ 0.3 s; peak level ≤ -1 dBFS (no clipping); no silent gap
  longer than 1.5 s inside a line; `timing.json` covers `full.wav` within 0.05 s.

### Step 2 — LIP-SYNC (`lipsync.py`, ticket CH-3)
`python lipsync.py episodes/<name>/episode.json`
- For each line: write the line's text to `mouth/line_<id>.txt`, then run
  `rhubarb -f json --dialogFile mouth/line_<id>.txt -o mouth/line_<id>.json audio/line_<id>.wav`
  (paste `rhubarb --help` first and use only flags it lists). The dialog file makes it more exact
  because Rhubarb knows the words.
- Then shift every line's cues by that line's `start` from `timing.json` and save one file
  `mouth/all.json`: `[{ "start": 0.00, "end": 0.12, "shape": "X" }, ...]` covering the whole of
  full.wav (fill gaps between lines with `"X"`).
- The 9 mouth shapes (these decide what the artist draws — Part 5.2):
  | Shape | Mouth | Sounds |
  |---|---|---|
  | A | closed, lips pressed | M, B, P |
  | B | slightly open, teeth almost together | most consonants: K, S, T, EE |
  | C | open | EH (men), AE (bat) |
  | D | wide open | AA (father) |
  | E | slightly rounded | AO (off), ER (bird) |
  | F | puckered small round | OO (you), OW (show), W |
  | G | upper teeth on lower lip | F, V |
  | H | tongue up behind top teeth, mouth open | long L |
  | X | relaxed rest, closed | silence |
  If the character only has A–F + X drawn, run Rhubarb with its option that limits extended shapes to
  X (read `--help` for the exact flag) so G and H never appear.
- Checks: `mouth/all.json` starts at 0 and ends within 0.1 s of full.wav's length; no gaps or
  overlaps; every shape is one the character has; during speech (inside a line's start–end) at least
  one non-X shape per second on average. First line `PASS lipsync` or `FAIL lipsync: <reason>`.

### Step 3a — 2D PUPPET (`puppet2d.py`, tickets CH-4 png and CH-6 cutout)
`python puppet2d.py episodes/<name>/episode.json --format long|short`
For frame i (time t = i / fps) from 0 to the end of full.wav + 0.5 s:
1. mouth = the shape in `mouth/all.json` at time t. To avoid flicker, a shape must last at least
   2 frames; if a cue is shorter, keep the previous shape.
2. blink: blink times are made once from `random.Random(seed)`: next blink after a random gap in
   `idle.blink_every` seconds. A blink is `blink_frames` frames: half-closed, closed, closed,
   half-closed (use `eyes_half` if drawn, else closed).
3. idle bob: vertical offset `bob_px * sin(2π t / bob_seconds)`; breathing: body scale y
   `1 + breath_scale * sin(2π t / bob_seconds)` (cut-out only, on the body layer).
4. while talking (mouth ≠ X): extra bounce `talk.bounce_px * |sin(2π t * 2.5)|` upward, and (cut-out
   only) head tilt `talk.head_tilt_deg * sin(2π t * 0.7)` degrees around the neck pivot.
5. emotion: the line's emotion picks the `brows_<emotion>` and (if drawn) `eyes_<emotion>` layers;
   fall back to neutral if a layer is missing.
6. draw: background (scaled to fill), then the character layers in order (Part 5) placed using
   `framing.<format>`. Write the frame's raw RGB bytes into ffmpeg's stdin:
   `ffmpeg -y -f rawvideo -pix_fmt rgb24 -s <W>x<H> -r <fps> -i - -i audio/full.wav -c:v libx264 -pix_fmt yuv420p -crf 18 -c:a aac -shortest render/character_<format>.mp4`
   (no frame folders on disk — they would fill the disk).
7. Also write `render/render_log_<format>.json`: one entry per frame `{ "i": 0, "mouth": "X", "eyes": "open", "emotion": "neutral" }`.
Checks (CH-4/CH-6 tests, with tiny fake layers): frame count = round((audio + 0.5) × fps) ± 1; every
logged mouth equals the cue at that frame's time (allowing the 2-frame rule); blinks happen at least
once every 6 s; the output has an audio stream (ffprobe); the same seed gives the same log.

### Step 3b — 3D VRM PUPPET (`vrm-render/`, ticket CH-8)
`node tools/character/vrm-render/render.mjs episodes/<name>/episode.json --format long|short`
1. `render.mjs` starts a tiny local static server for `page.html` + `page.mjs` + the model, then opens
   it with `playwright-core` using `chromium.launch({ channel: 'msedge' })` (installed Edge; no
   download). Window size = the output size.
2. `page.mjs` loads three.js + `@pixiv/three-vrm` (pinned versions; read three-vrm's
   peerDependencies with `npm view @pixiv/three-vrm@3.5.5 peerDependencies` and pin a matching three),
   loads `model.vrm` with `GLTFLoader` + the `VRMLoaderPlugin` (read the three-vrm README example
   for the exact lines — do not guess), and sets the background image as `scene.background`.
3. Lights: one directional light (warm, from front-left above), one hemisphere light. Camera: bust
   shot for long (head + shoulders + chest), knees-up for short.
4. The page exposes `window.renderFrame(i)`. NO real-time clock: Node calls `renderFrame(0)`,
   `renderFrame(1)`, … IN ORDER (hair/cloth "spring bones" depend on the previous frame), each time:
   - set mouth expressions from the Rhubarb shape (use the VRM's vowel expressions):
     | Rhubarb | aa | ih | ou | ee | oh |
     |---|---|---|---|---|---|
     | A, X | 0 | 0 | 0 | 0 | 0 |
     | B | 0 | 0.5 | 0 | 0 | 0 |
     | C | 0.3 | 0 | 0 | 0.6 | 0 |
     | D | 1.0 | 0 | 0 | 0 | 0 |
     | E | 0 | 0 | 0 | 0 | 0.8 |
     | F | 0 | 0 | 0.9 | 0 | 0 |
     | G | 0 | 0.3 | 0 | 0 | 0 |
     | H | 0.4 | 0 | 0 | 0 | 0 |
     Move each value toward its target by 50% per frame (smooth, no snapping).
   - blink expression from the same seeded blink schedule as 2D; emotion expression (happy, sad,
     angry, surprised, relaxed — only names the model actually has; list them first) at 0.6 strength
     during that line, easing in over 6 frames.
   - idle: small sine sway on spine/neck/head bones (≤ 2 degrees), breathing on chest (≤ 1 degree).
   - arms down: VRoid models stand in a T-pose. Rotate both upper arms down by
     `rest_pose.arm_down_rad` (start 1.2). The SIGN differs per side and per model — do not guess:
     the oracle below decides.
   - eyes look at the camera (three-vrm's lookAt target = the camera).
   - `vrm.update(1 / fps)` then render.
   Node then takes `page.screenshot({ type: 'jpeg', quality: 92 })` and writes the bytes into
   `ffmpeg -y -f image2pipe -framerate <fps> -i - -i audio/full.wav -c:v libx264 -pix_fmt yuv420p -crf 18 -c:a aac -shortest render/character_<format>.mp4`.
5. Also writes `render_log_<format>.json` like 2D, plus per frame the world height of the hands and
   shoulders.
Oracles (model-free): the VRM check (CH-7) passes; frame count right; render log mouth matches cues;
ARMS-DOWN CHECK: in every frame both hands are at least 0.3 m below their shoulders (from the log) —
this is how the sign of `arm_down_rad` is settled; the video has audio. Software rendering is slow:
expect several minutes per minute of video; that is fine for a batch job.

### Step 4 — COMPOSE (`compose.py`, ticket CH-5)
`python compose.py episodes/<name>/episode.json --format long`
1. Captions WITHOUT Whisper: we already know the words and the times. For each line, split the text
   into chunks of at most 7 words (do not split numbers or names in the middle); give each chunk a
   share of the line's time in proportion to its number of letters; write `render/captions.srt`.
   Burn them with the existing `tools/content-shorts/captions.py burn` (after C-T6).
2. "AI voice" tag (Kokoro voices only): small text, top-left, white with a dark outline, shown for
   the first 5 seconds (ffmpeg drawtext with `enable='lt(t,5)'`).
3. Music: only if `episode.music` is set AND listed in the licence file: use the existing
   `mix_music.py` (it ducks under speech).
4. Loudness: the existing `shorts.py loudness`.
5. Write `upload/description.txt`: title, a 2–3 sentence summary written by the agent from the script,
   every source link from `episode.sources`, the credits that CC BY items need, and the disclosure:
   "Voice: AI-generated (Kokoro). Nova is an original animated character." (or "Voice: <owner's
   channel name>" for the owner's voice).
6. Final check with the existing `shorts.py check` using the long-video profile from C-T4 (1920x1080)
   or the shorts profile (1080x1920, ≤ 60 s), plus `--license`.

### Step 5 — SHORTS (`shorts_cut.py`, ticket CH-11)
For each short tag: render the character again in `--format short` (vertical framing — do NOT crop
the long video; a re-render looks much better), only for that short's lines (re-time the audio and
cues so they start at 0), compose with a 1080x1920 background, captions bigger and centred in the
lower third, check with the shorts profile.

### Step 6 — ONE COMMAND (`make_episode.py`, ticket CH-9)
Runs steps 1→5 in order, stops at the first FAIL, prints each step's first line, ends with
`EPISODE READY: render/final_long.mp4 + <n> shorts — waiting for owner review` or
`EPISODE FAIL at <step>: <reason>`. It never uploads anything.

---------------------------------------------------------------------------------------------------

## PART 5 — HOW TO MAKE THE 2D CHARACTER ART (very exact — the owner or an artist follows this)

### 5.1 The one golden rule that makes it automatable
EVERY layer is a PNG of EXACTLY the same size (`canvas`, 1024 × 1024), transparent (alpha 0)
everywhere except its own part, already in the right place. Then layers just stack — no offsets, no
positions to guess. `charcheck.py` enforces this.

### 5.2 PNG-tuber layer list (style "png") — 10 files minimum
Order from back to front:
```
layers/body.png            # the whole character WITHOUT eyes and mouth (face skin drawn, no features)
layers/eyes_open.png
layers/eyes_half.png       # optional (blinks look smoother with it)
layers/eyes_closed.png
layers/brows_neutral.png   # optional; brows_happy, brows_sad, brows_angry, brows_surprised optional
layers/mouth_A.png  mouth_B.png  mouth_C.png  mouth_D.png  mouth_E.png  mouth_F.png  mouth_X.png
layers/mouth_G.png  mouth_H.png   # optional (see Step 2)
```
Drawing spec:
- Bust shot: top of the hair about 6% from the top of the canvas, the character fills the width to
  about 70%, the bottom of the canvas cuts through the chest (the bottom edge may be cut; the sides
  and top must not touch the edge).
- Line art: one colour, dark (not pure black: e.g. `#2b2233`), even width about 6 px at 1024 size.
- Colours: flat fills + ONE shadow tone per colour (cel shading), shadow light coming from top-left.
  Max 12 colours in the whole character (the persona's palette, written in character.json notes).
- Mouths: all 9 drawn in the SAME place, same size, matching the shape table in Step 2. Draw each
  mouth so it fully covers the "no mouth" face area under it (the face in body.png has no mouth, so
  any mouth layer can sit on top).
- Eyes: open / half / closed drawn in the same place; closed = a curved line (happy arc downward).
- Anime but NOT AI-looking: same rules as the animation project's art checks — clean consistent
  lines, a limited palette, no extra fingers, no melted details, no random texture noise, symmetrical
  eyes. The owner judges.

### 5.3 Cut-out rig (style "cutout") — Live2D-like, still automatable
Same golden rule, but the body is split so parts can rotate:
```
layers/hair_back.png  layers/body.png  layers/arm_L.png  layers/arm_R.png  layers/head.png
layers/eyes_*.png  layers/brows_*.png  layers/mouth_*.png  layers/hair_front.png  layers/hair_side_L.png  layers/hair_side_R.png
```
Plus `rig.json` (pivots in canvas pixels; each part rotates/moves around its pivot and follows its
parent):
```json
{
  "parts": {
    "body":        { "pivot": [512, 900], "parent": null,   "breath": true },
    "head":        { "pivot": [512, 560], "parent": "body", "tilt": true },
    "hair_back":   { "pivot": [512, 300], "parent": "head", "sway": { "deg": 2.0, "lag": 0.15 } },
    "hair_front":  { "pivot": [512, 260], "parent": "head", "sway": { "deg": 1.5, "lag": 0.10 } },
    "hair_side_L": { "pivot": [380, 330], "parent": "head", "sway": { "deg": 3.0, "lag": 0.20 } },
    "hair_side_R": { "pivot": [644, 330], "parent": "head", "sway": { "deg": 3.0, "lag": 0.20 } },
    "arm_L":       { "pivot": [400, 700], "parent": "body", "swing": { "deg": 2.0, "seconds": 3.2 } },
    "arm_R":       { "pivot": [624, 700], "parent": "body", "swing": { "deg": 2.0, "seconds": 3.4 } },
    "eyes_*": { "parent": "head" }, "brows_*": { "parent": "head" }, "mouth_*": { "parent": "head" }
  }
}
```
Art rules for cut-out: draw a little EXTRA under every joint (the neck continues 40 px under the head,
the shoulders continue under the arms, hair continues under the head) so no gaps open when parts
rotate up to ±5 degrees. Sway = the hair follows the head's tilt but late (`lag` seconds) and by its
own `deg` — that is what makes it feel alive.
The pivots are the only "rigging" work: the owner (or a T3 model looking at the art) sets them once.
Oracle: render frames with the head tilted to +5 and −5 degrees; `charcheck.py --rig` measures that
no transparent hole appears inside the character's outline (compare the alpha mask at 0 degrees
with ±5 degrees: holes = pixels inside the 0-degree outline that become transparent).

### 5.4 Where the 2D art comes from (choose per character)
1. The owner draws it (any free app: Krita is free).
2. The owner copies a character sheet made in the animation project (by hand — projects stay
   separate) and cuts it into layers.
3. A free AI image tool makes a STARTING picture, then the owner fixes it and cuts it into layers.
   The owner checks that tool's terms allow commercial use. Prompt template:
   ```
   SUBJECT: original anime character "<name>", <age range adult>, <hair colour + style>, <eye colour>,
            <outfit in 1 line>, <one memorable detail>
   VIEW: front view, bust shot (head to mid-chest), facing camera, centred
   POSE: neutral, shoulders relaxed, mouth closed, eyes open
   LINES: clean even dark outline, cel shading with one shadow tone
   COLOUR: flat colours, palette: <5–8 hex codes>
   BACKGROUND: plain flat white, no props, no text
   AVOID: realistic, painterly, gradients, extra fingers, text, watermark, copying any existing character
   ```
   Then make the mouth, eye and brow versions by hand (AI tools rarely keep the face identical
   between images — that is why the owner draws the variants on top of ONE picture).
4. Never trace or copy an existing character, VTuber or person.

### 5.5 `charcheck.py` (ticket CH-1) — exact checks for a 2D character folder
First output line `PASS charcheck` or one `FAIL charcheck: <file>: <reason>` per problem; exit 0/1/2
(2 = bad arguments).
1. character.json has every field in 3.1 for its style.
2. required layers exist (5.2 or 5.3 list); every PNG is RGBA and exactly `canvas` size.
3. every layer has some visible pixels (alpha > 16) and the four 8x8 corners are fully transparent.
4. all mouth layers' visible areas overlap each other (same place): the bounding boxes of mouth_A …
   mouth_X all overlap the bounding box of mouth_X by at least 50%.
5. same for eyes_open / eyes_closed (and eyes_half).
6. `body.png`'s visible area touches neither the left, right nor top edge (2-pixel border).
7. cutout only: rig.json parts match the layer files; every pivot is inside the canvas; parents exist;
   no loops.
8. LICENSE.json lists every file with source, licence and who made it.
Tests make tiny 64x64 fake layers in a temp folder: one good set → PASS; then one test per rule
that breaks exactly that rule → FAIL with that reason.

---------------------------------------------------------------------------------------------------

## PART 6 — HOW TO MAKE THE 3D CHARACTER (VRoid Studio, exact steps for the owner)

1. Install VRoid Studio (free; owner says yes). New character → pick a base.
2. Design an ORIGINAL persona: change face shape, eyes, hair (use the hair tool, not downloaded
   hair presets from other people unless their licence allows it), outfit colours to the persona's
   palette (5–8 colours, same idea as 5.2). Do not copy a known anime character or VTuber.
3. Look check inside VRoid: front, 3/4, side. Hair must not cover the eyes from the front camera
   (the mouth and eyes are the whole performance).
4. Export → VRM, version VRM 1.0 if offered (three-vrm reads 0.x and 1.0; 1.0 preferred).
   Export settings: reduce polygons so the model is under 70,000 triangles; texture atlas 2048.
   Fill in the model info: author = the owner's channel name; set usage permissions so the OWNER may
   use it commercially (it is their own model).
5. Save as `characters/<name>/model.vrm` and add it to `characters/<name>/LICENSE.json`
   (`"source": "made by owner in VRoid Studio"`).
6. Run `python charcheck.py characters/<name>` → must PASS the VRM checks (CH-7):
   - the file is a valid GLB (magic `glTF`, version 2, length matches the file size);
   - the JSON chunk has the VRM extension (`VRMC_vrm` for 1.0 or `VRM` for 0.x);
   - humanoid bones present: hips, spine, chest, neck, head, leftUpperArm, leftLowerArm, leftHand,
     rightUpperArm, rightLowerArm, rightHand, leftUpperLeg, leftLowerLeg, leftFoot, rightUpperLeg,
     rightLowerLeg, rightFoot;
   - expressions present: aa, ih, ou, ee, oh, blink (VRM 0.x names A, I, U, E, O, Blink are mapped);
     report the emotion ones found (happy, angry, sad, relaxed, surprised);
   - triangles ≤ 70,000; file ≤ 40 MB.
   The check prints the found bones and expressions raw so the agent never guesses names.

---------------------------------------------------------------------------------------------------

## PART 7 — Voices per channel (the "depends" answer, as data)

| Channel | Character | Voice | Why |
|---|---|---|---|
| Sleep / ambient | none (or a sleeping chibi idle loop later) | none | music + visuals only |
| AI news | yes — an "anchor" persona | Kokoro AI voice, disclosed | tests sourcing + scripting; the character gives the channel a face |
| Persona channel | yes — the main persona | invented persona voice (fixed Kokoro voice or a mix) | the character IS the show |
| Owner's idea tests | optional | any (each idea test says which) | 3 test videos per idea |
| Owner-voice channel (1–2) | optional character | the owner records (owner mode) | most trusted voice |

Each channel's card (from the channel plan) gets two new fields: `character:` and `voice:`. One
character per channel — a persona never appears on another channel (keeps channels separate and
each identity real).

---------------------------------------------------------------------------------------------------

## PART 8 — The style experiment (CH-10): which character style works?

Same script, three renders: `png`, `cutout`, `vrm` (same voice, same background, same captions —
ONE change: the style). Make 3 test videos for the persona channel this way (private, the owner
watches all). The owner ranks them; the ranking and reasons go in the channel's experiment record.
After real uploads: the channel plan's metric + keep/change/kill rule decides (10 uploads or
28 days). Effort note for the owner: png is about 1 evening of art; cutout about 2–3 evenings;
vrm about 1–2 evenings in VRoid + slower renders.

---------------------------------------------------------------------------------------------------

## PART 9 — Tickets (add to the channel plan after C-T6; each needs "go <ID>")

| ID | Ticket | Tier | Oracle |
|---|---|---|---|
| CH-0 | `tools/character/` folder, requirements.txt (pinned), install check script printing versions of python, ffmpeg, pillow, kokoro, rhubarb, node, Edge | T1 | `INSTALL CHECK: n/n found` raw output |
| CH-1 | `charcheck.py` 2D checks (5.5) + tests | T2 | tests fail before, pass after |
| CH-2 | `voice.py` Kokoro + owner modes + checks | T2 | `PASS voice` on a 3-line episode; voice list pasted |
| CH-3 | `lipsync.py` Rhubarb wrapper + all.json + checks | T2 | `PASS lipsync`; `rhubarb --help` pasted |
| CH-4 | `puppet2d.py` png style | T2 | frame count, log = cues, blinks, same seed = same log |
| CH-5 | `compose.py` captions from timing, AI tag, description, check | T2 | `shorts.py check` PASS (C-T4 profile) |
| CH-6 | cut-out rig in `puppet2d.py` + `charcheck --rig` holes test | T2 (T3 reviews the transform maths) | hole test PASS; tilt ±5° frames |
| CH-7 | VRM checks in `charcheck.py` (GLB parse, bones, expressions, triangles) | T2 | tests with a tiny fake GLB JSON |
| CH-8 | `vrm-render/` (Node, playwright-core + Edge, three-vrm) | T2 builds, T3 reviews | arms-down check, log = cues, audio present |
| CH-9 | `make_episode.py` one command | T1 | `EPISODE READY` on a 3-line test episode |
| CH-10 | style experiment: 1 script × 3 styles | T1 runs, owner judges | 3 videos + experiment record |
| CH-11 | `shorts_cut.py` vertical re-render + checks | T2 | each short ≤ 60 s, shorts profile PASS |
| ART-1 | owner: make the persona in ONE 2D style (5.2) | owner | `charcheck` PASS |
| ART-2 | owner: make the persona in VRoid (Part 6) | owner | `charcheck` VRM PASS |
| ART-3 | owner/T3: cut-out layers + rig.json pivots (5.3) | owner + T3 | `charcheck --rig` PASS |

Build order: CH-0 → CH-1 → CH-2 → CH-3 → CH-4 → CH-5 → CH-9 (now png videos work end to end) →
CH-11 → CH-6 → CH-7 → CH-8 → CH-10. The owner can make the art (ART-1/2/3) in parallel at any time.

---------------------------------------------------------------------------------------------------

## PART 10 — Prompt for a weak model doing ONE ticket

```
Project: channel network (yes repo, ai-learning branch). Read
doc/plans/CHARACTER-AUTOMATION-PLAN.md Parts 2, 3 and <the part for this ticket> fully first.
Ticket: <ID> — <one line>. Files you may create/change: <list>. Anything else = stop and ask.
Before: run the oracle and paste the raw output. List every tool option / voice / expression name
you will use by running the tool's help or list command, and paste it — never guess names.
Plan in max 8 lines, then WAIT for "go <ID>".
After: paste the raw test output (python -m unittest discover -s tools/character/tests -v) and the
oracle's raw output. Do not say it looks or sounds good — the owner decides. Nothing is uploaded,
nothing is bought. Commit only the listed files (never git add -A), only after "commit".
2 failed attempts = stop and ask; log the label in the routing log.
```

## PART 11 — Mistakes to avoid (check yours against this list)

1. Layers of different sizes or with offsets → the face falls apart. Golden rule 5.1.
2. Mouth flicker (a new mouth every frame) → 2-frame minimum rule.
3. Using the real time clock for blinks/motion → videos differ every run. Seeded random only.
4. Rendering the VRM in real time (requestAnimationFrame) instead of frame by frame → dropped frames
   and audio drift. Always `renderFrame(i)` in order.
5. Spring-bone (hair) frames rendered out of order → hair jumps. In order, from frame 0.
6. Writing thousands of PNG frames to disk → disk full. Pipe frames into ffmpeg.
7. Guessing Kokoro voice names, Rhubarb flags, VRM expression names → list them first.
8. Calling `python3` → breaks on Windows. `sys.executable`.
9. Captions from Whisper when we already have the script → slower and less exact. Use the timing.
10. Forgetting the "AI voice" tag / description disclosure on Kokoro videos.
11. Cropping the long video to make a short → tiny character. Re-render in short framing.
12. A persona appearing on two channels, or any real person's face/voice → never.
