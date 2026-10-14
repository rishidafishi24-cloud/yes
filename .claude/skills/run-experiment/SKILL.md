---
name: run-experiment
description: Run a fair, recorded experiment that compares AI setups (models, prompts, tools, skills, MCP servers, or combinations) on fixed tasks. Use when the owner wants to test which setup works best, or says "experiment", "compare", or "test which is better".
---

# Run an experiment

Find out which setup works best with evidence, not opinion. Builds on `docs/ai-learning/experiments/README.md` (read it first) and records results in `docs/ai-learning/experiments/log.md`.

## 1. Write the plan before running anything
Save it as `docs/ai-learning/experiments/YYYY-MM-DD-<slug>.md`:
- **Question:** one sentence, e.g. "Which search order gives more correct answers?"
- **The one thing that changes:** model, *or* prompt, *or* tool set. Everything else stays the same.
- **Setups:** A, B (and C) described exactly.
- **Tasks:** fixed questions with an **answer key written before the runs**. Include one trick task with no real answer (a good setup says "I don't know").
- **Runs:** how many times each setup runs each task. 1 run = smoke test only; call no winner. A real result needs 3 or more.
- **Score:** how each answer is graded (correct / partly / wrong / honest "don't know"), plus tools used and speed.

## 2. Run
| What is being compared | How to run it |
|---|---|
| Search tools, tool order, skills | Spawn the `search-agent` once per run with the same task, adding "Use only these tools: ..." for the setup. Read its "Tools used" list to confirm it obeyed. |
| Models or prompts | promptfoo in `evals/promptfoo`, pinned: `npx promptfoo@0.103.3 eval ...`. Needs `OPENROUTER_API_KEY`; if it's missing, stop and tell the owner. |
| The local model (LM Studio) | Use the `calibrate-local-model` skill. |

Limit to know: telling an agent "use only these tools" is a prompt, not a lock. Check its tool list every run and mark a run invalid if it broke the rule.

## 3. Grade fairly
- Grade against the answer key, not against what sounds good.
- Hide setup names (A/B/C) when showing answers to the owner for their pick.

## 4. Record
- Fill in the results table in the plan file.
- Add one row per task to `experiments/log.md`.
- End with: **Finding** (one plain sentence), **How sure** (smoke test / weak / solid), **Could be wrong about**, **Next experiment**.

## Rules
- Change one thing at a time.
- Never call a winner from a single run.
- Cost and speed count, not just quality.
- Never install tools or spend money without the owner's OK.
