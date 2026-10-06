# Learning handoff: eval and self-check proposals

- **Date:** 2026-10-06
- **To:** Learning Agent (built-in `learning`, `server/src/services/built-in-agents.ts`)
- **From:** Owner, via a Claude Code session
- **Route:** Directly to Learning. **Not to Study.**
- **Status:** Owner decision between A and B is **pending**. Record the choice and the owner's reasons below when made.

## Why this goes to Learning, not Study

Owner clarification: Study already runs its own process, which is based on
online research comparison and the owner's own research. Owner preference
signals like this one (which proposal the owner picks and why) go straight to
Learning.

> Note for whoever maintains the company docs: `docs/AI_COMPANY_DECISION_LOG.md`
> and `docs/AI_COMPANY_ARCHITECTURE.md` currently describe Study as examining
> completed work and routing validated outcomes onward to Learning. This handoff
> follows the owner's newer instruction. The docs have not been updated to match.

## What the owner wants Learning to capture

The owner reviews two proposals for the same update, picks one, and explains
why. The **choice and the reasons** are the learning signal: they show how the
owner weighs speed, cost, evidence, and visible quality.

Treat each choice as an **observation of owner preference**, not a validated
general lesson. Promote a pattern only after several consistent choices.

## Owner principles behind the update (owner's own framing)

1. **Evals by repeated runs.** Run a task about 10 times and count passes
   (for example 7/10). Change one thing, re-run, and keep the change only if
   it scores better. Treat this as a statistical process.
2. **Let agents check their own work.** A single attempt is a first draft.
   Give the agent a way to check and revise before submitting: tests,
   screenshots, example comparisons, or a standard score such as Lighthouse.
   More revision rounds usually raise final quality, even with weak evals.
3. **Let the code be the context.** Separate notes, specs, and logs drift away
   from the code as versions change (V1 notes on V4 code). Keep the source of
   truth inline with the code so the two cannot diverge.

## The two proposals

### A: Measure first

Build the repeated-run eval before changing behavior: fixed coding tasks with
hidden tests, about 10 runs per setup, pass counts, and a luck band from
identical runs. Change one thing at a time; a change counts only if it beats
the luck band. Add the self-check loop and inlined context afterward, each
judged by the eval.

- Upside: every later decision has numbers behind it.
- Downside: no visible quality gain until the second step.

### B: Improve first

Add a check-and-revise loop to every coder now (run tests, compare against a
screenshot or score, revise up to a fixed limit), and inline each project's
spec into the code. Measure with a lighter eval of about 3 runs per variant.

- Upside: better output sooner.
- Downside: cannot reliably tell whether the loop helped or only cost more
  tokens.

The session that drafted these recommended **A**, with B's self-check loop as
the first piece to borrow if the owner wants visible progress sooner.

## Owner decision

- **Chosen:** _pending_
- **Why:** _pending_
- **Date:** _pending_
