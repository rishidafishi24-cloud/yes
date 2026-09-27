# AI Company Architecture

> **This document is the architecture source of truth.**
>
> The current implementation may differ from this target. **Do not assume an
> item is implemented merely because it appears here.** Verify each claim against
> a running system and report it using the status vocabulary below.
>
> `DESIGNED` · `CODED` · `TESTED` · `BUILT` · `STAGED` · `LIVE`
>
> A component is only `LIVE` once verified on the running instance. Design
> intent alone is never evidence of implementation.
>
> Companion: `docs/AI_COMPANY_DECISION_LOG.md` (owner decisions and known
> implementation deviations).

---

## 1. Mission

- Automate useful work for the owner.
- Continuously study completed work and improve how agents/code perform.
- Learning how to produce better work is a core purpose.
- Stronger or weaker models must be replaceable without collapsing the workflow.

Execution is the mechanism; improvement is the purpose. Reliability must come
from the architecture, not from assuming every agent is equally capable.

---

## 2. Company Model

| Part | Mapping | Responsibility |
|---|---|---|
| **Human** | owner | vision, goals, final authority |
| **CEO** | interpreter / "AI me" | translates owner intent into company direction |
| **Paperclip** | company OS / nervous system | carries signals between all parts |
| **Brain** | cognition | Memory · Study · Learning · Reflection |
| **Hands** | divisions / agents | actually producing work |
| **Legs** | tools | plugins, APIs, connectors, OpenCode, pstack, n8n, external capabilities |
| **Feet** | skills | procedures teaching agents **HOW** and **WHEN** to use tools |
| **Skeleton** | Git | branches, worktrees, integration, staging, rollback |
| **Eyes & Ears** | observability | tests, browser inspection, screenshots, logs, activity/telemetry |
| **Immune System** | governance | Reviewer, tests, permissions, rollback |

This is a structural model for understanding, not a mandate to anthropomorphise
behaviour.

---

## 3. Human

- Holds the final vision and authority.
- Human involvement is high initially.
- Autonomy increases only after demonstrated reliability.
- Major architectural changes initially require owner approval.

---

## 4. CEO

The CEO is the owner's **AI representation** — the interpreter of intent.

- Translates owner intent into company direction.
- **Works through leads** rather than bypassing them.
- Receives concise completion summaries and blockers.
- **Deep technical detail belongs in Memory** rather than flooding the CEO.

---

## 5. Brain

Four distinct functions. They must not be merged: different inputs, outputs, and
standards of evidence.

### 5.1 Study

- Examines **completed work** — context, **HOW**, and **WHY**.
- **Records failed approaches as evidence.**
- May compare **two independent solutions to the same task**.
- Operates mostly **after completed work / at night / in background**.
- During the day may research techniques, experiments, and new ideas.
- **Study experiments require owner approval initially.**
- Research may feed new techniques/tools to Study for evaluation.
- When metrics cannot determine quality, **ask the owner** and preserve the
  owner's judgment as evidence.
- Study **must not skip evidence preservation** in order to immediately "fix"
  something.

### 5.2 Learning

Extracts **reusable lessons** from **validated outcomes** — not blindly from a
single event.

### 5.3 Reflection

- Analyses trajectories, failures, and reviews.
- **Proposes** improvements to agents and workflows.
- Does **not** initially self-apply its own proposals.

### 5.4 Memory

- Stores durable company / project / branch knowledge.
- Retrieves **only relevant context**.
- **Never dumps entire history** into agents.

---

## 6. Brain Pipeline

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

## 7. Study Catalog

Catalogued **by problem / context**, not chronologically. Each entry records:
context, approach, **HOW**, **WHY**, failed approach, improved approach,
supporting evidence / tests / results, and owner judgment where the owner
decided.

---

## 8. Hands (Divisions)

The Hands actually produce work.

- **Coding** — fully specified (§9).
- **Game**, **Business**, **Content**, **Research**, and future divisions —
  exist conceptually; their **final internal architectures are UNRESOLVED**.

---

## 9. Coding Division

```
Owner
  ↓
CEO
  ↓
Coding Lead
  ├── Coder A
  ├── Coder B
  └── Reviewer
```

### 9.1 Coding Lead

- Protects owner vision and architecture.
- Assigns work and monitors coders.
- **Can stop drifting work:** stop → explain → ask owner if uncertain → rewrite
  task → restart.

### 9.2 Coder A and Coder B

- **Independent generalists.** They may have tendencies but must not be
  permanently trapped in narrow roles.
- May each be given the **same task independently**, so Study can compare.
- **Must not see each other's unfinished solution.** They may receive the same
  validated Memory lessons and context.
- The owner currently chooses their models; models remain replaceable.

### 9.3 Reviewer

- Checks **correctness**, **code quality**, and **instruction following**.
- **May reject work.**
- After a first rejection, the coder **normally gets another genuine attempt**.
- **Repeated failure stops and escalates** rather than looping indefinitely.

---

## 10. Legs (Tools) and Feet (Skills)

| Term | Means |
|---|---|
| **Model** | intelligence |
| **Agent** | employee / role |
| **Tool** | callable capability |
| **Skill** | procedure for using a capability |

- Legs are the capabilities that let agents act outside themselves: plugins,
  APIs, connectors, OpenCode, pstack, n8n, external tools.
- Feet teach agents **HOW** and **WHEN** to use them.
- **Skills teach; tools execute.** They remain separate where practical.

### 10.1 Coding Team Owns Technical Upgrades

The **Coding Division** is responsible for implementing and maintaining technical
capabilities across the company:

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
Coder integrates and tests it
  ↓
Reviewer verifies correctness / safety / quality
  ↓
tool is assigned to appropriate agent(s)
  ↓
relevant Skills teach HOW / WHEN to use it
  ↓
Study may later evaluate whether the capability actually improved outcomes
```

**The Coding Team IMPLEMENTS the technical capability.** The receiving division
determines operational use according to its role and design.

---

## 11. Quality Priorities

When trade-offs conflict:

1. **Correctness**
2. **Code quality**
3. **Match owner vision**
4. **Instruction / workflow following**
5. **Consistency**
6. **Cost**
7. **Speed**

The owner separately emphasised **cost** and **closeness to vision**. Cheap
incorrect work is not a success.

---

## 12. Concurrency

**Maximum 4 active agents.** Additional work **queues** rather than exceeding
the cap.

> **UNRESOLVED:** the 4-agent limit refers to **concurrent activity**, not total
> configured agents. **Exactly which roles count toward the limit remains
> UNRESOLVED.** Do not invent an answer.

---

## 13. UI Target

Intent only — not an implementation specification.

Current problems: the UI is **slow, inaccurate, and confusing**.

Target: a **chat-first command center**, not a wall of technical logs. Project
context, active agents, tasks, blockers, and approvals should be understandable,
with a **highly visible "Needs You"** area, and Memory/Study visible without
overwhelming the owner with raw logs.

---

## 14. Git / Deployment Target

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

- **Coders do not experiment directly on stable / live.**
- New implementation belongs in **isolated worktrees**, followed by review,
  tests, staging, owner approval, and deployment.
- Live deployment initially requires owner approval.
- **Never assume editing source means the live system changed.** Source, built
  artifact, and live are three distinct states.

**KEEP → FIX → EXTEND.** Audit before rebuilding; a lot already exists.

---

## 15. Autonomy

Human involvement is high initially. The owner approves major changes, Study
experiments, architecture changes, and important Reflection changes.

More automation only after the system demonstrates reliability. Automation is
*earned* by evidence, never granted in anticipation.
