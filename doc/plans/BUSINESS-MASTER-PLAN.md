# Business Master Plan: Original Character Shop + Content Studio
Version 2, 2026-10-20. Replaces the unverified parts of doc/plans/2026-10-19-business-and-content-plan.md. Planning only: no account created, no money spent.

## 1. Facts about the owner (answered 2026-10-19)
18+, United States, Windows PC, beginner. OpenCode with paid DeepSeek and free models. Total budget under $20 a month. Weak models do about 75% of the work; a strong model designs and reviews. The owner approves every upload and every spend. Two attempts (confirm: Q6), then the owner. Four channels wanted (original characters, game devlog, ambient/lofi, AI tools/tests). Print on demand: Printful free plan. Original work only, AI disclosure always, license record for every asset, shop is sealed.

## 2. Two halves, one rulebook
- SHOP (sealed): Etsy, Printful, itch.io later. Folder `shop/`. Reads nothing outside. Files arrive by hand in `shop/intake/<pack>/` with `manifest.json`.
- CONTENT: shorts first. Folder `content-work/` (outside every repo) plus a COPY of tools/content-shorts. The Paperclip company package is a source of role text only; it is not running.
- Crossing: the owner carries files by hand (finished art into shop/intake; listing URLs and the Share & Save link into content briefs).

## 3. What is true about the tools (tested 2026-10-20, Linux, synthetic video)
Works: reframe, style, loudness, check (pass and fail cases), batch (preset and music variants), mix_music, captions burn, sources add. Not run: Whisper captions, all live sources (Pexels, Pixabay, NASA, Archive). Not tested on Windows. Known problems: batch.py uses `python3`; the license check does not confirm the files exist or match what was used; `check` only accepts 1080x1920 and 60 s by default (ambient needs a new check); no loop, contact-sheet or stats script; sources.py accepts CC BY-SA.

## 4. Policies re-checked 2026-10-20 (secondary sources; open the official page before acting)
[Checked] Etsy: $0.20 listing, 6.5% transaction, 3% + $0.25 processing; AI allowed with disclosure in the listing; "designed by" label with a production partner for POD; prompt bundles not allowed. [Stale/unconfirmed] Etsy one-time setup fee of $15. [Checked] Printful free plan: 20% off samples, one sample order a month, up to 3 items. [Stale/unconfirmed] free sample shipping. [Checked] YouTube: mass-produced or repetitive content is not monetizable (since 2025-07-15); original value is fine. [Checked, dated 2024-11] itch.io: asset pages answer the generative-AI question; untagged AI assets can lose indexing. Not re-checked: Gumroad, Ko-fi, YPP and TikTok thresholds, tax figures.
Price formula (US, shipping in price, no Offsite Ads, one item, no tax): P = (base incl. shipping + profit + 0.45) / 0.905. Example: (16.25 + 6 + 0.45)/0.905 = 25.08 -> list at 25.99. Digital $6.99 nets 0.905 x 6.99 - 0.45 = $5.88.

## 5. Money plan (the money gate)
Every spend needs the owner's "go" in writing in ROUTING-LOG.md.
| Month | Planned spend | Total |
| 1 | digital listings 25 x $0.20 = $5; DeepSeek $1-3; Etsy setup fee only if the owner chooses (about $15, unconfirmed) | about $6-8, or about $21-23 with the fee |
| 2 | listings $2-5, DeepSeek $1-3, one Printful sample (about $12-15, 20% off) | about $15-23 |
| 3+ | recurring about $3-8; paid plans, ads, paid AI video or music: $0 until profit covers them |
If a month would pass $20, the agent says so first and the owner decides.

## 6. Order of work
Week 0 (before week 1): accounts by hand; folders; templates; banned-words.md; Windows install and the 4-step toolkit self-test; character name search. Weeks 1-2: first digital pack (6 emotes at 28/56/112 px plus a master), intake -> package -> listing -> strong review -> owner publishes. Content: brief 1 "Meet <character>" (vary hook), first batch from the owner's own screen recording, review, owner picks, one upload. Weeks 3-4: 2 more digital packs; POD drafts only; sample decision brief (owner go/no-go); brief 2-3; first weekly review. Week 4 onward: devlog episode 1 from the owner's own game. Month 2: Printful sample, POD listings, itch.io pack plan. Week 7 or later: ambient only after a long-video check exists and the owner says go. AI-tools channel only with a results file for every claim.

## 7. Channel order (default)
1 character shorts, 2 devlog, 3 ambient/lofi, 4 AI tools/tests. Post one chosen variant per brief; keep the others private.

## 8. Roles by hand
Paperclip wake-ups, issues, the Learning agent, Memory and the stats script are not running. Every role is a prompt section: Content Lead (briefs), Shorts Creator (batch.json and runs), Reviewer (separate chat, edit denied, cannot see images if DeepSeek), owner (picks, upload). Learning packet and published.csv are files the owner pastes into.

## 9. Open items before week 1
Answer the 12 questions; fix batch.py/captions.py in the content-work copy; write a long-video check; decide CC BY-SA policy; confirm OpenCode agent folder name and run the agent once; fill pricing.md from the Printful screen; confirm the Etsy setup fee on the real screen.

## 10. Tickets (kept from the saved plan, with corrections)
S-01 answer questions; S-02 folder tree; S-03 install agents (test: write outside shop must ask/refuse); S-04 banned-words (>=40); S-05 disclosure snippets; S-06 pricing.md (formula reproduces $25.08); S-07 character and identity (strong model, owner approves); S-08 Etsy setup (owner); P-01..P-08 pack flow; B-01/B-02 bookkeeping; C-01 Windows install note; C-02 self-test = reframe, style, loudness, check exit 0 on a real recording (corrected oracle); C-03..C-09 briefs and batches; C-10 toolkit fix proposals (CC BY-SA, license-file existence check, python3, AI-label field); C-11 stage decision; R-01/R-02 reviews; L-01 itch.io plan. 33 tickets: 3 owner-only, 10 T1, 15 T2, 5 T3.

## 11. Limits
Everything about platform money and rules comes from blogs and search summaries; the official pages were not opened. The toolkit has never run on real footage or on Windows. The Paperclip runtime is not verified live (decision log 2026-09-28).
