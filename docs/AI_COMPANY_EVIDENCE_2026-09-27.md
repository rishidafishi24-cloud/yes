# Evidence — Low-Risk Coding Pass, 2026-09-27

Session scope: the five low-risk items agreed for unattended work. Everything here is
source-only. **No live system was touched, no instructions were activated, nothing was
staged or deployed.** The running Paperclip service is unchanged (`active`, pid 318) and
still serves the prebuilt npm bundle, so none of the below affects it.

## Baseline

- Branch `my-paperclip-custom`, HEAD `0a3aae5bf`.
- Working tree carried 62 dirty entries at session start; 66 at end (4 new files).
- No commit was made this session. The 62 pre-existing entries are untouched.

## 1. Reporting-title constants moved to a single definition

`INTERACTION_SUMMARY_PREFIX` / `BRANCH_BRIEFING_PREFIX` were hardcoded in three
places. The server checked the literals inline; the UI had its own copy plus a
hand-rolled predicate. Any change to either string had to be made in lockstep or
internal bookkeeping tasks would start appearing as operator work.

- Added the constants and predicates to `packages/shared/src/workflow-reporting.ts`,
  which both `server` and `ui` already import via the `@paperclipai/shared/workflow-reporting`
  subpath (7 pre-existing imports, so the export surface was already proven).
- `ui/src/lib/agent-workflow.ts` now re-exports them, keeping its public API unchanged,
  so `command-center.ts` and `AgentWorkspace.tsx` needed no edits.
- `server/src/services/interaction-summaries.ts:49` now calls `isInternalReportingTitle`.
  No `startsWith("[Interaction summary]` literals remain anywhere in `server/src`.

## 2. Activation fixtures recovered and made versioned

The fixture harness built earlier lived only in `/tmp/pc-fixt`, which is not backed up.
It has been rebuilt inside the repository so it survives:

- `scripts/instruction-activation/` — the activation and rollback scripts plus the
  four candidate bundles and the original live bundles.
- `scripts/__tests__/instruction-activation.test.mjs` — 8 tests. It mocks the
  `Paperclip` API on a loopback port, so no live instance is contacted and no real
  write occurs.

Coverage: byte-exact apply of all four bundles with the policy block preserved;
refusal to reuse an existing state directory; reconcile-and-stop on HTTP 500 without
touching later agents; an applied-but-unacknowledged write recorded as `unknown`;
refusal of a candidate with a tampered policy block; rollback blocked while an agent's
latest state is unresolved; a successful rollback restoring original bundles; and
refusal when no ledger exists.

## 3. Real bug: dead error guards in both scripts

Found while writing the tests, not by reading the code. Both scripts ran under
`set -euo pipefail` and guarded a verification step like this:

```bash
python3 - … <<'PY'   # sys.exit("POLICY BLOCK ALTERED")
PY
[ $? -eq 0 ] || fail "policy verification failed"
```

The `python3` is a simple command, so a non-zero exit aborts the whole script at that
line. The `[ $? -eq 0 ]` line is never reached, and `$?` could never be non-zero there.
The guard was unreachable, and the intended outcome — record the agent as `unknown` and
write reconciliation evidence — never happened. Instead the script died silently with
only the child's stderr, leaving the ledger saying `attempted` when the real state was
ambiguous. That is precisely the case the recovery model exists to handle.

Four sites were affected: two in `activate-instructions.sh` (content check, policy
check) and two in `rollback-instructions.sh` (adapterConfig drift, bundle content
drift). All four now use `if ! python3 …; then <intended handling>; fi`, which is
immune to `set -e`.

This was confirmed by mutation testing rather than inspection. Four mutants were
injected, each removing one guard: one initially survived, exposing that the original
policy test was vacuous, because it asserted against an unmodified fixture. A
tampered-policy test was added, and all four mutants are now killed while the baseline
stays green.

## Test results

All independently re-run in this session:

| Suite | Result |
| --- | --- |
| `scripts/__tests__/instruction-activation.test.mjs` | 8 passed |
| `packages/shared/src/workflow-reporting.test.ts` | 13 passed |
| `ui/src/lib/command-center.test.ts` | 8 passed |
| `ui/src/lib/agent-workflow.test.ts` | 8 passed |
| `server/src/__tests__/interaction-summaries.test.ts` | 5 passed |
| **Total** | **42 passed, 0 failed** |

Typecheck clean for `packages/shared` and `ui` for the touched files.

## Deliberately not done

**TASK 10 (frontend usability).** Not low-risk, and out of scope as written. The
implementation plan makes it depend on unfinished T05 and T09, assigns `AgentWorkspace.tsx`
to a single owning agent to avoid merge churn, and requires browser verification of the
result. It also straddles the architecture line. Starting it unattended would have
produced work that has to be redone. Recommend leaving it until T05 and T09 land.

**TASK 02 source-only reference fixes.** Deferred rather than skipped: it needs a
per-file pass over the 62 dirty entries to identify which reference breaks are real
versus artifacts of the uncommitted state. Worth doing deliberately, not opportunistically.

## Still open for the owner

1. **Which roles count toward the four-agent cap.** Unresolved, and it blocks plan
   packet T03. No answer was invented.
2. **Approval to run the T02 activation.** The scripts are now tested but remain
   unexecuted by design. `activation-state/` does not exist.
3. **Approval for a single delivery-verification run** against the live board.
