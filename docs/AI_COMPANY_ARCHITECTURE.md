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
- **Research** — structure settled by owner decision 2026-09-28: a central
  Research Lead with specialized researchers (Coding, Game, Content, Business,
  Trading). Researchers answer requested research and may proactively discover
  useful external material within budget. Their findings are candidate evidence,
  not company truth (§16).
- **Game**, **Business**, **Content** — exist conceptually; their **final
  internal architectures are UNRESOLVED**. Content's outer shape is fixed
  (Content Lead → creators → Content Reviewer → publish/approval → real-world
  performance → Content Study → Learning/Reflection/Memory), but its internals
  are not designed. Do not invent the rest.

Do not instantiate any of these just because they are listed. The coding and
verification foundation is the immediate priority (§16).

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


---

## 16. Owner clarification - 2026-09-28

This section records the owner's later, explicit clarification of the target. Where it conflicts with earlier design wording, this section governs; it does not claim the design is implemented.

### Priority and scope

The two company missions are reliable software production through independent verification and evidence-driven improvement, followed by scalable content-production systems that can learn from real production outcomes. The coding and verification foundation is the immediate priority. The listed future leadership sequence is a direction, not authorization to instantiate every division. Keep implementation focused on Coding unless an existing implementation already covers more.

The owner is the final authority. The CEO represents owner intent and escalates material drift. Paperclip remains the orchestration layer. Reliability evidence earns autonomy; confidence alone does not. Preserve uncertainty and provenance, minimize unnecessary wakeups and token/API use, and require a rollback path for major changes.

### Coding and verification contract

The Coding Lead selects task topology: one coder, collaboration, parallel feature work, or isolated A/B comparison. Coder A and B remain generalists. Independent A/B work must stay isolated until both submissions are complete.

Review is required for submitted implementation. The Reviewer is read-only, assesses the exact submitted revision, and uses the strongest suitable available reasoning model. Reviewer activation is event-driven for actual submissions, with no polling and no implementation work. The Tester combines deterministic checks with independent behavioral judgment when the risk or evidence warrants it. A rejection returns to the coder for one genuine correction attempt; a second failure escalates to the owner. Initially, important changes and releases remain owner-approved.

Verification depth is risk-tiered and configurable. Evidence can include build/compile, static checks, unit/integration/regression tests, security/dependency review, runtime behavior, exact-revision identity, independent Tester and Reviewer findings, and relevant benchmarks/evals. Do not encode a permanent tier policy without owner approval. Sensitive work includes Paperclip self-modification, agent instructions, Knowledge/Memory, security/permissions, deployment, database changes, and financial execution.

### Evidence and knowledge flow

Reviewer and Tester evidence is compact and structured, bound to the task and exact revision, and records agent/model/configuration, outcome, finding category and severity, evidence, attempt, correction result, time, and measurable cost. Evidence storage must be deterministic and must not call a model merely to persist an event. Keep failure/correction pairs; strong outcomes may also record why they worked.

Coding Study learns primarily from evidence produced by real work; it does not monitor or poll agents. It may compare historical outcomes and prepare temporary evaluation sets. It requests a controlled experiment from Coding Lead only when an important question cannot be answered from existing evidence. Idle capacity is not a reason to experiment. Research findings are candidate evidence, not company truth. Relevant validated coding outcomes flow through Study, Learning, Reflection, then Coding Memory; Reflection proposes behavior changes and owner approval initially gates their application.

Durable learning records support claim, evidence/provenance, scope, confidence, performance, cost, speed, version/date, superseded knowledge, and rollback reference. New evidence supersedes old claims without erasing history. Agent experience belongs to the persistent role identity and remains useful when its model changes. Retrieve only a small, highly relevant context set at task start. Keep company, project, domain, and individual-agent memory scoped.

Tools, MCPs, APIs, CLIs, plugins, and skills are capabilities with explicit scopes, including read, write, external communication, spending, publishing, deployment, destructive actions, secrets, and financial execution. Paperclip remains the control plane.

---

## 17. Source reconciliation - 2026-09-28

A read-only reconciliation of the repository against §16. It changed no product
code. Every row below was verified by reading source; "verified" means the claim
was checked at the cited path, not that the behavior was exercised at runtime.

**Why this section exists:** §1-15 record design intent, and the 2026-09-27
inventory documents record a live-system snapshot taken before the source package
was corrected. Reading either alone gives the wrong answer about what remains.
This section is the current three-way record: **source / built / live**.

### 17.1 Three states, not one

| State | Meaning | How to change it |
| --- | --- | --- |
| Source | files in this worktree | edit + commit |
| Built | `pnpm build` output | rebuild |
| Live | the running instance | activate via `scripts/instruction-activation/` + owner approval |

Source, built, and live diverge independently. `companies/networked-ai-company/`
is a **source package that has never been imported or activated**; the live
instance still runs the older bundles preserved in
`scripts/instruction-activation/original-live-bundles/`. The corrections below are
real in source and invisible live. This resolves the apparent contradiction
between the 2026-09-27 inventory (shared workspace, non-gate reviewer) and the
current package files.

### 17.2 Coding + verification foundation, as actually implemented

| Capability | Status | Evidence |
| --- | --- | --- |
| Instance-wide execution capacity | `CODED`, unmerged | `agent1/global-capacity` commits `fbb3d518a`, `e91692d38`; `packages/shared/src/execution-capacity.ts`, `server/src/services/execution-capacity.ts`. Not present in this worktree. |
| Real git worktree isolation | `IMPLEMENTED`, unselected | `server/src/services/workspace-runtime.ts:3559` `worktree add`; strategy defaulting `execution-workspace-policy.ts:404-414` |
| Review independence (not creator) | `IMPLEMENTED` | `server/src/services/issue-review-policy.ts:100-147`; fails closed at `:90-94` |
| Bounded correction attempts | `IMPLEMENTED`, default-off | `server/src/services/issue-execution-policy.ts:69` `DEFAULT_MAX_REVIEW_ROUNDS = 3`; escalation `:865-868` |
| Exact-revision evidence contract | `CODED`, unwired | `packages/shared/src/delivery-evidence.ts`; strongest form committed at `15bc8725b` on `codex/delivery-evidence-proof` |
| Review bound to a revision | **MISSING** | `issue-review-policy.ts` contains no revision/commit/SHA concept. The `revision` fields in `server/src/routes/issues.ts` are document/thread optimistic-concurrency counters, not code revisions. |
| Reviewer capability-limited (read-only) | **MISSING** | Reviewer is a distinct agent with its own workspace — structural isolation, not enforced read-only. No write-denial path exists. |
| Risk-tiered verification | **MISSING** | `riskTier` exists only on connection definitions (`packages/shared/src/types/app-definition.ts:26`); no delivery risk tiering. |

### 17.3 The one structural gap

Evidence and review are individually sound but **disconnected**.
`delivery-evidence.ts` requires `review.revisionReviewed === submission.sha`,
while the live review path has no notion of a revision. Merging capacity alone
does not close this: nothing currently produces a commit SHA, a stored verdict,
or an owner approval record for a real submission. Until a revision identity
exists on the review verdict, the `STAGED` and `LIVE` gates cannot be driven by
real work.

### 17.4 Brain, as actually implemented

The Brain work in `/home/god/codex-r01-instruction-recovery` is `CODED` and
uncommitted: 8 tables (`packages/db/src/schema/brain.ts`), migration `0284`
(journaled), validators, and 7 services (1203 lines). It has **no routes, no
importers, no callers, and no tests** — nothing can reach it. Status is `CODED`
and nothing higher.

Two KEEP findings that the companion gap analysis omits:
- A built-in agent `key: "learning"` already exists
  (`server/src/services/built-in-agents.ts:316`) with the same intent. The new
  `brainLessons` table supplies the persistence the built-in lacks, so this is
  EXTEND, not BUILD — but the overlap must be stated, not silently duplicated.
- `reflection-coach` already enforces "propose, do not apply in the same run" as
  a **runtime mutation policy** (`built-in-agents.ts:340-347`). The new
  `brainReflectionService.apply()` enforces the same rule in application code
  only, mutates no agent configuration, and does not re-implement the
  "never reflect on yourself" guard. Only the proposal→approval→apply audit row
  is genuinely new.

Study and Memory have no existing equivalent and are justified additions.
Supersession (`memory.ts:95-100`) and budgeted retrieval (`memory.ts:118-126`)
already satisfy §16's supersession and small-context requirements.

### 17.5 Company package conflict

`companies/networked-ai-company/` inverts the §16 priority:
`COMPANY.md:26-31` ranks Content/Business production first and Coding
infrastructure third, and `projects/primary-operations/PROJECT.md:8` states
"Content and Business are the default priority." `README.md:12` calls the
Reviewer "not a mandatory QA gate" while `agents/reviewer/AGENTS.md:13,19` and
`agents/coding-lead/AGENTS.md:19,49` mandate independent review before
integration or release. The package also provisions 20 agents across Game,
Content, Business, Trading and six memory specialists, against §16's instruction
not to instantiate every listed division.

Neither the mandate nor the isolation language is runtime-enforced: all 82 live
issues report `executionWorkspaceId: null` and `reviewPolicy: null`. Instruction
text is not enforcement.

### 17.6 Consequence for the next batch

The foundation is **CODED, not TESTED, and not LIVE**. In dependency order:
close the capacity claim-path gap and land that branch; give the review verdict a
revision identity and wire the existing evidence contract to it; then exercise
one real task end to end. Do not build Brain wiring, routes, or agents before the
coding cycle produces trustworthy evidence — §16 states this directly, and the
unmerged Brain is the clearest existing example of work that outran its
evidence.


### 17.7 Evidence boundary correction - 2026-09-28

This subsection supersedes any unqualified live-state statements above. This reconciliation read source and worktree files only: it did not run tests, start a server, or query a Paperclip instance. The reported count of 82 live issues and their null workspace/review settings is an unverified historical claim, not a current observation. The active policy and live instructions/build/runtime remain unknown.

The source review policy's `not_creator` check separates the writer who requested the review from the verdict writer when configured. It does not by itself prove that the verdict writer differs from the implementation author. Refer to this as requester/verdict-writer separation, not full author/reviewer independence.

Execution review rounds default to 3 agent-initiated changes-requested rounds when the policy is applied. The target permits one genuine correction after the initial rejection, so Coding must configure escalation after 2 rejected rounds and prove that configuration is active. This source behavior is not proof of the target policy in the live company.
