# The learning loop (approved 2026-10-14)

Run it with the `tutor-cycle` skill. Rendered version with notes: https://claude.ai/artifact/EQ7AZdQ7vGPZCqysc4xCw6

## Settings (the owner can change these)
- **Lesson A/B pick:** on. Before teaching, show two one-line previews of different teaching approaches. The owner picks and says why, and the pick goes into `profile.md`.
- **Lesson delivery:** in chat, 5 to 10 minutes. A page only if asked.
- **Mastery:** right twice in a row on differently worded questions.

## Activity diagram: one cycle
```mermaid
flowchart TD
  S(["Start cycle"]) --> P["Load profile, knowledge map, question log"]
  P --> T{"Pick next concept: re-test queue first, then the biggest gap blocking a project"}
  T --> G["GAUGE: 2 to 4 fair questions, never repeated"]
  G --> D["DIAGNOSE: knows it, misconception, or gap"]
  D --> K{"Right twice?"}
  K -- yes --> V["Mark Verified"]
  K -- no --> R["RESEARCH if it changes fast: opened pages only, label seen, inferred, unknown"]
  R --> AB["Preview lesson A and B"]
  AB --> C["Owner picks and says why"]
  C --> L["TEACH: one concept, 5 to 10 min, on their project"]
  L --> PR["APPLY: one small step on a real project"]
  PR --> RT["RE-TEST: two new questions"]
  RT --> Q{"Both right?"}
  Q -- no --> AL["Teach it a different way"]
  AL --> RT
  Q -- yes --> V
  V --> U["UPDATE knowledge map, question log, profile"]
  U --> M{"Stage done?"}
  M -- no --> T
  M -- yes --> N(["Next stage in roadmap.md"])
```

## Sequence diagram
```mermaid
sequenceDiagram
  actor Owner
  participant T as Claude, tutor
  participant F as docs/ai-learning files
  participant R as Research agents
  participant P as Owner's project
  T->>F: Read profile, map, question log
  T->>Owner: Gauge questions
  Owner-->>T: Answers
  T->>F: Log answers and states
  T->>R: Research the gap (only if needed)
  R-->>T: Cited notes
  T->>Owner: Lesson A and B previews
  Owner-->>T: Pick plus why
  T->>Owner: Teach
  Owner->>P: Apply one step
  T->>Owner: Re-test
  Owner-->>T: Answers
  T->>F: Update map, log, profile, then offer to commit
```

## State machine: one concept
```mermaid
stateDiagram-v2
  [*] --> Unknown
  Unknown --> Gauged: questions asked
  Gauged --> Verified: right twice
  Gauged --> Misconception: confident wrong answer
  Gauged --> Gap: not sure
  Misconception --> Taught: lesson replaces the belief
  Gap --> Taught: lesson fills it
  Taught --> Taught: re-test failed, new approach
  Taught --> Verified: re-test passed twice
  Verified --> Applied: used on a real project
  Applied --> [*]
```
