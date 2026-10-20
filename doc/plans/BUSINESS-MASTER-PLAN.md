# Channel Lab + Side Shop — Master Plan (revised 2026-10-20)

This project stands alone. The agent is `business`. Side-shop files arrive only when the owner copies
them by hand. Budget: $0 by default (the owner is broke); hard cap $20/month shared with everything.

## What it is
A network of video channels run as EXPERIMENTS, plus a small side shop (Etsy / itch / Gumroad).
Channel ideas: sleep/ambient (popular format), AI news, a persona channel (original character), and
the owner's own new ideas. Voices: free AI voice, invented persona voice, the owner's own voice on
1-2 channels, or no voice.

## Goal
LEARN AND TEST IDEAS. Find out which channel ideas get watched, using cheap tests, then keep, change
or kill each by numbers decided in advance. Money comes later and is never promised.

## Owner decisions (2026-10-20)
- Start with 3 or more channels, as cheap experiments. Broke: spend $0; spend only with an exact
  amount and a written yes. Owner approves every upload. 2 failed attempts, then ask the owner.
- Shop side track is free/digital-only until the owner says otherwise.

## Rules
- Every channel has a one-page CHANNEL CARD first (name, promise, audience, format, voice type,
  disclosure line, sources/licenses, small schedule, one metric, keep/change/kill rule).
- Each channel has its own identity and real human choices; no cloned templates (demonetization risk).
- AI voices are disclosed. Never clone a real person's voice. AI news uses real linked sources only
  and publishes corrections. Never copy another channel's script, footage, thumbnails, music or name.
- One change per variant. Pipeline: brief -> variants -> automatic checks -> read-only reviewer ->
  owner picks and uploads. License file for every asset.

## Waves
| Wave | Channels | Voice | Why first |
|---|---|---|---|
| 1 | Sleep/ambient | none (music only) | easiest: loop + licensed music |
| 1 | AI news | free AI voice, disclosed | tests sourcing, scripting, voice |
| 1 | Persona channel | invented persona voice | ties to the owner's original character |
| 2 | The owner's own ideas | any | each idea = 3 test videos before it becomes a channel |
| any | Own-voice channel (1-2) | the owner records | most trusted by viewers; pick the best fit later |

## Steps (each needs the owner's go)
1. Fix the toolkit's 5 known faults (below) and install Python + ffmpeg on the PC.
2. Write the channel cards (owner picks names and ideas).
3. Free voice test: owner listens to 2-3 free voices and picks one.
4. First batch per wave-1 channel (4 variants each, one change per variant), reviewed, owner uploads.
5. After 10 uploads or 28 days per channel: numbers -> keep / change / kill.
6. Start wave 2 only after wave 1 has numbers.

## Toolkit faults to fix first (found by running it)
`check` passes a license entry whose file is missing; a music track missing from license.json passes;
`batch.py` hard-codes `python3` (Windows); `check` only accepts 1080x1920 so ambient videos cannot be
checked; `sources.py` accepts CC BY-SA though the README says it does not; Whisper captions need
`faster-whisper` installed.

## First tickets
| ID | Ticket | Tier | Oracle |
|---|---|---|---|
| C1 | Channel card template | T3 | file exists; every field required |
| C2 | Fix `check` to fail on a missing license file and an unlisted music track | T2 | new tests fail before, pass after |
| C3 | Make `batch.py` use the current Python on Windows | T1 | batch runs with `py` or `python` |
| C4 | Let `check` accept a landscape/ambient profile | T2 | test with a 1920x1080 synthetic video |
| C5 | Reject CC BY-SA in `sources.py` or update the README | T1 | test on a CC BY-SA fixture |
| C6 | Draft one card per wave-1 channel from the owner's picks | T2 | each card complete, no empty field |
| C7 | AI-news sourcing and correction policy | T3 | one page the reviewer can check against |
| C8 | Free voice test script (3 voices, same paragraph) | T1 | 3 audio files saved; owner listens |
| C9 | First batch per channel | T1 runs, T2 briefs | `index.json` and records; one change per variant |
| C10 | Review each batch (read-only) | T2 | verdict with evidence per variant |

## Side shop (free track)
Digital packs only at first (emotes, stickers, wallpapers). No Etsy setup fee, no Printful sample, no
paid plan until the owner writes yes with an exact amount. Sealed folder `shop/intake/<pack>/`.

## Budget
$0 now. Optional later, each only with the owner's yes: Etsy setup fee (about $15, unconfirmed),
a Printful sample, a paid voice or tool.
