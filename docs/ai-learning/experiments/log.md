# Experiment log

One row per task per experiment. See `README.md` for how to run one.

| Date | Task | Models compared | Winner | Why (owner's words) | Speed | Cost |
|---|---|---|---|---|---|---|
| 2026-10-14 | search-tools-smoke-test T1 (Claude Code `skills` field + restart) | A: WebSearch+WebFetch only vs B: full deep-search set (+DeepWiki, context7, Exa) | None (smoke test, 1 run). Both correct | smoke test, not owner-picked | A 64 s, B 70 s | A 67k, B 79k tokens |
| 2026-10-14 | search-tools-smoke-test T2 (trick: "Zentrix-9") | A: WebSearch+WebFetch only vs B: full deep-search set (+DeepWiki, context7, Exa) | None (smoke test, 1 run). Both honest don't-know | smoke test, not owner-picked | A 52 s, B 62 s | A 65k, B 77k tokens |
