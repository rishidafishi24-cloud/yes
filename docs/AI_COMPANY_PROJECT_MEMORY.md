# AI Company — Project Memory (North Star)

**Status:** source of truth. **Owner:** the human. **Last reconciled:** 2026-09-27.

This is the anchor every future agent, coder, and reviewer starts from. It is
deliberately short. Where it conflicts with the repository, **the repository is
wrong, not this file** — record the deviation, do not reinterpret the vision.

Companion documents: `AI_COMPANY_ARCHITECTURE.md` (shape and responsibilities),
`AI_COMPANY_DECISION_LOG.md` (settled decisions and known deviations),
`AI_COMPANY_IMPLEMENTATION_PLAN.md` (dependency-ordered packets),
`AI_COMPANY_EVIDENCE_2026-09-27.md` (what was actually done and verified).

---

## 1. What this is

An existing, heavily customized Paperclip is being turned into an AI company that can
increasingly operate, study itself, improve itself, and safely build upgrades to itself.

It is **not** a new agent framework. It is **not** a collection of unrelated agents.
Most of the infrastructure already exists and must be preserved.

## 2. The shape

```
                        YOU
              vision / goals / authority
                        │
                        ▼
                       CEO                  "AI me"
                        │
                        ▼
                   PAPERCLIP               company nervous system
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
      BRAIN           HANDS             LEGS
     Study           Coding            Tools
    Learning          Game              APIs
   Reflection       Research            MCP
     Memory          Content           CLIs
                     Business          Browser
                        │
                        ▼
                      FEET
                     Skills            HOW / WHEN to use tools
```

Supporting anatomy:

| System | What it is |
| --- | --- |
| **Skeleton** | Git, branches, isolated worktrees, staging, rollback |
| **Eyes / Ears** | tests, logs, screenshots, browser, observability |
| **Immune system** | Reviewer, permissions, tests, approval, rollback |
| **Muscle / Home** | PC, servers, Docker, cloud |

## 3. Authority model

The owner is the source of vision and the final authority. The CEO is "AI me" and
translates intent into company direction **through division leads**, never by
micromanaging workers. The CEO normally receives summaries, blockers, and decisions —
not raw implementation detail.

The system should progressively need *less* intervention, but architectural decisions,
major changes, Study experiments, and Reflection changes require approval **early**.
Autonomy is earned through demonstrated reliability, not assumed.

## 4. The Brain — four distinct functions

These are not interchangeable and must not be collapsed.

- **Study** — "What happened? HOW was it done? WHY did it work?" Examines completed
  work; can compare two independent implementations. Preserves context, HOW, WHY,
  failed approaches, improved approaches, and evidence.
- **Learning** — "What reusable lesson does validated evidence establish?" Generalizes
  from validated outcomes. One anecdote is not truth.
- **Reflection** — "How should this agent operate better next time?" Proposes changes to
  behaviour, instructions, or skills. **Does not apply them automatically.**
- **Memory** — "What durable knowledge should survive, and what is relevant now?"
  Retrieves only relevant context. Does not dump company history into a prompt.

The Brain is the deepest part of the project. Without it this is a task→agent→output
loop. With it, the company studies its own outcomes and does measurably better work
over time.

**The mission is not "have lots of AI employees." It is: build an AI company that
becomes systematically better at doing work because it studies its own outcomes.**

## 5. The Coding Division

```
YOU → CEO → CODING LEAD → { Coder A, Coder B, Reviewer }
```

- **Coder A and Coder B are independent generalists**, not narrow specialists. They may
  take entirely different tasks, or the *same* task independently so Study can compare
  approaches. Default tendencies only — A toward implementation/building, B toward
  debugging/integration/alternative. Preferences, not restrictions.
- **Coding Lead** protects the vision, understands architecture, assigns work, prevents
  scope drift, asks the owner when direction is genuinely uncertain, reports upward.
- **Reviewer** checks correctness, code quality, and whether the assignment was followed.
- After a first rejection a coder gets **one genuine retry**. Repeated failure escalates;
  it must not become an infinite agent loop.

**Quality ordering, applied in this order:**

1. Correctness
2. Code quality
3. Match to the owner's vision
4. Instruction / workflow following
5. Consistency
6. Cost
7. Speed

Cost and speed rank below correctness. A cheaper model that is correct beats an
expensive one that is not.

### The Coding Team also builds the company

There is **no separate Tool Lab**. The Coding Team owns technical upgrades across the
whole company: improving Paperclip, integrating tools, MCP servers, APIs and CLIs,
improving agent infrastructure and its own coding environment, and building what
Research / Content / Game need.

```
Research needs Agent Reach
  → Coding Lead evaluates integration
  → Coder implements and tests it
  → Reviewer verifies
  → Research gets access
  → Skill teaches Research HOW/WHEN to use it
  → Study later measures whether it helped
```

**Coding builds and upgrades the machine. Brain studies and improves how the machine
works. Hands use the machine. Paperclip coordinates the company.**

## 6. Model / Agent / Tool / Skill

Foundational distinctions. Conflating them is how companies sprawl.

| | What it is | Examples |
| --- | --- | --- |
| **Model** | intelligence | GPT, DeepSeek, Gemini |
| **Agent** | employee / role | Coder A, Research, Study, CEO |
| **Tool** | capability | Agent Reach, Playwright, GitHub, browser, API |
| **Skill** | procedure | HOW and WHEN the agent should use the tool |

A powerful new GitHub project **does not normally become another agent.** It is attached
to an existing agent that benefits from it. That was the whole Agent Reach lesson:
Research Agent + Agent Reach = a much stronger Research Agent. (External capabilities
are the **Legs**; skills are the **Feet**.)

## 7. The governing rule: KEEP → FIX → EXTEND

**This is not greenfield.** Substantial infrastructure already exists around routines,
assignment/wakeup logic, dependency and comment wakeups, execution and recovery, agents,
reviews, plugins and connectors, skills, UI, testing, telemetry, tool governance, and
sandboxes. The routine engine, central assignment/wakeup machinery, heartbeat recovery,
and parts of the interaction/reporting infrastructure were explicitly identified as
**not to be rebuilt**.

Every phase begins with:

```
What already exists?  →  KEEP?  →  FIX?  →  EXTEND?  →  only then BUILD?
```

**Inspect what already exists before creating anything new.**

## 8. Designed is not Live

The architecture is **target owner intent**. The repository is **current
implementation**. These are different concepts and are expected to disagree.

```
DESIGNED → CODED → TESTED → BUILT → STAGED → LIVE
```

Something is **LIVE** only when it has been verified on the running instance.

Known current-implementation problems — a wrong Coding Lead prompt, missing instruction
bundles, unusable Hermes configuration, paused Brain automation, hierarchy differences,
and a shared coder workspace conflicting with the isolated-worktree target — **do not
redefine the target.** They become work items.

## 9. How the company changes Paperclip

Neither "rebuild elsewhere for months then deploy once" nor "let agents experiment on
live." The loop is incremental:

```
Current Paperclip
  → configure and use the company shell
  → Paperclip assigns real development work
  → offline / isolated worktree
  → Coder builds the change
  → Reviewer
  → tests
  → integration
  → staging
  → OWNER APPROVES
  → publish / deploy
  → Paperclip vNEXT
  → repeat
```

Git lifecycle:

```
Official upstream
  → stable custom main
  → integration
  → isolated coder worktrees / feature branches
  → Reviewer + tests
  → integration
  → staging
  → human approval
  → stable
  → live Paperclip
```

**Coders do not experiment on stable or live.** The recursive payoff:

```
Paperclip company → Coding Team → builds upgrade safely offline
  → review + tests → owner approves → Paperclip upgrades itself
  → better Paperclip builds the next upgrade
```

## 10. UI vision

Chat-first, not a wall of infrastructure screens. Without digging through raw logs, the
owner should see: CEO/agent conversation, current project, active agents, current tasks,
blockers, approvals, **NEEDS YOU**, and Memory/Study.

**"Needs You" is highly visible because the owner is the scarce resource.** The owner
also wants to *watch agents work* — what they are touching, tests, errors, progress,
runtime — closer to watching an agent in VS Code or Zed than reading a report.

## 11. Free-superpower philosophy

Prefer high-quality free/open/local tools over building capability ourselves, and give
them to the **correct existing agent.**

- **Research** → Agent Reach, Crawl4AI, SearXNG, MarkItDown / Docling, browser tooling
- **Coding** → OpenCode, pstack, Context7, GitHub MCP, ast-grep
- **Reviewer** → Semgrep, Trivy, Gitleaks / TruffleHog, Playwright
- **Study** → Promptfoo, Phoenix, Paperclip run evidence
- **Memory** → existing Postgres first, Postgres FTS, pgvector if semantic retrieval is
  justified, possibly Graphiti later
- **Content** → ComfyUI, FFmpeg, whisper.cpp, yt-dlp
- **Game** → Godot, Blender, coding/browser/visual verification

**These are candidates, not mandates.** Do not prematurely decide Memory = Mem0,
Content = ComfyUI, or Research = Agent Reach forever. Architecture defines capabilities
and responsibilities; tools can change.

## 12. Model strategy

Strong reasoning models are for **reading and compressing**, not routine implementation.

**Use them to:** understand the large repo, map dependencies, identify existing systems,
find architectural traps, design subsystem boundaries, decide implementation ordering,
write precise implementation packets, review major milestones.

**Do not use them for:** CRUD, boilerplate, CSS, routine TypeScript, simple bug fixes,
hundreds of ordinary implementation lines.

The principle: **use the strong model to create the map and the rails; let coding-oriented
models walk the map.** Architecture plus decision log plus the actual repo, compressed
into a dependency map, phases, contracts, invariants, and tests — that is the highest
leverage use of a strong model in a build this size.

## 13. The one-paragraph version

I am building my existing customized Paperclip into a self-improving AI company, not
starting a new agent framework from scratch. I remain the source of vision and final
authority; the CEO is "AI me" and translates my intent through division leads. Paperclip
is the company and nervous system. Hands do work; Legs are external tools; Skills teach
HOW and WHEN to use them; Git, worktrees, tests, and staging form the safety skeleton.
The Brain is Study, Learning, Reflection, and Memory, and exists so the company learns
from validated work instead of merely completing tasks. The Coding Team — Coding Lead,
two independent generalist coders, and Reviewer — owns technical implementation and
upgrades for the entire company, including improving Paperclip and integrating tools;
there is no separate Tool Lab. A great deal already exists, so always inspect and
KEEP → FIX → EXTEND before building anything new. New code is developed offline in
isolated worktrees, reviewed, tested, and staged, then published into the running
Paperclip after human approval, allowing Paperclip to progressively help build and
improve itself. Strong reasoning models should mostly understand the whole repo, define
architecture and dependency maps, and review major milestones; coding-oriented models
should implement. **Do not reopen settled architecture decisions simply because today's
repository differs from the target.**

## 14. Genuinely unresolved

Most architecture questions are settled. Stop reopening them. The remaining open
questions are narrow:

1. **Does the max-4-active-agents limit include CEO / Brain / Reviewer, or only active
   workers?** — This blocks plan packet T03. It is an owner decision.
2. **How many correction attempts does a coder get after a rejection?** The owner
   archive states one genuine retry then escalation to the owner; the implementation
   defaults to 3 rejected rounds. Owner must say which is authoritative.
3. What is the exact internal organization of **Game, Business, Content?**
   Named deliberately, not yet internally designed. Research is now settled.
3. What technologies eventually implement **Memory**, and which candidate tools survive
   testing?

These are decided when actual implementation dependencies require it, not before.

**Trading currently exists in the repository but is not part of the approved target
architecture.**

## 15. How agents should treat this file

- Read it before designing anything.
- If the repository contradicts it, **the repository is the deviation** — record it,
  do not reinterpret the vision.
- If a task appears to require reopening a settled decision, stop and ask the owner
  instead of choosing.
- Prefer extending what exists over adding a parallel system.
