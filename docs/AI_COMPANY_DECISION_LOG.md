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

- Game, Business, Content, Research and future Hands exist conceptually.
- Their final internal architectures are **UNRESOLVED**.
- Do not invent their final designs.

---

## OPEN DECISIONS

- Exact definition of the 4-agent concurrency cap (which roles count).
- Final Memory retrieval implementation.
- Final Research division design.
- Final Game division design.
- Final Business division design.
- Final Content division design.
- Final per-agent tool belts.
- Exact thresholds for increasing autonomy.

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
