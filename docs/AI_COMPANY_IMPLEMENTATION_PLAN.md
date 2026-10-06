The first milestone should be one complete, controlled development cycle through the existing Paperclip: CEO → Coding Lead → isolated coder work → independent review → bounded retry → staging → your approval → verified release.
That establishes the foundation for Paperclip to help build the rest of the company. Brain automation, additional tools, and division expansion should follow that foundation.
This is the initial implementation breakdown, grounded in your documents and the source paths inspected. It is not a claim that I have audited every subsystem or verified the current running instance. No project files, agents, or settings were changed.
1. Governing vision
These are settled constraints that every implementation handoff must preserve:
- You own vision and final authority.
- CEO represents your intent and normally delegates through persistent leads.
- Coding Lead, two generalist coders, and Reviewer own technical implementation across the company. There is no separate Tool Lab.
- Study, Learning, Reflection, and Memory have distinct responsibilities.
- Agents may request relevant help across branches; reporting hierarchy must not become a mandatory route for every interaction.
- New capabilities usually belong to existing agents.
- Coders work in isolated environments; stable/live systems are protected.
- Early deployment, significant experiments, and behavior changes require human approval.
- Reliability must survive changes of model.
- Quality priorities remain: correctness → code quality → owner vision → workflow compliance → consistency → cost → speed.
- Inspect and reuse existing infrastructure before creating another system.
The target maximum is four active agents. Which roles count remains unresolved; no implementation task may silently decide that.
2. Current state: what the evidence establishes
Organization instructions conflict with the current target.
companies/networked-ai-company/COMPANY.md prioritizes Content and Business, includes Trading as an operating branch, and places Game within Coding. The Coding Lead instructions describe two coders, an extra PStack coder, a Reviewer, and a Tester. Reviewer instructions explicitly favor selective peer review rather than a mandatory release gate.
These are verified source-document deviations. Whether the running agents currently load those exact instructions still needs verification.
Assignment and review infrastructure already exist.
- server/src/services/issue-assignment-wakeup.ts routes assigned work into the existing heartbeat wake mechanism.
- server/src/routes/issues.ts contains checkout, assignment, and review integration.
- server/src/services/issue-review-policy.ts supports anyone, human_only, and not_creator policies.
The not_creator policy compares against the review requester. That alone does not prove the reviewer is independent of everyone who implemented the change.
Workspace isolation already has substantial implementation.
server/src/services/execution-workspace-policy.ts resolves project/task workspace policies and strategies, including Git worktrees. It handles feature gates, project prerequisites, inherited settings, and explicit overrides.
An “isolated” mode label alone is not sufficient evidence: the effective strategy and actual working directory must be verified.
Reflection is not wholly missing.
The built-in Reflection Coach has evidence requirements, proposal limits, explicit confirmation requirements, and separate proposal/application runs. Associated routine and skill provisioning exist in built-in-agents.ts.
Its present activation and end-to-end enforcement are unverified.
Learning-related data infrastructure exists.
The schema includes work_assessments, completion contracts, native run results, and decision_training_examples. These are candidates for reuse, not proof that the intended Learning or Study systems are complete.
Memory has defined responsibilities.
The Memory Lead instructions require project/company separation, provenance, confidence, supersession, and small relevant retrieval results. A complete retrieval/adoption loop has not been established by this inspection.
Custom reporting and UI work exist but are unfinished.
Earlier work added server summary scheduling, source checkpoints, an activity-based collaboration view, and the new Home workspace. Those changes include uncommitted files. The UI inspection exposed significant usability problems.
At the last verified runtime check, port 3100 ran an installed package while port 3101 served the edited source UI. Current runtime identity is unverified.
3. KEEP → FIX → EXTEND map
KEEP
Existing task ownership and checkout semantics; assignment/wakeup machinery; heartbeat/recovery infrastructure; routines; workspace realization; permission and tool governance; skills; documents/artifacts; review policies; run/activity records; built-in Summarizer and Reflection Coach foundations.
FIX
Conflicting company instructions; unclear source-versus-runtime identity; any verified isolation/configuration failures; misleading UI states; unusable narrow-screen layouts; incomplete summary-scheduling validation.
EXTEND
Existing review flow to enforce the approved bounded retry policy; evidence links across implementation/review/release; scoped Memory retrieval; Study and Learning workflows using existing storage and orchestration where suitable.
BUILD only after proving a gap
Small missing contracts or adapters that the existing services cannot provide. A new scheduler, agent framework, memory platform, or tool framework is not an approved starting point.
DEFER
Large autonomous experiments, automatic instruction changes, additional specialist agents, tool shopping, elaborate division hierarchies, and broad UI expansion.
4. Dependency order and implementation waves
Verified source/runtime baseline
              ↓
Aligned company instructions + controlled execution
              ↓
Actual coder isolation + review/evidence contract
              ↓
One staged and approved development cycle
              ↓
Trusted owner UI + useful tool integrations
              ↓
Scoped Memory → Study → Learning → approved Reflection
              ↓
Division expansion and measured autonomy
Basic evidence capture begins before Brain implementation. Basic Memory retrieval can support Study; a sophisticated memory platform is not a prerequisite.
Wave 0 — Establish a trustworthy baseline
Goal: identify exactly what code, configuration, data, and instructions are in use.
Keep: all valuable custom work and existing environments.
Fix: uncertainty about running versions and conflicting source instructions.
Exit: an evidence-backed inventory identifies authoritative source, runtime entrypoint, database identity without exposing credentials, active schedules, agent configuration sources, and the disposition of dirty work.
Do not: deploy, retire agents, restore backups, or run another scheduler during inventory.
Wave 1 — Make controlled coding possible
Goal: align the company shell, establish the capacity policy, prove isolation, and define independent review with bounded retries.
Reuse: agent instructions/configuration, heartbeat admission, execution workspaces, task interactions, review policies, and artifacts.
Exit: a coding task runs in its intended isolated checkout; a reviewer evaluates its exact revision; rejection allows one meaningful retry; repeated failure escalates.
Do not: build Brain automation or enable unrestricted agent work.
Wave 2 — Prove the self-upgrade path
Goal: deliver one small real change through review, integration, staging, owner approval, release, and verification.
Reuse: existing Git/workspace operations and deployment tooling after inspection.
Exit: evidence binds the task, implementation revision, tests, review, staged revision, approval, and deployed revision. Rollback is documented and rehearsed in staging.
Do not: use the first exercise to change core scheduling, authentication, or migrations.
Wave 3 — Make operation understandable and economical
Goal: trustworthy owner-facing status and a small number of useful capabilities.
Fix: graph readability, shared navigation, mobile content overlap, confusing internal reporting tasks, and vague activity descriptions.
Validate: the existing custom summary scheduler before activation, including duplicate delivery, failures, checkpoint coverage, restart behavior, and cost controls.
Exit: you can identify who is working, on what, why it is blocked, and what needs your decision without reading raw logs.
Wave 4 — Close one evidence-based learning loop
Goal: one validated outcome produces useful retrieved knowledge and, where justified, an approved behavior improvement.
Order: minimum Memory retrieval → Study evidence package → qualified Learning proposal → Reflection proposal → approved application → outcome comparison.
Exit: a later task retrieves the relevant lesson with its source and limitations; an unapproved proposal cannot change agent behavior.
Do not: assume every completed task deserves a model run or durable memory.
Wave 5 — Expand from demonstrated needs
Goal: add Game, Content, Business, and Research capabilities through bounded real projects.
Exit: each addition has an owner, demonstrated demand, scoped tools, a skill, measurable usefulness, and operating costs.
Internal division structures remain open until actual workload justifies them.
5. First ten execution packets
All packets inherit the governing constraints above. Each worker returns changed paths, exact evidence, failures, remaining unknowns, and honest status labels. Discovery packets may legitimately produce no code.
T01 — Source/runtime and preservation inventory
- Owner: coding agent performing read-only inspection.
- Objective: establish source checkout, dirty/staged changes, worktrees, process entrypoints, schedules, and available backup evidence.
- Area: Git, package/start configuration, company configuration, runtime metadata.
- Constraints: no startup, shutdown, database writes, cleanup, commits, or bulk configuration dumps.
- Output: discrepancy register and safe development baseline.
- Verification: every claimed runtime fact has an observation and timestamp; unavailable runtime facts stay unknown.
- Dependencies: none. Risk: low. Context: medium.
- Why first: every later task needs to know what it is changing.
T02 — Reconcile company instruction sources
- Owner: Coding Lead implementation agent; architect reviews intent.
- Objective: map current prompts/hierarchy against the approved target; prepare bounded corrections.
- Area: company definitions, agent instruction loading, managed profiles.
- Constraints: do not delete Trading, PStack, Tester, or other roles; do not silently apply source changes to live agents.
- Output: proposed target mapping, corrected instruction bundle, migration notes.
- Verification: references resolve; no contradictory coder/reviewer policies; effective instructions can be identified.
- Dependency: T01. Risk: medium. Context: medium.
T03 — Execution capacity and stop semantics
- Owner: stronger debugging agent; architect reviews.
- Objective: trace all relevant admission paths, queue behavior, cancellation, and restart recovery.
- Area: heartbeat, run dispatch, wake queue, start lock, execution controls.
- Constraints: reuse existing admission; the owner must settle which roles count before enforcing the company-wide four-agent rule.
- Output: tested admission policy or a narrowly scoped gap report.
- Verification: simultaneous requests, queued work, cancellation, restart, and expired ownership cannot bypass the chosen limit.
- Dependency: T01 and counting decision. Risk: high. Context: large.
- Important: the inspected start lock is process-local and has a timeout; it is not itself proof of a global capacity guarantee.
T04 — Prove coder workspace isolation
- Owner: either coder.
- Objective: validate effective project/task policy and actual Git worktree behavior.
- Area: workspace policy, realization, branch ownership, project repositories.
- Constraints: no replacement worktree manager; no live/stable edits.
- Output: bounded fixes/configuration plus an isolated-workspace reference.
- Verification: two tasks have separate working directories/branches; retry reuses intended state; missing project prerequisites fail clearly; cleanup preserves unfinished work.
- Dependencies: T01; controlled execution from T03 before agent trials. Risk: high. Context: medium.
T05 — Define the delivery evidence contract
- Owner: either coder; Reviewer validates.
- Objective: connect task, run, source revision, outputs, checks, review, and release evidence.
- Area: work products, documents, run results, completion contracts, assessments.
- Constraints: first prove which existing fields suffice; no parallel evidence database by default.
- Output: one canonical evidence format and real reference example.
- Verification: missing, mismatched, or superseded revisions cannot masquerade as current evidence.
- Dependency: T01. Risk: medium. Context: medium.
T06 — Independent review and bounded retry
- Owner: coder implements; independent Reviewer verifies.
- Objective: enforce review of the delivered revision, one retry after rejection, then escalation.
- Area: existing review policies, task interactions, execution policy, evidence from T05.
- Constraints: retry history must survive reassignment and restart; no self-approval.
- Output: protected review transitions and focused tests.
- Verification: accept, reject/retry, second rejection, missing reviewer, stale verdict, duplicate response, restart.
- Dependencies: T02, T05. Risk: high. Context: medium.
T07 — Staging and release boundary
- Owner: coding agent; owner approves deployment.
- Objective: establish the actual integration/staging/release route.
- Area: existing scripts, deployment configuration, Git operations, backup/restore tooling.
- Constraints: do not invent a second release framework; isolate staging data and agent execution.
- Output: reproducible staging procedure, revision-bound approval, rollback procedure.
- Verification: staging cannot wake production agents; deployed revision matches approval; rollback works in staging.
- Dependencies: T01, T04, T05. Risk: high. Context: medium.
T08 — Run one controlled company development task
- Owner: CEO → Coding Lead → one coder → Reviewer.
- Objective: exercise the complete workflow with a small useful change.
- Constraints: explicit budget; no broad refactor; failures remain evidence.
- Output: complete trace and corrected gaps within approved scope.
- Verification: assignment, wake, isolated edit, checks, review, staging, approval, release, and final observation.
- Dependencies: T02–T07. Risk: medium.
T09 — Validate reporting before activating it
- Owner: backend coding agent; Reviewer checks correctness and cost.
- Area: existing custom interaction-summary service, shared checkpoint helpers, activity route, collaboration UI.
- Constraints: no browser-triggered automatic scheduling; no second scheduler.
- Verification: duplicate events, multiple tabs, comments during a run, failed summaries, restart, unresolved tasks, deleted evidence, bounded history, and quiet operation without new evidence.
- Output: corrected implementation and staged evidence; activation separately approved.
- Dependencies: T03, T05, T07. Risk: high.
T10 — Repair the shared UI experience
- Owner: UI coding agent.
- Objective: consistent navigation and usable task/agent views at the owner’s actual panel width.
- Area: shared layout/navigation, Home, Agents, collaboration views.
- Constraints: use existing APIs and design tokens; preserve unknown/error states; no cosmetic mock data.
- Verification: real browser clicks, narrow/wide layouts, reachable composer, readable graph alternative, unobscured content, clear blockers and approvals.
- Dependencies: T05; reporting-specific acceptance follows T09. Risk: medium.
6. Parallel work and collision rules
The first safe parallel wave after T01 is:
- Coder A: T04, workspace isolation.
- Coder B: T05, delivery evidence.
Begin with inspection and fixtures. If either needs shared issue schemas, heartbeat internals, or the same execution contract, stop parallel edits and integrate the shared change first.
T03 and T06 should not casually run in parallel against heartbeat/issue transitions. T09 and T10 may proceed separately only after their shared status contract is agreed; one agent owns AgentWorkspace.tsx.
For deliberate A/B implementation comparisons, create separate task/workspace identities with the same approved brief. Preserve independent unfinished solutions. Compare only after both submissions are frozen.
7. Early contracts and reusable guidance
Establish only these cross-cutting contracts initially:
1. Assignment: accountable owner, objective, project, prerequisites, allowed scope, evidence, stop/escalation conditions.
2. Execution: effective model/configuration, workspace identity, admission, cancellation, retry ownership.
3. Evidence and review: exact revision, checks performed, results, reviewer, verdict, retry history.
4. Release: staged revision, approval binding, deployment identity, rollback evidence.
5. Knowledge: provenance, scope, confidence, applicability, supersession, permitted audience, retrieval budget.
Use existing types and services wherever possible. Capture each contract in one tested reference implementation and a short task template. Do not place the entire architecture in every prompt.
Later Study packets must preserve HOW, WHY, failed approaches, measurements, and owner judgment. Learning packets must distinguish an observation from a supported general lesson.
8. Do not build or retire yet
- No new scheduler, review platform, agent framework, or tool framework: existing implementations must be evaluated first.
- No automatic Reflection changes: retain explicit reviewed-diff approval.
- No broad nightly experimentation: first prove evidence capture, isolation, capacity limits, and bounded spending.
- No mandatory vector/graph memory: prove a retrieval need before selecting additional infrastructure.
- No detailed new division hierarchies: demand and ownership boundaries are not yet established.
- No deletion of Trading, PStack, Tester, or experimental UI work: inventory dependencies and present a retirement decision first.
- No blind commit of the dirty tree: separate valuable stable work from incomplete experiments without losing either.
9. Decisions, risks, and status
Owner decision required now: which roles count toward the four-active-agent limit. T01 and other read-only preparation can proceed without that answer.
Owner decision required before organizational removal: disposition of out-of-target agents. Their presence is not authorization to delete them.
Main risks: source/runtime mismatch; prompt-only rules mistaken for enforcement; shared workspaces disguised by isolation labels; review of stale revisions; retries that reset their own limit; summary checkpoints mistaken for proof that all evidence was read; staging connected to production execution.
Status of this deliverable: DESIGNED — initial architecture and task breakdown. Existing source components are present, but their TESTED/BUILT/STAGED/LIVE status must be established individually. Historical test results do not certify the current whole company.
The first major milestone is reached only when T08 produces a traceable, approved development cycle and the isolation, capacity, review, failure, and rollback checks have evidence. At that point we can truthfully say:

## 2026-09-28 reconciliation - next implementation batch

This addendum narrows the next coding milestone to the owner's clarified Coding + Verification priority. Preserve existing work and reuse Paperclip's assignment, workspace, review, artifact, run, and approval infrastructure. This is a plan, not evidence that these controls are already enforced.

Dependency order:

1. **Establish the execution baseline.** Identify the effective company instructions, active project/workspace policy, and runtime version. Preserve the current dirty tree. Do not import the candidate company package or activate instructions as part of baseline discovery.
2. **Prove task isolation and topology.** Exercise one coder in an actual isolated workspace; prove two separate workspaces for an explicitly assigned A/B comparison, with no access to the other's unfinished result. Fail closed when isolation prerequisites are missing.
3. **Bind verification evidence to the submission.** Define the smallest structured evidence contract that records task, exact revision, checks and outcomes, reviewer/tester identity, finding/severity, attempts, correction result, time, and measurable cost. Reuse existing work products/run records where possible; do not create another evidence database by default.
4. **Enforce independent review and bounded correction.** Make the Reviewer read-only and exact-revision; make reviewer dispatch event-driven. Record one genuine correction allowance durably across reassignment/restart, then stop and escalate. Apply configurable risk-based verification, including independent Tester evidence where appropriate.
5. **Complete one owner-approved release cycle.** Bind checks, review, staged revision, owner approval, deployment identity, and rollback evidence. Keep high-risk changes/releases owner-approved.

Only after this coding cycle has trustworthy evidence should the implementation start the coding knowledge loop: real-work evidence -> Coding Study -> validated Learning -> Reflection proposal -> owner-approved behavior change -> scoped Coding Memory retrieval. Do not create Study experiments while idle or expand Game, Content, Trading, Business, or other future divisions to match the diagram.

Owner decisions before enforcement: define the configurable verification tiers and approval thresholds; resolve the already-open four-active-agent counting rule before enforcing company-wide capacity. No decision is needed to continue read-only baseline work or implement an opt-in, configurable mechanism.

---

## 2026-09-28 reconciliation — verified gap list and next batch

This supersedes the speculative "next implementation batch" above with what source
inspection actually established. The ordering below is dependency-correct and each
step is sized to land on the coding+verification foundation only. Nothing here
expands Game, Content, Trading, Business, or the Brain.

### Gap list (dependency order)

| # | Gap | Status today | Depends on |
|---|---|---|---|
| G1 | Instance-wide capacity not in the working tree | `CODED` on `agent1/global-capacity`, unmerged | — |
| G2 | Queued-comment claim path bypasses the capacity gate | unaddressed even on that branch (`heartbeat.ts` sets `status: "running"` outside `withAdmissionLock`) | G1 |
| G3 | Strongest evidence contract exists only on `codex/delivery-evidence-proof`; local copy is weaker and untracked | recoverable via `git show 15bc8725b:…` | — |
| G4 | **Review verdict carries no revision identity** — the structural gap | `MISSING`; no producer for `revisionReviewed` | G3 |
| G5 | Evidence contract wired to nothing: not exported, no store, no producer | unwired | G4 |
| G6 | Reviewer is not capability-limited to read-only | `MISSING` | G4 |
| G7 | Existing bounded review rounds do not match the target's one correction attempt | `IMPLEMENTED` for configured execution review stages; default is 3 rejected rounds, while Coding must escalate after 2 | G4 |
| G8 | Risk-tiered verification | `MISSING`; mechanism must stay configurable | G7, **owner decision** |
| G9 | Company package inverts §16 priority; Reviewer gate stated two ways | source-only, unactivated | — |
| G10 | Coder isolation never demonstrated on a real task; effective live policy is unknown | proof gap; a prior `shared_workspace`/82-issue report was not runtime-queried | G1, G9 |
| G11 | Correction-attempt count conflicts with owner intent (impl default 3, owner archive item 57 states one genuine retry) | configuration + proof, not redesign | G7, **owner decision** |
| G12 | No capability-scope model (read/write/spend/publish/deploy/destructive/secrets/trading) | `MISSING`; `tool-access.ts` is app-gallery access, not these nine scopes | G6 |
| G13 | No Reviewer/Tester disagreement gate blocking release | `MISSING` in `server/src/services/` | G4 |
| G14 | No company or branch scoreboard (rejection/retry/rollback/cost/time/escaped bugs) | `MISSING`; `budget_policies`/`budget_incidents` exist but no department budgets | G5 |

G11-G14 are recorded because they are owner decisions with no implementation, not
because they unblock the coding foundation. G13 belongs in step 4 while the
review verdict is being extended; the rest stay deferred.

Brain gaps (routing, tests, `learning` built-in overlap, FK integrity) are
deliberately **excluded** from this batch. The Brain is `CODED` and unwired; per
§16 it must not be wired before the coding cycle produces trustworthy evidence.

### Recommended next batch

**Step 1 — Land capacity and close the bypass (G1, G2).**
Merge `agent1/global-capacity` into the integration branch and gate the
queued-comment claim inside the same `pg_advisory_xact_lock` transaction as the
claim itself. The `decide()`/`withAdmissionLock` split already makes this a
localized change. Leave the default at 4 but do **not** enforce a company-wide
policy until the counting rule is settled — the service is instance-wide by
design and configurable, which is correct.

**Step 2 — Recover the evidence contract and give review a revision identity (G3, G4).**
Take `packages/shared/src/delivery-evidence.ts` from `15bc8725b`, not from the
working tree. Add a revision field to the review verdict so
`revisionReviewed === submission.sha` has a producer. This is the single change
that connects §16's "review the exact submitted revision" to anything real.
Verify by proving a review of a *different* commit cannot satisfy `STAGED`.

**Step 3 — Persist evidence cheaply and deterministically (G5).**
One table and one service, no model invocation on write. Reuse existing work
products and run records where they already hold the facts; add a table only
where they do not. Export the contract from `packages/shared/src/index.ts`.

**Step 4 — Bound the Reviewer and make correction actually fire (G6, G7).**
Give the Reviewer run an enforced read-only capability rather than relying on
separate identity, and set an explicit `maxReviewRounds` on the coding pipeline
so the existing escalation path is live. Add a Tester path only where risk
warrants — the Tester role already exists in the package.

**Step 5 — Prove isolation and run one real task (G9, G10).**
Reconcile the company package's priority inversion and the Reviewer gate wording
**in source only**; do not activate without owner approval. Then run one small
real task and record the full trace: isolated working directory, exact revision,
checks, review verdict, bounded retry if any, and the resulting evidence row.

Steps 1-3 are mechanical and low-risk. Step 4 touches capability enforcement.
Step 5 requires owner approval before anything is activated live.

### Deferred on purpose

Brain wiring, routes, and agents; division expansion; risk-tier policy values;
UI work beyond what step 5 needs; the shared-UI repair work in the dirty tree.
None of these unblock the coding foundation.
