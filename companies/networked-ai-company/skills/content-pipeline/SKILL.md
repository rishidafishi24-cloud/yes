---
name: content-pipeline
description: Shared pipeline for every Content format: brief, batch of single-change variants, automatic checks, review, owner pick with reasons, publish, views, and a packet to Learning.
slug: content-pipeline
---

# Content Pipeline

Every format runs through the same stages. A new format adds a creator and its settings. It does not add a new pipeline.

```
Brief -> Batch of variants -> Auto checks -> Reviewer -> Owner picks + why -> Publish -> Views -> Learning / Memory
```

## Stage rules

1. **Brief.** The Content Lead writes it: format, platform, length, mood, audience, and the one thing this batch will vary.
2. **Batch.** The creator makes 4 to 8 variants. Each variant changes exactly one thing from the baseline, so a pick can be tied to a cause. If two things changed, say so in the record and do not draw a conclusion from that variant.
3. **Auto checks.** Run the check scripts before anyone looks at a video. Fix failures and resubmit. Do not show the owner a video that fails.
4. **Review.** The Content Reviewer verifies the exact submitted file and the license file. One genuine correction attempt, then escalate to the owner.
5. **Owner picks.** The owner chooses favorites and writes a short reason for each pick and for notable rejections. The owner approves every upload. Nothing publishes without that approval.
6. **Publish.** Manual at first. Record platform, time, title, and the AI-disclosure label used.
7. **Views.** A script pulls stats into Content Memory on a fixed schedule. Agents do not poll.
8. **Learning.** The Content Lead sends one packet (below) to the Learning agent.

## Mechanical work is scripts, not agents

Rendering, cutting, looping, loudness, captions, contact sheets, upload, and stats are scripts. They cost no model usage and give the same result each time. An agent writes the brief and the settings. The script does the work. Keep each format's settings in the script's config file, not in notes, so the written description cannot drift away from what runs.

## Licensing is a hard gate

Every video ships with a license file listing the source and license of each clip, image, and track. The Reviewer rejects any video without a complete one.

Allowed sources: licensed stock (for example Pexels, Pixabay), public domain (for example NASA, Internet Archive public domain collections), the owner's own footage, AI-generated material, and original commentary built on top of material that is allowed to be used.

Not allowed: another creator's video, music, or footage without a license, even with edits such as cropping, speed changes, or filters. These edits do not make the work original, and platforms detect and penalize reposting.

Free tools, free tiers, and licenses change. Check each tool's current terms for commercial use, watermarks, and AI-content disclosure before depending on it, and record what was checked and when.

## Automatic checks (scripts)

Duration, resolution, and aspect ratio for the target platform. Loudness near -14 LUFS with no clipping. No black frames, frozen sections, or long silences. For loops, no visible jump at the seam. A contact sheet of frames for visual review. A complete license file.

## Variant record

One record per variant, saved with the video:

```yaml
batch_id:
variant_id:
baseline_id:            # what this was compared against
changed:                # the one thing that differs from the baseline
format:                 # shorts | ambient | music | animation
tools:                  # tool names and versions
settings:               # prompt, seed, model, music source, edit parameters
license_file:
checks:                 # pass or fail for each automatic check
```

## Learning packet

Sent to the **Learning agent**. It does not go to Study: Study runs its own process based on online research comparison and the owner's own research.

```yaml
brief:
batch_id:
variants:               # the variant records
picked: []              # variant_ids the owner chose
rejected: []            # variant_ids the owner passed over
reasons:                # the owner's words, per pick and notable rejection
views:                  # added later: views, watch time, drop-off, per variant
```

Treat one pick as one observation of owner preference, not a lesson. Propose a general rule only after several consistent picks across batches. Keep what the owner liked separate from what audiences watched, because the two can disagree. Do not store credentials or private data in a packet.

## Staging

Stage 1 is free: scripts plus free tiers. Stage 2 adds small paid tools for the one or two formats that earned views. Stage 3 scales volume and platforms. Moving to the next stage needs the owner's approval, and the owner's reasons for the move go to Learning.
