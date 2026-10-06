# AI Company Decision Log

> This document records explicit owner decisions gathered during architecture
> design. It is authoritative for owner intent. If implementation, agent
> instructions, or another document conflicts with an explicit decision here,
> stop and surface the conflict rather than silently choosing.

**Companion to:** `docs/AI_COMPANY_ARCHITECTURE.md` — the Architecture document
describes the resulting *system design*; this log records the *decisions* that
produced it.

**Rules for this document**
- Record only decisions the owner has explicitly made.
- Do not invent missing decisions.
- Do not change an owner's decision without explicit owner approval.
- Mark unresolved questions as **UNRESOLVED**.

---

## MISSION

- Build an AI company that automates useful work.
- The company must continuously study completed work and improve how its
  agents/code perform.
- Learning how to produce better work is a core purpose.
- Stronger or weaker models should be replaceable without collapsing the
  workflow.

---

## AUTHORITY

- Human owner has final authority.
- CEO is **"AI me"** — the owner's AI version / interpreter. You talk through
  the project with the CEO; the CEO understands the goal and directs the
  company.
- **CEO works through leads instead of bypassing them.** The CEO mainly works
  through division leads and does not micromanage workers.
- Human involvement is high initially.
- Autonomy increases only after demonstrated reliability.
- Major architectural changes initially require owner approval.

---

## COMPANY MODEL

- Human = vision / final authority.
- CEO = interpreter / director.
- Paperclip = company OS / nervous system.
- Brain = Memory, Study, Learning, Reflection.
- Hands = working divisions / agents.
- Legs = tools / APIs / MCP / CLIs / external capabilities.
- Feet = skills / procedures teaching agents how/when to use tools.
- Skeleton = Git / branches / worktrees / staging / rollback.
- Eyes/Ears = logs / screenshots / browser / testing / observability.
- Immune System = Reviewer / tests / permissions / rollback.

---

## DISTINCTIONS

- **Model** = intelligence.
- **Agent** = employee / role.
- **Tool** = callable capability.
- **Skill** = procedure / instruction for using capabilities.

---

## BRAIN

- Brain contains Memory, Study, Learning, Reflection.
- **Study** examines completed work, context, HOW and WHY.
- Study records failed approaches as evidence.
- Study may compare two independent solutions to the same task.
- Study operates mostly after completed work / night / background.
- During the day Study may research techniques, experiments and new ideas.
- Study experiments require owner approval initially.
- Research may feed new techniques/tools to Study.
- When metrics cannot determine quality, ask the owner and preserve owner
  judgment as evidence.
- **Learning** extracts reusable lessons from validated outcomes.
- **Reflection** proposes improvements to agents/workflows but does not
  initially self-apply them.
- **Memory** stores durable company/project/branch knowledge and retrieves only
  relevant context.
- Avoid dumping entire history into agents.

### Brain Pipeline

```
Completed / validated work
  → Study
  → evidence / catalog
  → owner approval
  → Learning
  → Reflection
  → owner approval
  → Memory
```

---

## CODING DIVISION

- Flow: **Owner → CEO → Coding Lead → Coder A / Coder B → Reviewer**.
- Two independent generalist coders.
- Owner currently chooses models.
- Models should remain replaceable.
- Coding Lead protects owner vision and architecture.
- Coding Lead assigns work and can stop drifting work.
- If uncertain about vision, Coding Lead asks owner.
- Coder A/B may independently solve the same task for comparison.
- Independent coders should **not** see each other's unfinished solution.
- They may receive the same validated Memory lessons / context.
- Reviewer checks correctness, code quality and instruction following.
- Reviewer may reject work.
- After first rejection, coder normally gets another attempt.
- Repeated failure stops / escalates rather than looping indefinitely.
- Coding Lead may stop drift → explain → ask owner if needed → rewrite task →
  restart.
- Coder A/B have **default tendencies** (Coder A: implementation/building;
  Coder B: debugging/integration/alternate approach) as **routing preferences,
  not restrictions**.
- CEO receives concise completion summaries / blockers.
- Deep technical details belong in Memory rather than flooding CEO.

---

## CODING TEAM OWNS TECHNICAL UPGRADES

The Coding Division is responsible for implementing and maintaining technical
capabilities across the company.

This includes:

- improving Paperclip itself
- integrating external tools
- integrating MCP servers / CLIs / APIs
- upgrading agent tooling
- improving its own coding environment and workflow
- implementing technical capabilities requested by other divisions

**There is NO separate Tool Lab division.**

When a new tool is discovered:

```
need / capability
  ↓
Coding Lead evaluates technical fit
  ↓
Coder integrates/tests it
  ↓
Reviewer verifies correctness/safety/quality
  ↓
tool is assigned to appropriate agent(s)
  ↓
relevant Skills teach HOW/WHEN to use it
  ↓
Study may later evaluate whether the capability actually improved outcomes
```

**The Coding Team IMPLEMENTS the technical capability.**
**The receiving division determines operational use according to its
role/design.**

**Do not create a permanent Tool Lab architecture.**

---

## TOOLS

- Paperclip's existing tool-governance infrastructure should be reused.
- Do not build another tool framework unnecessarily.
- We want a large catalog of useful free/open-source agent capabilities.
- Tools are selectively assigned to appropriate agents.
- Do not give every agent every tool.
- Skills teach agents HOW/WHEN to use tools.
- Tool implementation and skill/instructions remain separate where practical.
- **Agent Reach** is the reference example of a high-leverage agent
  "superpower" — not the limit of tool discovery.

### Current Tool Discovery Goal

Find powerful free tools we may not know exist for: Research, Study, Coding,
Reviewer, Memory, UI/UX, Content, Games, Business, CEO.

Prefer tools attachable through: CLI, MCP, API, local server, plugin, skill,
Docker.

---

## QUALITY PRIORITIES

1. Correctness
2. Code quality
3. Match owner vision
4. Instruction / workflow following
5. Consistency
6. Cost
7. Speed

Owner separately emphasized **cost** and **closeness to vision**.

---

## CONCURRENCY

- Maximum 4 active agents for now.
- Additional work queues instead of exceeding the cap.
- The 4-agent limit refers to **concurrent activity**, not total configured
  agents.
- **UNRESOLVED:** exactly which roles count toward the 4-agent limit.

---

## GIT / DEPLOYMENT TARGET

```
Official Paperclip
  → custom stable main
  → integration
  → isolated coder worktrees / feature branches
  → Reviewer / tests
  → integration
  → staging
  → owner approval
  → stable custom main
  → live Paperclip
```

- Coders do not experiment directly on stable / live.
- Live deployment initially requires owner approval.

---

## STATUS VOCABULARY

`DESIGNED` · `CODED` · `TESTED` · `BUILT` · `STAGED` · `LIVE`

**Never call something LIVE without verification.**

---

## UI

- Current major problems: slow, inaccurate, confusing UI.
- Target is a chat-first command center.
- Current project/context, active agents, tasks, blockers and approvals should be
  understandable.
- **"Needs You" must be highly visible.**
- Memory/Study should be visible without overwhelming the owner with raw logs.

---

## OTHER DIVISIONS

- Game, Business, Content and future Hands exist conceptually.
- **Research structure is SETTLED** (owner decision, 2026-09-28): a central
  Research Lead with specialized Coding / Game / Content / Business / Trading
  Researchers, working independently within budget.
- **Game, Business, and Content internals remain UNRESOLVED.** Content's outer
  shape is fixed; its internals are not designed.
- Do not invent their final designs.

---

## OPEN DECISIONS

- Exact definition of the 4-agent concurrency cap (which roles count).
- Exact correction-attempt count after a rejection (implementation defaults to 3;
  owner archive item 57 states one genuine retry). See the conflict entry above.
- Final Memory retrieval implementation.
- Final Game division design.
- Final Business division design.
- Final Content division design.
- Final per-agent tool belts.
- Exact thresholds for increasing autonomy.
- Configurable verification tier definitions and approval thresholds.

**Closed 2026-09-28:** Final Research division design (central Research Lead with
specialized branch researchers).

---

# Known Implementation Deviations

The section above records **TARGET OWNER ARCHITECTURE**. This section records
**CURRENT IMPLEMENTATION** as observed. They are deliberately separated.

**These are recorded, not fixed.** Fixing them is a separate, approved task.

| # | Deviation | Status / classification |
|---|---|---|
| 1 | Extra `pstack-coder` agent exists alongside the target Coder A + Coder B | Preserved; does **not** redefine the target Coding Division |
| 2 | `trading-lead` / `trading-research` agents exist outside the approved target architecture | Preserved; not architectural authority |
| 3 | **Study not implemented** — no Study agent | Implementation gap, not an architecture conflict |
| 4 | **Learning implementation incomplete / unconfigured** | Implementation gap |
| 5 | **Reflection not operating as intended** | Implementation gap |
| 6 | **Memory implementation incomplete** | Implementation gap |
| 7 | **Shared coder workspace** instead of isolated coder worktrees (`coder-one/AGENTS.md` §"Shared workspace and overwrite protection", `coder-two/AGENTS.md` same section) | **Real implementation conflict** with the isolated-worktree target |
| 8 | **`AGENTS-GAME-DEV.md` missing** — referenced by both coder instruction files | Implementation / configuration issue (dangling reference) |
| 9 | **`delegation-design` dependency/configuration issue** — referenced in `coding-lead/AGENTS.md` frontmatter; skill untracked | Implementation issue; preserved, not redesigned |
| 10 | **Current agent hierarchy may not match the target Coding Division** (e.g. `game-coding-lead` as a parallel coding line) | Implementation gap; **Game division design is UNRESOLVED** |
| 11 | **Current agent instructions/configuration may not match target roles** (e.g. hardcoded machine-specific absolute paths and a live company UUID in coder instructions) | Implementation issue |

### Deviation triage

- **Deviation 7 is the only true architectural conflict.** It contradicts the
  target's isolated-branch model and is the highest-priority future fix.
- **Deviations 3–6 are implementation gaps.** They do not change the target
  architecture.
- **Deviations 8–9 are configuration issues**, not architectural conflicts.
- **Deviation 10 is not a conflict** — Game is a separate future division whose
  design is UNRESOLVED.
- **Deviation 11 is an instruction-fidelity issue.**


---

## OWNER CLARIFICATION - 2026-09-28

This later explicit direction supplements and supersedes earlier owner-intent wording where it conflicts. It changes the target specification; it does not certify implementation or authorize a live import/deployment.

- Immediate priority is the Coding plus Verification foundation for reliable software and evidence-driven self-improvement. Scalable content production is a later mission. Do not provision every division in the future leadership diagram solely because it is listed.
- Intended leadership direction is Owner -> CEO -> Coding Lead -> Game Lead -> Content Lead -> Business Lead -> Trading Lead -> Research Lead -> Knowledge Lead. Only implement divisions already present or currently needed; do not expand the roadmap into premature division work.
- Coding Lead chooses one-coder, collaborative, parallel-feature, or isolated A/B topology. Coder A and B remain independent generalists; unfinished A/B solutions stay isolated.
- Submitted code receives independent review of its exact revision. Reviewer is read-only, uses the strongest suitable available reasoning model, and wakes only for actual review work. Tester combines deterministic checks and agent judgment as risk requires. One genuine correction attempt follows rejection; another failure escalates to the owner.
- Verification tiers are configurable and risk-based; no permanent tier policy is approved. High-risk work includes Paperclip self-modification, instructions, Knowledge/Memory, security/permissions, deployment, database changes, and financial execution. Important changes/releases remain owner-approved initially.
- Normal work should produce compact, exact-revision structured evidence. Persist evidence without model calls, retain failure/correction pairs, and record unusually strong outcomes where useful.
- Coding Study primarily consumes evidence from real work, without polling. It opens a controlled experiment only when existing evidence cannot resolve an important question; idle Study does not create experiments. Research findings remain provisional until Study/validation. Learning, Reflection, and Memory remain distinct, with owner approval initially required to apply behavior changes.
- Knowledge records retain provenance, scope, confidence, cost/performance/speed, version, supersession history, and rollback reference. Memory retrieval is small and relevance-ranked; agent experience follows the persistent role identity across model changes.
- Capability access is explicitly scoped. Avoid unnecessary wakes, duplicated reviews/retrospectives, broad prompt memory, and experiments without evidence-based justification.

These directions do not resolve the existing open decision about which roles count toward the four-active-agent limit. They also do not define exact configurable verification tiers, thresholds, or budgets.


### Implementation status correction - 2026-09-28

The earlier Known Implementation Deviations table is a historical snapshot, not a current runtime audit. In particular, deviation 7 (shared coder workspace) is not established as a missing runtime capability: `server/src/services/execution-workspace-policy.ts` supports isolated workspace modes and Git worktree strategies. The current project/task policy, effective workspace, and live behavior have not been verified. Classify isolation as a configuration-and-proof gap until a real task demonstrates otherwise; do not build a second workspace manager.

The existing candidate company package is also not evidence of a live import. Its current README/COMPANY prioritize Content and Business, describe Reviewer as not a mandatory QA gate, and include multiple future-division roles. Those statements conflict with the 2026-09-28 target for this package if it is intended to be imported. Preserve the package work, but reconcile its content before any import or activation. Current company assignment and running instructions remain unverified.

---

## Implementation reconciliation - 2026-09-28 (verified against source)

This entry records what a read-only audit established about current implementation.
It adds no new target decisions and reopens no settled decision. Its purpose is to
correct the Known Implementation Deviations table above, which is now stale in a
specific and misleading direction.

### Revisions to the deviations table

| # | Earlier entry | Correction established by source inspection |
|---|---|---|
| 7 | "Shared coder workspace — **real implementation conflict**, highest-priority future fix." | **Downgraded.** Isolation is a **configuration and proof gap**, as the status correction above already indicated. Real `git worktree` creation exists at `server/src/services/workspace-runtime.ts:3559`. What is missing is a *demonstration* that a task runs isolated, plus live project policy still set to `shared_workspace` with all 82 issues at `executionWorkspaceId: null`. Do not build a second workspace manager. |
| 11 | "Hardcoded machine-specific absolute paths and a live company UUID in coder instructions." | **Refined, not removed.** The *source package* is clean — no `/home/`, no UUIDs. The defect lives in `scripts/instruction-activation/original-live-bundles/Coder{1,2}.AGENTS.md:34` (hardcoded `/home/god/.paperclip/...` path plus company UUID `7888775d-…`) and `activate-instructions.sh:18,25-29,36-37`. Clean corrected bundles already exist in `scripts/instruction-activation/candidates/` and have never been activated. |
| — | Deviation 3, "Study not implemented — implementation gap." | **Qualified.** Still no Study *agent*, but Study/Memory service and schema work is `CODED` and uncommitted in `/home/god/codex-r01-instruction-recovery`: 8 tables, migration `0284`, 7 services. It has no routes, importers, or tests. It is `CODED`, not `DESIGNED`, and not reachable. |

### Additional implementation facts not previously recorded

- **Review is not bound to a revision.** `server/src/services/issue-review-policy.ts` contains no revision, commit, or SHA concept. The `revision` fields in `server/src/routes/issues.ts` are document/thread optimistic-concurrency counters. The `revisionReviewed === sha` requirement in `packages/shared/src/delivery-evidence.ts` therefore has no producer.
- **The Reviewer is not capability-limited to read-only.** The Reviewer is a separately identified agent with its own workspace. That is structural isolation, not an enforced write restriction. Target §16 requires read-only; implementation does not enforce it.
- **Bounded correction already exists** at `server/src/services/issue-execution-policy.ts:69` (`DEFAULT_MAX_REVIEW_ROUNDS = 3`) with escalation at `:865-868` and a sticky escalated hold at `:723-740`. It is **default-off** — `resolveMaxReviewRounds` requires an explicit policy setting.
- **Instance-wide capacity is coded but unmerged**, on `agent1/global-capacity` (`fbb3d518a`, `e91692d38`). It uses a `pg_advisory_xact_lock` so the limit is genuinely global across processes, unlike the existing process-local `withAgentStartLock`. It is **not in this worktree**, and the queued-comment claim path in `heartbeat.ts` sets `status: "running"` without passing through the gate.
- **The strongest evidence contract is the committed one, not the working-tree one.** `packages/shared/src/delivery-evidence.ts` is **untracked in this worktree**, and the copy present here is *weaker* than the version committed at `15bc8725b` on `codex/delivery-evidence-proof` (which adds per-check revision binding, `provenance: observed`, and build/staging/deployment artifact identity). Recovering `15bc8725b` is preferable to using the local file. This corrects an earlier reading that treated the working-tree copy as a regression.
- **A built-in agent `key: "learning"` already exists** (`server/src/services/built-in-agents.ts:316`) with near-identical intent to the new `brainLessons` pipeline. The gap analysis does not mention it. The new table supplies missing persistence, so this is EXTEND — but the overlap must be recorded before the Brain is wired.
- **`reflection-coach` already enforces proposal-not-apply as a runtime policy** (`built-in-agents.ts:340-347`). `brainReflectionService.apply()` re-implements that rule in application code, mutates no agent configuration, and omits the "never reflect on yourself" guard.

### Instruction text is not enforcement

`companies/networked-ai-company/agents/reviewer/AGENTS.md:52` and
`coding-lead/AGENTS.md:59` state outright that these instructions are
"behavioral guidance, not runtime enforcement." The audit confirms this: every
live issue has `reviewPolicy: null`. Any claim that the verification contract is
operating is a claim about prompts, not about the system.

### No new owner decisions were made in this reconciliation

The four-active-agent counting rule remains **UNRESOLVED**. Configurable
verification tiers, approval thresholds, and budgets remain **UNRESOLVED**. Both
are still required before the corresponding enforcement is switched on. No
existing owner decision was changed.

---

## Planning Q&A archive reconciled - 2026-09-28

The owner's project-planning Q&A archive (77 recorded questions with answers) was
supplied after this reconciliation. It is the primary provenance for the
decisions above. Reconciling it against the canonical documents produced the
following. No decision was invented; each entry cites the owner's recorded words.

### One genuine conflict — needs an owner decision

**Correction attempts after a rejection.** The archive is explicit and sequential
at item 57: *"no, review > try again > still fail? > me"*, with the flow
`Reviewer rejects → coder retry → still fails → owner`. That is **one** genuine
correction attempt, and the owner separately chose the simplest escalation path
(no stronger-model or Coding Lead hop in between).

The implementation disagrees. `server/src/services/issue-execution-policy.ts:69`
sets `DEFAULT_MAX_REVIEW_ROUNDS = 3`, and `:865-868` escalates only once
`changesRequestedCount` reaches that value. §17.7 of the Architecture document
already flags this. Reconciling it is a configuration and proof obligation, not
a redesign: the service is already parameterised, so Coding must set escalation
after 2 rejected rounds on the coding pipeline and prove the setting is active.

This is recorded as a conflict rather than silently corrected, because the
implementation is defensible on its own terms — the cap is explicitly described as
preventing unattended agent↔agent ping-pong rather than encoding owner intent —
and only the owner can say which number is authoritative.

### Questions the archive closes

- **Research division structure is no longer UNRESOLVED.** Archive item 11 answers
  "central Research Lead with specialized researchers" with "1st one", and item 55
  confirms researchers work independently within budget. `ARCHITECTURE.md` §8 and
  `DECISION_LOG.md` "OTHER DIVISIONS" still list Research as **UNRESOLVED** and
  should be narrowed to Game, Business, and Content.
- **The 4-agent counting rule remains open.** No archive item answers which roles
  count. It is genuinely still an owner decision; archive item 5's "approve by me
  in the beginning" is about approval, not concurrency counting.
- **Game, Business, and Content internals remain UNRESOLVED.** Archive item 56
  fixes Content's *shape* (`Content Lead → creators → Content Reviewer →
  publish/approval → performance → Content Study`) but not its internals. Do not
  invent the rest.

### Decisions recorded in the archive but absent from canonical code

These are owner decisions with no implementation found by inspection. They are
listed as evidence of intent, not as a build queue.

| Archive item | Decision | Implementation found |
|---|---|---|
| 58 | Explicit capability scopes: read, write, spend, publish, deploy, destructive, external comms, secrets, trading | No capability-scope enum. `packages/shared/src/types/tool-access.ts` covers app-gallery access, not the nine named scopes. |
| 26 | Reviewer/Tester disagreement blocks release until resolved | No disagreement gate found in `server/src/services/`. |
| 32 | Company and branch scoreboards (rejection rate, retry rate, escaped bugs, rollback rate, cost, time) | No scoreboard or metric aggregation found. |
| 59 | Department-level token/API budgets that leads can escalate | `budget_policies` / `budget_incidents` exist in `packages/db/src/schema/`, but no per-department budget entity was found. |
| 27 | Explicit uncertainty labels: verified / likely / uncertain / unverified assumption | No shared uncertainty vocabulary found. Matches are unrelated cloud-connector strings. |
| 34 | Cheap deterministic evidence store, no model call to persist | No evidence or findings table in `packages/db/src/schema/`. This is the G5 gap already recorded. |

### Archive items that confirm, rather than change, existing records

Items 2, 5, 6, 7, 9, 10, 15, 16, 17, 18, 19, 20, 21, 22, 24, 25, 27, 28, 29, 30,
31, 33, 35, 36, 37, 38, 39, 40, 41, 42, 44, 45, 46, 47, 48, 49, 50, 52, 53, 54,
57, and 60 are already reflected in `AI_COMPANY_ARCHITECTURE.md` §1-16 and
`AI_COMPANY_PROJECT_MEMORY.md`. They need no change.

Two deserve naming because they constrain implementation rather than describe it:

- **Item 18/38 — Study token discipline.** Study is event-driven and pulls what
  it needs. There is deliberately **no rigid repeated-error wake threshold** and
  no polling. Any future Study trigger design must not introduce one.
- **Item 43 — Study improving itself.** The owner flagged this as conceptually
  hard and asked for it anyway. Avoid infinite recursive self-study; Study is
  investigated when real evidence suggests its methods are weak, not on a timer.

### Archive items deliberately not adopted as specification

Items 61-75 (UI, chat front door, agent DMs, relevance-gated participation,
mobile view) record owner preference for a future interface. They are not part of
the coding+verification foundation and are recorded here only so they are not
lost. `AI_COMPANY_ARCHITECTURE.md` §13 already carries the UI target.

Item 12 is worth restating for the next batch because it constrains step 3:
the Reviewer emits a compact structured finding **as part of the same review**,
and a cheap store persists it, so Study can later batch-read it **without waking
the Reviewer again**. The evidence write path must therefore not require a second
model call.


### Audit evidence boundary - 2026-09-28

The source reconciliation did not run tests, start a server, or query a Paperclip instance. Any earlier report of 82 live issues or null live workspace/review settings is an unverified historical claim; current runtime state remains unknown. The `not_creator` policy separates review requester and verdict writer, not necessarily implementation author and reviewer. Execution review rounds default to 3 when that workflow is configured; Coding must use a limit of 2 rejected rounds to allow one correction and then escalate. Do not treat these source-level facts as proof of live activation.


### Content division internals - 2026-10-06 (owner decision)

The owner chose a first Content design. This partly resolves the earlier "Content internals UNRESOLVED" status and is recorded as an owner decision, not a verified implementation.

- Formats: shorts for every platform, long ambient videos, music and music videos, and AI animated shorts. Animation uses AI video generation, not Blender. Start free and spend more only after the concept is validated.
- Pipeline: brief -> batch of single-change variants -> automatic checks -> Content Reviewer -> owner picks with reasons -> publish -> views -> Learning and Memory. Specified in `companies/networked-ai-company/skills/content-pipeline/SKILL.md`.
- Roster, activated in stages with owner approval: Stage 1 Shorts Creator (first) and Content Reviewer; Stage 2 Ambient Creator; Stage 3 Music Creator and Animation Creator. The Content Lead already exists.
- Owner picks and reasons go to the **Learning agent**, not Study. Study runs its own process, based on online research and owner comparison. This differs from the earlier description of Study feeding Learning (see Learning handoff `docs/learning-handoffs/2026-10-06-eval-and-self-check-proposals.md`) and the architecture docs have not been updated.
- Mechanical work (render, cut, loop, loudness, captions, upload, stats) is scripts, not agents.
- Reposting other creators' videos with light edits is not allowed; every video needs a complete license file.
- Open: how the four-active-agent limit counts these roles; no check scripts exist yet; Learning has no reader for owner-pick packets yet; free AI tool limits and terms must be checked at setup.
