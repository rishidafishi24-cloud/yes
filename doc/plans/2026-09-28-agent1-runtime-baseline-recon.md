# Agent 1 — Runtime / Coding Workflow — Phase 1 Baseline Recon

**Status:** `DESIGNED` → recon complete; **no production code changed**.
**Date:** 2026-09-28. **Agent:** Agent 1 (Runtime / Coding Workflow Engineer).
**Repo:** `/home/god/paperclip-source` (WSL). **Instance:** `default`.
**Location:** this file follows repo `AGENTS.md` rule #5 — plan docs live in
`doc/plans/` with a `YYYY-MM-DD-slug.md` name. (Initially written to
`docs/AI_COMPANY_*` style location and relocated to comply.)

---

## 0. Baseline record (recorded BEFORE any modification)

| Fact | Value |
|---|---|
| HEAD | `cb9d519633073d677d36c04829f306c50d320781` |
| Branch | `my-paperclip-custom` (no upstream) |
| Dirty entries | 68 (`12 A`, `11 AM`, `16 M`, `2 MM`, `27 ??`) |
| Staged files | 25 |
| Live instance pid/port | `318` / `127.0.0.1:3100` |
| Live company id | `7888775d-334a-4892-9784-00c48f1b56cc` |
| DB | embedded postgres, `127.0.0.1:54329` |
| Installed runtime | `~/.paperclip/cli/current/.../paperclipai` (**not** this source tree) |

**Worktrees (untouched):**
- `/home/god/paperclip-source` — `my-paperclip-custom`
- `/home/god/codex-r01-instruction-recovery` — `codex/r01-instruction-recovery` (belongs to another task; untracked `scripts/instruction-activation/`)
- `/home/god/pc-fingerprint-fix` — `fix/session-fingerprint-ephemeral`
- `/home/god/task-44` — `task-44`
- `/mnt/c/.../work/paperclip-evidence` — `codex/delivery-evidence-proof`

**Preservation verified:** 68 dirty entries before and after recon (69 including
this one added file). Zero files modified, staged, committed, reset, cleaned, or
deleted. All temporary recon scripts were created under `scripts/tmp-agent1-*`
and removed.

### Repository guidance read (AGENTS.md §2 "Read This First")

| Doc | Lines | Read |
|---|---|---|
| `AGENTS.md` | — | full |
| `doc/GOAL.md` | 58 | present |
| `doc/PRODUCT.md` | 211 | present |
| `doc/SPEC-implementation.md` | 1695 | targeted (§11.6 scheduler, review) |
| `doc/DEVELOPING.md` | 1615 | present |
| `doc/DATABASE.md` | 434 | present |
| `doc/execution-semantics.md` | 1435 | targeted (admission) |
| `doc/plans/2026-03-10-workspace-strategy-and-git-worktrees.md` | — | prior art on isolation |

Binding rules that constrain this work:
- **§5.1 company scoping** — every change stays company-scoped.
- **§5.2 keep contracts synchronized** — `packages/db` → `packages/shared` →
  `server` → `ui`, or the change is not done.
- **§5.3 control-plane invariants** — single-assignee tasks, atomic checkout,
  approval gates, budget hard-stop, activity logging on mutations.
- **§7 verification** — `pnpm test` is the cheap default; `pnpm -r typecheck`,
  `pnpm test:run`, `pnpm build` before a repo-work claim. Narrowest sufficient
  check preferred; report anything not run.
- **§5.4** — do not replace strategic docs wholesale.

---

## 1. BLOCKER — owner decision required before Phase 2

`docs/AI_COMPANY_DECISION_LOG.md` (§CONCURRENCY) and
`docs/AI_COMPANY_IMPLEMENTATION_PLAN.md` (T03) **both** state the scope of the
4-agent cap is unresolved and that **no implementation task may silently decide
it**:

> "Maximum 4 active agents for now." … "**UNRESOLVED:** exactly which roles
> count toward the 4-agent limit."

> "The target maximum is four active agents. Which roles count remains
> unresolved; no implementation task may silently decide that."

> T03 Constraints: "the owner must settle which roles count before enforcing the
> company-wide four-agent rule."

**Phase 2 is therefore blocked on an owner decision.** I have not implemented a
cap, because any choice I made would silently settle an explicitly reserved
owner decision. The enforcement point is identified and ready (§3) — only the
predicate is missing. See §7 for the exact question.

---

## 2. What actually exists (KEEP)

Substantial, correct infrastructure already exists. Do **not** build parallel
systems for any of these.

| Concern | Existing implementation | Assessment |
|---|---|---|
| Per-agent run cap | `heartbeat.ts:19818` `policy.maxConcurrentRuns - runningCount` → `availableSlots` | **KEEP** — works, per-agent only |
| Cap default | `packages/shared/src/constants.ts:77` `AGENT_DEFAULT_MAX_CONCURRENT_RUNS = 20` | KEEP |
| Cap normalization | `heartbeat.ts:649-651` clamps to `[1, 50]` | KEEP |
| Admission serialization | `server/src/services/agent-start-lock.ts` `withAgentStartLock` | **KEEP but weak** — see §3 |
| Atomic run claim | `heartbeat.ts:~17540` conditional `UPDATE ... WHERE status='queued'` in a transaction | **KEEP** — correct primitive |
| Queued-run promotion | `startNextQueuedRunForAgent` (`heartbeat.ts:19803+`) | KEEP — natural cap insertion point |
| Workspace isolation | `execution-workspace-policy.ts`, `git_worktree` strategy, `execution-workspaces.ts`, `workspace-realization.ts` | **KEEP** — fully implemented, unused |
| Assignment/wakeup | `issue-assignment-wakeup.ts`, `issue-comment-wakeup.ts`, `wake-queue/` module | KEEP |
| Review policy | `issue-review-policy.ts` (`anyone`/`human_only`/`not_creator`) | KEEP |
| Run/activity evidence | `heartbeat-runs`, `activity-log.ts`, `run-liveness.ts` | KEEP |

---

## 3. Gap list

### G1 — No global/company-wide execution cap (BLOCKED, §1)
Only `countRunningRunsForAgent(agentId)` exists (16896). `grep countRunningRuns`
across `server/src` returns **no company-scoped equivalent**. With 26 agents
each at `maxConcurrentRuns: 1`, the theoretical ceiling is **26 concurrent
runs**, not 4.

**Spec-level finding (new, important):** `doc/SPEC-implementation.md` §11.6
defines `maxConcurrentRuns` as a **per-agent** scheduler field
(`new agents default to 20; scheduler clamps configured values to 1..50`), and
`doc/execution-semantics.md` defines admission gates in terms of *per-run*
concerns (locks, budgets, pause holds, recovery). **There is no
company-scoped capacity concept in the Paperclip spec at all.**

Consequence: the owner's "max 4 active agents" is an **overlay on top of
Paperclip's product model, not a missing Paperclip feature.** Implementing it
means adding a new capacity dimension Paperclip does not model. That is a
larger design decision than "add a counter" and is a second reason — beyond the
reserved owner decision in §1 — not to silently pick an implementation.

### G2 — Start lock cannot guarantee the cap (correctness, not blocked)
`agent-start-lock.ts` is **process-local** (`new Map()`), keyed per agent, with a
30s staleness timeout that **logs a warning and proceeds anyway**:

```ts
const AGENT_START_LOCK_STALE_MS = 30_000;
...
logger.warn({ agentId, staleMs }, "agent start lock stale; continuing queued-run start");
return;   // <-- proceeds WITHOUT the lock
```

Consequences:
- A slow claim exceeding 30s lets a concurrent caller **continue unlocked** —
  a real bypass path for any cap enforced inside the lock body.
- The lock is **per-process**. A second Paperclip process (or a future
  multi-instance deployment) gets an independent map.

**Consequence for Phase 2:** a cap enforced inside `withAgentStartLock` is
*not* sufficient. Correct enforcement must be at the **database** layer — the
conditional `UPDATE ... WHERE status='queued'` in `claimQueuedRun` — so that
the limit holds across processes and independent of lock timeouts. The
per-agent slot arithmetic (`availableSlots`) must be re-checked against a
company-wide count inside the same transaction.

### G3 — Stale-run slot leakage
`process_lost` appears **8 times** in live failures ("server may have
restarted", plus child-pid-lost entries). A crashed run that never transitions
out of `running` would permanently consume capacity. Existing
`run-liveness.ts` + `heartbeat-process-recovery` logic exists and must be
verified to release slots; this is a **verification** task, not a build task.

### G4 — Deviation 7 is LIVE: shared workspace, not isolated worktrees
Live project `optimizeo` policy (read from API):

```json
{"enabled": true, "sharedWorkspaceConcurrency": "serialize",
 "defaultMode": "shared_workspace",
 "defaultProjectWorkspaceId": "8ef8d3eb-2b5f-4d0f-a3e0-8b6a714b0b9a"}
```

`defaultMode: "shared_workspace"` → cwd `/home/god/paperclip-source`, which is
**the same dirty checkout I am working in** (68 dirty entries, 25 staged).
This is the single true architectural conflict recorded as Deviation 7.

- `git_worktree` strategy **is fully implemented** and simply not selected.
  This is a deliberate, documented Paperclip product decision — see
  `doc/plans/2026-03-10-workspace-strategy-and-git-worktrees.md`, which
  explicitly declines to make "every agent uses git worktrees" a universal
  product requirement. So G4 is a **tenant configuration choice**, not a bug
  in the isolation implementation.
- Available modes (`packages/shared/src/types/workspace-runtime.ts:10-24`):
  `shared_workspace`, `isolated_workspace`, `operator_branch`, `adapter_default`,
  `reuse_existing`, `inherit`.
- `applyDefaultIsolatedExecutionWorkspacePolicy` already handles feature-gating
  and inheritance — **KEEP**, do not rewrite.

**All 82 issues have `executionWorkspaceId: null` and
`executionWorkspaceSettings` unset (inherit)**, and `reviewPolicy: null` on
**all 82**. So the isolation and review machinery is entirely unexercised.

### G5 — Reviewer is not independent, and review is not a gate
`issue-review-policy.ts` `not_creator` compares against the **review requester**,
not against implementers. Proof of reviewer independence is absent.
`Reviewer/AGENTS.md` per the implementation plan explicitly *favors selective
peer review rather than a mandatory release gate* — contradicting the Phase 4
requirement that review is a real gate.

### G6 — Bounded retry not enforced
No evidence of attempt-count tracking on issues. `heartbeat-runs` has
`retryOfRunId` / `processLossRetryCount` / `continuationAttempt`, but nothing
enforces "one genuine retry after rejection, then escalate."

### G7 — Instruction delivery unverified for real runs
`instructionsBundleMode: "managed"` with per-agent
`instructionsRootPath` under the instance dir. Whether a real adapter run
actually receives the effective bundle is **unverified** — this is exactly the
Phase 3 requirement and cannot be answered by config inspection alone.

### G8 — Live agents do not match target architecture
26 live agents. Target Coding Division is Coding Lead + Coder A + Coder B +
Reviewer. Live reality:

- Coders are **`Coder 1` and `Coder 2` on `branch: game`**, not coding — and
  **`Coder 1` uses `hermes_local`** while all other coders/lead use
  `opencode_local`.
- **`Agent Coder`** (engineer, branch `coding`, `opencode_local`) exists and is
  unaccounted for in the plan.
- `Reviewer` and `Tester` are both on `branch: game`.
- `Learning Agent` has **no** `runtimeConfig.heartbeat` at all
  (`maxConc=undefined`, `hb=undefined`).
- 5 `Memory *` agents are Agent 2's territory — **do not touch**.
- `Reflection Coach` is `paused`.

### G9 — Adapter failures dominate
Of 300 recent runs: `succeeded 80`, `failed 83`, `cancelled 37`, **0 running/queued**.
Failure causes: missing OpenRouter API key (12), `Failed to start command
"hermes"` (17), model unavailable (`openrouter/stealth/space-bunny-alpha`, 1),
Cursor usage limit (3), missing OpenAI key (2), `process_lost` (8).
**Coding Lead alone has 23 failures.** No task will execute end-to-end until
adapter auth is fixed. This is a live-config prerequisite, not code.

---

## 3A. Cross-check: agreed plan (2026-09-28) vs live reality

An owner planning session produced an agreed plan and a plan-vs-current
comparison. That plan file lives **outside this repository** (another session's
`outputs/PAPERCLIP_AGREED_PLAN_2026-09-28.md`), so it could not be read
directly. Its **comparison claims** were instead re-verified against the live
API. Findings:

### Claims CONFIRMED by independent evidence

| Claim | Verified evidence |
|---|---|
| Coding branch has only Coding Lead + Agent Coder | `branch=coding` → exactly 2 agents |
| The coders / Reviewer / Tester belong to Game | `branch=game` → Coder 1, Coder 2, Reviewer, Tester, Game Lead — all report to **Game Lead** |
| Agent Coder reports to Coding Lead | `Coding Lead` direct reports = `Agent Coder` only |
| No Study agents exist | Only `Learning Agent` (idle) and `Reflection Coach` (paused) match study/learn/reflect |
| No Content Researcher | Researchers present: Business, Code, Game, Research Lead, Trading. No Content. |
| 4-run global limit not established | Confirmed — per-agent only (G1) |
| Serialized shared workspace default | Confirmed (G4) |

### New findings the comparison did NOT report

**N1 — The Learning Agent is a second org root.**
It is one of only two agents with `reportsTo: null` (`CEO` and `Learning Agent`).
It therefore sits **outside the CEO hierarchy** and can never be reached by
CEO → lead routing. The agreed plan states all Study agents "share one Learning
agent" — a root-level orphan cannot be woken by division leads.

**N2 — The Learning Agent has no `heartbeat` block at all.**
Its entire `runtimeConfig` is `{aiConnection: {...}}`. There is no
`heartbeat.enabled`, no `cooldownSec`, no `maxConcurrentRuns`. The other 25
agents all have a heartbeat block. This means the shared Learning agent has no
scheduling configuration whatsoever — consistent with Deviation 4 in the
decision log.

**N3 — 17 of 26 agents have `heartbeat.enabled: false`.**
This is far more severe than "the four-run limit isn't set". The company cannot
do sustained work at all: CEO, both coders, Reviewer, Tester, Agent Coder, and
4 of 5 Memory agents are all **timer-disabled**. Only 9 agents are timer-enabled.
The agreed plan's first milestone (coders work → reviewed → tested → studied)
is **not reachable** until this is addressed.

**N4 — The agreed plan's "one Study agent per major division" resolves a
question the decision log says is UNRESOLVED.** The decision log lists Game /
Business / Content / Research internal design as UNRESOLVED, and
`AI_COMPANY_PROJECT_MEMORY.md` §14.2–14.3 repeats it. If the owner's 2026-09-28
session settled that Study exists per division, that is a **new owner decision**
that should be written into `AI_COMPANY_DECISION_LOG.md`. It is not recorded
there. Agent 1 does not own that doc and will not edit it unilaterally.

**N5 — Model availability blocks execution.**
`space-bunny-alpha` is the model on 13 agents (two spellings: `openrouter/…`
and bare `stealth/…`). Live failures include `Configured OpenCode model is
unavailable: openrouter/stealth/space-bunny-alpha`. Combined with G9, no
reliable end-to-end run is currently possible.

### Where the comparison was right to be cautious

It correctly separated "exists in source" from "is live" — the running service
is the installed bundle at `~/.paperclip/cli/current` (`2026.916.1`), **not**
this checkout at `cb9d51963`. That distinction is load-bearing and is
re-confirmed here.

## 4. What works today

- Per-agent concurrency cap and queued-run promotion: functioning.
- Atomic run claim: correct transactional primitive.
- Issue lifecycle, assignment, checkout, execution lock: functioning.
- Run logging, cost ledger, liveness, activity: functioning.
- 80 successful runs recorded — the loop does execute work.

## 5. What the plan assumed vs. reality

| Plan assumption | Reality |
|---|---|
| Concurrency cap partially exists | Only per-agent; **no global gate at all** |
| Start lock is a safety mechanism | Process-local, **self-bypasses after 30s** |
| Isolation machinery exists | Correct — but project policy **disables** it |
| Review can be made independent | Policy compares to requester, not implementers |
| Coders A/B exist on coding | Live coders are on **game** branch; naming/`Agent Coder` mismatch |
| Tasks can be run end-to-end | **No** — 83/200 failed, mostly adapter auth |

---

## 6. Live changes requiring owner approval (NOT made)

1. Switch project `optimizeo` `defaultMode` → `isolated_workspace`
   (`git_worktree`). **This is Deviation 7 and changes where agents write.**
2. Any change to agent `maxConcurrentRuns` values.
3. Setting a company-wide cap of 4 (blocked on §1 anyway).
4. Re-pointing `Coder 1` / `Coder 2` / `Reviewer` / `Tester` from `game` to
   `coding` branch, or renaming to Coder A / Coder B.
5. Fixing adapter credentials / model IDs.
6. Any change to `Memory *`, `Learning Agent`, `Reflection Coach` (Agent 2).

---

## 7. Decision needed from owner (blocks Phase 2)

**Which runs count toward the cap of 4?** Options:

- **A.** All agent runs company-wide (CEO, leads, coders, Reviewer, Tester, Brain).
- **B.** Worker runs only (coders, Reviewer, Tester) — leads and Brain excluded.
- **C.** Coding Division only.
- **D.** Other / specify.

Also needed: **is the cap global across all companies, or per company?** (Only
one company exists today: `MYMA` / `optimizeo`.)

Secondary, non-blocking: should a run **waiting on user/approval/external
state** release its slot? (Phase 2 requires this; current `approved-execution-wait`
machinery suggests yes, but the rule is the owner's.)

---

## 8. Dependencies on Agent 2

None required for Phases 2–4. Phase 5 UI must display status without
reimplementing Brain fields. If Brain-supplied fields (Study evidence,
Memory provenance, Reflection proposals) are wanted on task rows, Agent 1
needs the **read-only shape** of those records; Agent 1 will not write them.

**No shared file is claimed by Agent 1 that Agent 2 is likely to edit.**
Files Agent 1 will touch are runtime-only:
`server/src/services/heartbeat.ts`,
`server/src/services/agent-start-lock.ts`,
`server/src/services/execution-workspace-policy.ts` (config only),
`server/src/services/issue-review-policy.ts`, plus new test files.
If Agent 2 needs changes to any of these, that must be routed, not
co-edited.

---

## 9. Phase 6 candidate tasks (identified, NOT executed — need owner approval)

Two small, real, low-risk coding tasks that would genuinely exercise the loop:

1. **Reconcile coder identity + branch mapping** — the live coding branch has
   `Agent Coder` while `Coder 1`/`Coder 2` sit on `game`. A small config/instruction
   fix makes the Coding Division match the target and is trivially reviewable.
   *Useful because:* it is the exact Deviation-10/11 class of defect, is
   low-risk, and produces immediate visible correctness.

2. **Add a bounded-retry guard test + field** — enforces "one genuine retry after
   rejection, then escalate" (G6). *Useful because:* it is the smallest unit that
   proves the immune-system requirement and yields revision evidence
   (a commit + a passing test) end-to-end.

Neither touches Study/Learning/Memory/Reflection/Content/Game/Business systems.
Neither changes core scheduling or auth. Neither requires a migration.

---

## 10. Verification performed

- `git rev-parse HEAD`, `git branch --show-current`, `git status --porcelain`,
  `git worktree list` — baseline recorded, re-verified unchanged.
- `git worktree list` — 5 worktrees, none modified.
- Read `AI_COMPANY_PROJECT_MEMORY.md`, `AI_COMPANY_DECISION_LOG.md`,
  `AI_COMPANY_ARCHITECTURE.md`, `AI_COMPANY_IMPLEMENTATION_PLAN.md`.
- Static read of `heartbeat.ts` (admission, claim, cap),
  `agent-start-lock.ts`, `execution-workspace-policy.ts`,
  `run-dispatch/domain/policy.ts`.
- `grep` for company-scoped concurrency: **none found** (G1 proven).
- `grep` for `status: "running"` transitions: atomic conditional update confirmed.
- Live API (read-only, GET) on `127.0.0.1:3100`: 26 agents, 300 runs,
  82 issues, 1 project — all data in this document came from the live instance.
- No POST/PUT/PATCH/DELETE. No DB writes. No process restarts.

## 11. Assumptions

- The installed CLI instance and this source tree are treated as **different
  artifacts** until proven otherwise (Deviation: "source-versus-runtime
  identity unclear"). Code changes here are **not** live.
- 68 dirty entries represent intentional in-progress work by the owner/another
  agent and are preserved untouched.
- `heartbeat-runs` statuses `running`/`queued` are the correct capacity
  currency; not yet proven against `native` runtime mode.

## 12A. Reconciliation with the 2026-09-28 agreed plan

| Agreed-plan target | This recon | Status |
|---|---|---|
| 4-run global queue | G1 (no global cap; spec has no such concept) | **BLOCKED** — owner scope + build-vs-enforce-outside decision |
| Main Technical (Coding) workflow complete | G8 (Coding Lead + Agent Coder only; coders/Reviewer/Tester on Game) | Gap confirmed |
| Study per division | N4 (decision not in decision log; no Study agents exist) | Owner decision, needs recording |
| Shared Learning agent | N1 + N2 (root orphan, no heartbeat block) | Gap, **new** |
| Manual Research initially | Content Researcher missing (confirmed) | Gap confirmed |
| Owner approval for experiments | Consistent with decision log | Aligned |
| Flexible delegation (not always separate) | No enforcement exists; G5 | Gap |
| Live instructions outdated | G7 (effective delivery unverified) | Gap |

**Net:** the other session's comparison is **accurate and conservative**. I
found no claim it overstated. My recon adds N1–N3 (org-root Learning agent,
missing heartbeat config, 17/26 agents timer-disabled) which are more severe
than anything in its list, and a spec-level finding that the 4-run cap is an
overlay rather than a missing feature.

## 12. Unresolved

- Cap scope (§7) — blocks Phase 2.
- Whether capacity is released while genuinely waiting (Phase 2 requirement).
- Whether `process_lost` runs reliably release their slot (G3).
- Effective instruction delivery on real runs (G7).
- Which installed runtime actually serves the live company.
