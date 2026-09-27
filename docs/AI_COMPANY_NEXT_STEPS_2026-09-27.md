# AI Company — Next-Step Plan

**Date:** 2026-09-27 · **Branch:** `my-paperclip-custom` · **HEAD:** `0a3aae5bf`
**Companion to:** `AI_COMPANY_PROJECT_MEMORY.md` (North Star), `AI_COMPANY_ARCHITECTURE.md`,
`AI_COMPANY_DECISION_LOG.md`, `AI_COMPANY_IMPLEMENTATION_PLAN.md`, `AI_COMPANY_EVIDENCE_2026-09-27.md`.

This document answers three questions: **what is actually done**, **what is next**, and
**what "done" must look like for each item** — with concrete code examples a weaker
coding model can follow.

---

## Part 1 — Status breakdown

### Verified done

| Item | Evidence | State |
| --- | --- | --- |
| Architecture document | `AI_COMPANY_ARCHITECTURE.md`, 305 lines | **committed** `0a3aae5bf` |
| Owner decision record | `AI_COMPANY_DECISION_LOG.md`, 307 lines | **committed** `0a3aae5bf` |
| North Star memory | `AI_COMPANY_PROJECT_MEMORY.md` (new) | untracked, this session |
| Implementation roadmap | `AI_COMPANY_IMPLEMENTATION_PLAN.md`, 205 lines, T01–T10 | untracked |
| Evidence record | `AI_COMPANY_EVIDENCE_2026-09-27.md`, 109 lines | untracked |
| External backup | `/home/god/pc-backup-2026-09-27/` — 48/48 files, restore-tested | on disk |
| T01 baseline audit | triage of 62 dirty entries into groups A–F | done |
| T02 instruction sources | 4 candidate bundles + 2 scripts, 8 tests | done, **not activated** |
| Reporting title de-duplication | one shared definition, server + UI | done, 42/42 tests |

**Tests: 42 passed, 0 failed** across `instruction-activation` (8),
`workflow-reporting` (13), `command-center` (8), `agent-workflow` (8),
`interaction-summaries` (5). Independently re-run.

### Real bug found and fixed

The two activation scripts guarded verification steps with a pattern that could never
fire:

```bash
python3 - … <<'PY'   # sys.exit("POLICY BLOCK ALTERED")
PY
[ $? -eq 0 ] || fail "policy verification failed"   # ← unreachable
```

Under `set -euo pipefail` a failing simple command aborts the script on that line, so
`$?` was never non-zero. The intended outcome — record the agent as `unknown` and write
reconciliation evidence — never ran. The ledger said `attempted` when the real state was
ambiguous, which is exactly the case the recovery model exists to handle.

**4 sites** (2 in activate, 2 in rollback) now use `if ! python3 …; then …; fi`, which
`set -e` cannot short-circuit. Found by mutation testing, not inspection.

### Not done, and why

- **Nothing committed this session.** Dirty count went 62 → 67 (5 new files). The 62
  pre-existing entries are untouched.
- **No live contact.** Service `active` pid 318, still serving the prebuilt npm bundle.
  No instructions activated, no staging, no deploy. `activation-state/` does not exist.
- **TASK 10 (UI)** — not low-risk. Depends on unfinished T05/T09, assigns
  `AgentWorkspace.tsx` to a single owner to avoid merge churn, requires browser
  verification, and straddles the architecture line.
- **TASK 02 reference fixes** — needs a per-file pass over 62 dirty entries to separate
  real breaks from artifacts of the uncommitted state.

### Known small issues, unfixed

1. `workflow-reporting` is not re-exported from `packages/shared/src/index.ts`; only the
   `./*` subpath resolves. All 7 imports use the subpath so nothing is broken, but the
   module is private by accident.
2. `isInternalReportingTitle` requires a trailing space. Every real creation site
   appends a branch so it matches, but a bare prefix-only title returns false. Covered
   deliberately by a test, so intentional — just easy to misread.

---

## Part 2 — Ordered next actions

Ordering rule: **unblock the owner first, then the pipeline, then the loop.** Nothing
here requires the unresolved 4-agent decision except where marked.

### Step 1 — Commit the source of truth *(do now, no approval needed)*

Five documents are untracked. Every future agent starts blind until these are in Git.
This is the highest value-per-risk action available.

```bash
cd /home/god/paperclip-source
git add docs/AI_COMPANY_PROJECT_MEMORY.md \
        docs/AI_COMPANY_IMPLEMENTATION_PLAN.md \
        docs/AI_COMPANY_EVIDENCE_2026-09-27.md
git commit -m "docs: add North Star memory, implementation plan, and session evidence"
```

Also fold in the already-verified code work, which is untracked and tested:

```bash
git add scripts/instruction-activation scripts/__tests__/instruction-activation.test.mjs \
        packages/shared/src/workflow-reporting.ts packages/shared/src/workflow-reporting.test.ts \
        ui/src/lib/agent-workflow.ts ui/src/lib/command-center.ts
git commit -m "fix: single reporting-title definition; make verification guards reachable"
```

> **Guard:** the index already held 25 staged files earlier in this project. Always pass
> explicit paths to `git commit -- <paths>` so unrelated staged work is never swept in.

**Done when:** `git log --oneline` shows both commits and `git status --porcelain`
drops to the 62 known-dirty entries.

### Step 2 — Get the 4-agent counting decision *(needs you, one sentence)*

This is the single hardest blocker in the plan. Packet T03 cannot start without it.

> Does the max-4-active-agents limit include CEO / Brain / Reviewer, or only active
> workers?

Record the answer in `AI_COMPANY_DECISION_LOG.md`, then T03 unblocks. **I will not
invent this answer.**

### Step 3 — Activate the instruction bundles *(needs your approval, tested)*

The scripts are tested and unexecuted by design.

```
Review the diff:  docs…/original-live-bundles/  vs  scripts/instruction-activation/candidates/
```

- 4 bundles, each verified byte-exact on apply
- `MYMA_NETWORK_POLICY` preserved byte-for-byte — a tampered candidate is refused
- Ledger records `attempted` → `updated` / `unknown`
- Rollback restores originals and **refuses on drift**

```bash
# backup first — always
cp -r ~/.paperclip/instances/default/companies \
      ~/.paperclip/instances/default/companies.bak-$(date +%F-%H%M)

bash /home/god/pc-instruction-candidates-2026-09-27/activate-instructions.sh
```

**Done when:** `activation-state/attempts.txt` shows 4 × `updated`, each live bundle
matches its candidate, and the 4 Coding Division agents pick up the new instructions on
their next wake.

**Rollback:** `bash …/rollback-instructions.sh` — safe, and it refuses if anything
drifted rather than guessing.

### Step 4 — T05, delivery evidence contract *(first real engineering packet)*

T03, T04, T06, T07 all consume it, so it is the best parallel start. Establishes what
"verified" means so staging and approval mean something.

**What good looks like** — a status that is only LIVE when verified on the running
instance:

```ts
// Desired shape. Illustrative — match existing status conventions in the repo.
type DeliveryStage =
  | "designed" | "coded" | "tested" | "built" | "staged" | "live";

// A task may only claim `live` with evidence attached.
interface DeliveryEvidence {
  stage: DeliveryStage;
  commitSha: string;          // exact commit, never a branch name
  worktreePath: string;       // isolated worktree it was built in
  reviewTaskId?: string;      // independent Reviewer verdict
  testSummary?: string;       // command + result
  verifiedOnInstance?: string; // instance id — required for `live`
}

// Rule: `live` without `verifiedOnInstance` is a contract violation, not a warning.
function canAdvance(from: DeliveryStage, to: DeliveryStage, e: DeliveryEvidence): boolean {
  if (to === "live" && !e.verifiedOnInstance) return false;
  return ORDER.indexOf(to) === ORDER.indexOf(from) + 1; // no skipping stages
}
```

**Done when:** the stage ladder is enforced in one place, tested, and `AgentWorkspace`
can render it. Then T10 becomes safe.

### Step 5 — T04, workspace isolation *(the real architectural conflict)*

This is the one true deviation between target and implementation (deviation 7 in the
decision log: shared coder workspace vs isolated worktrees).

**What good looks like** — a coder that verifies it was actually given an isolated
workspace and **stops rather than falling back**:

```bash
# Desired shape. The stop is the point — never silently share a checkout.
: "${CODER_WORKTREE:?CODER_WORKTREE is not set — refusing to build in a shared checkout}"
case "$CODER_WORKTREE" in
  "$REPO_ROOT") echo "refusing: shared checkout"; exit 1 ;;
esac
git -C "$CODER_WORKTREE" rev-parse --show-toplevel >/dev/null \
  || { echo "worktree unreachable"; exit 1; }

# Submit an exact commit, never a branch name.
git -C "$CODER_WORKTREE" rev-parse HEAD   # this exact sha is what gets reviewed
```

**Done when:** two coders can work simultaneously with zero interference, and a missing
worktree produces a clear stop rather than a shared-checkout build.

### Step 6 — T07, staging and release boundary

**What good looks like** — publishing is gated on owner approval, and rollback is a
first-class path rather than an afterthought:

```bash
# Desired shape.
publish_to_stable() {
  local sha="$1"
  git -C "$REPO" fetch origin
  # Refuse to publish anything not already reviewed, tested, and approved.
  require_recorded_approval "$sha" || { echo "owner approval missing for $sha"; return 1; }
  git -C "$REPO" push origin "$sha":refs/heads/stable
}

rollback_stable() {
  local known_good="$1"
  # Verify the target is an ancestor we actually shipped, not an arbitrary sha.
  git -C "$REPO" merge-base --is-ancestor "$known_good" refs/heads/stable || {
    echo "refusing: $known_good was never on stable"; return 1; }
  git -C "$REPO" push --force-with-lease origin "$known_good":refs/heads/stable
}
```

**Done when:** a publish without recorded approval is impossible, and rollback refuses a
sha that was never live.

### Step 7 — Close one Brain learning loop *(the deepest part)*

Waves 0–3 make the pipeline trustworthy; this is where the company starts getting better.

Pick **one** completed, reviewed Coding Division task. Run Study on it: what happened,
how, why. Learning extracts the general lesson. Reflection proposes an instruction
change — **and does not apply it.** Memory stores it durably.

**Done when:** one task has a preserved Study record, one extracted lesson, one
Reflection *proposal* awaiting owner approval, and one durable memory that a later agent
actually receives. Then measure whether the next comparable task is better.

---

## Part 3 — What a coding model should do with this

The plan's own instruction to agents, restated so it survives context loss:

1. **Read `AI_COMPANY_PROJECT_MEMORY.md` first.** It is the North Star.
2. **KEEP → FIX → EXTEND.** Inspect before creating. Most infrastructure exists.
3. **Never invent an owner decision.** The 4-agent cap, division internals, and Memory
   tech are open. Stop and ask.
4. **Designed ≠ Live.** Record the deviation; never reinterpret the vision to match the
   repo.
5. **Submit an exact commit sha.** Not a branch name.
6. **One genuine retry, then escalate.** Never loop.
7. **Verify with tests, and mutation-test any safety guard you add.** A guard that cannot
   fail is not a guard — that is exactly how the `set -e` bug survived.
8. **Quality order:** correctness → quality → vision match → instruction following →
   consistency → cost → speed.

---

## Part 4 — Risks

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Uncommitted source of truth | A session crash or bad `git reset` loses the North Star | Step 1, first |
| T03 blocked | Whole execution-capacity packet stalls | Step 2, needs one sentence |
| Shared coder workspace | Two coders collide; violates deviation 7 | Step 5 |
| Source ≠ running system | Repo edits have **zero** effect on live; no build→deploy step exists | Never claim a change is Live without verifying on the instance |
| Instruction drift | Agents rediscover or silently change decisions | Step 3, then keep the decision log current |
| Unreachable guards | Safety logic that looks present but never runs | Mutation-test every guard (the 2026-09-27 bug) |

---

## Appendix — Code examples, before/after

### A. Reporting titles — one definition

**Before** — literals repeated in three places; changing a string required lockstep edits:

```ts
// server/src/services/interaction-summaries.ts
if (row.task.conversationAgentId
    || row.task.title.startsWith("[Interaction summary]")
    || row.task.title.startsWith("[Branch briefing]")) continue;

// ui/src/lib/agent-workflow.ts
export const INTERACTION_SUMMARY_PREFIX = "[Interaction summary]";
export function isInteractionSummaryTitle(t: string) {
  return t.startsWith(`${INTERACTION_SUMMARY_PREFIX} `);
}
```

**After** — one definition in `packages/shared/src/workflow-reporting.ts`, re-exported
by the UI so its public API is unchanged:

```ts
// packages/shared/src/workflow-reporting.ts
export const INTERACTION_SUMMARY_PREFIX = "[Interaction summary]";
export const BRANCH_BRIEFING_PREFIX = "[Branch briefing]";

export function isInternalReportingTitle(title: string): boolean {
  return isInteractionSummaryTitle(title) || isBranchBriefingTitle(title);
}

// server/src/services/interaction-summaries.ts — now one call
if (row.task.conversationAgentId || isInternalReportingTitle(row.task.title)) continue;
```

### B. Verification guard — unreachable → load-bearing

**Before** — dead code. `set -e` aborts first, so `$?` is never inspected:

```bash
python3 - "$CAND/$label.md" <<'PY'
…
if a != b: sys.exit("POLICY BLOCK ALTERED")
PY
[ $? -eq 0 ] || reconcile_and_stop "$label" "$id" "$slug" "policy_altered"
```

**After** — the guard is the condition, so `set -e` cannot bypass it:

```bash
if ! python3 - "$CAND/$label.md" <<'PY'
…
if a != b: sys.exit("POLICY BLOCK ALTERED")
PY
then
  reconcile_and_stop "$label" "$id" "$slug" "policy_altered"
fi
```

**How to prove it works** — mutation testing. Remove the guard; the test must fail.
During this work one mutant initially *survived*, which exposed that the original
policy test was vacuous because it asserted against an unmodified fixture. A
tampered-policy test was added; all four mutants now die.

### C. Workspace isolation — refuse rather than degrade

**Before** — a missing worktree silently falls back to the shared checkout:

```bash
cd "$REPO_ROOT"        # two coders, one directory, merge conflicts
```

**After** — missing environment is a hard stop with a clear reason:

```bash
: "${CODER_WORKTREE:?CODER_WORKTREE unset — refusing to build in a shared checkout}"
[ "$CODER_WORKTREE" != "$REPO_ROOT" ] || { echo "refusing: shared checkout"; exit 1; }
```

### D. Evidence-driven approval — "Needs You" is the scarce resource

The UI must make owner attention the bottleneck it is. Approval is a first-class queue,
not a log line:

```ts
// Desired shape.
interface NeedsYouItem {
  taskId: string;
  reason: "approval" | "architecture" | "study_experiment"
        | "reflection_proposal" | "blocker" | "direction_uncertain";
  summary: string;        // CEO-level, not raw implementation detail
  waitingSince: string;   // so staleness is visible
}
```

Surfaced at the top of the chat-first UI, never buried. Reviewer verdicts, Reflection
proposals, and architecture questions all land here — which is also what keeps autonomy
**earned** rather than assumed.
