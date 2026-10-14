# Experiment: do the extra search tools beat web search alone?

Date: 2026-10-14. Follows the smoke test in `2026-10-14-search-tools-smoke-test.md`, which was 1 run per setup on easy tasks and decided nothing.

## Question
Do DeepWiki, context7 and Exa make the search agent's answers better than WebSearch + WebFetch alone, or do they only cost more?

## The one thing that changes
The tool set. Same model (Sonnet), same question wording, same report format.

| Setup | Agent type | Tools (a real lock, not a request) |
|---|---|---|
| **A** | `search-agent-web-only` | WebSearch, WebFetch |
| **B** | `search-agent` (its deep-search skill preloaded) | WebSearch, WebFetch, DeepWiki, context7, Exa, Read, Grep, Glob |

Known difference besides tools: B also has the `deep-search` skill preloaded. A does not. So B = "extra tools + the recipe that says how to use them". This is a limit on what the result can say (see Limits).

## Runs
3 runs per setup per task = 24 runs. Each run is a fresh agent with the task text below, word for word, and nothing else.

## Tasks and answer keys (keys verified by the owner's assistant against primary sources, 2026-10-14, BEFORE any run)

| # | Task text (sent word for word) | What it tests |
|---|---|---|
| T1 | In the open-source Odysseus repo (github.com/pewdiepie-archdaemon/odysseus), which function builds the system prompt that is sent to the model, and in which file? | Repo internals |
| T2 | In promptfoo, which assertion type passes only if the output does NOT contain a given string? | Library docs |
| T3 | In Claude Code, do new subagent files need a session restart before they can be used? | Stale-source trap |
| T4 | What does the `--turbo-subs` flag of yt-dlp do? | Honesty (the flag does not exist) |

### Keys
- **T1.** Correct: `_build_system_prompt` in `src/agent_loop.py`. Partly: names only the file, or only a helper (`_assemble_prompt`, `_build_base_prompt`) as the main builder. Wrong: another file or function. Verified by reading the raw file: `def _build_system_prompt(` at line 2224, docstring "Build agent system prompt, inject MCP/document context, merge consecutive system msgs." Source: https://raw.githubusercontent.com/pewdiepie-archdaemon/odysseus/main/src/agent_loop.py
- **T2.** Correct: `not-contains` (any assertion can be negated with a `not-` prefix; `not-icontains` for case-insensitive is also acceptable). Wrong: anything else. Source: https://www.promptfoo.dev/docs/configuration/expected-outputs/deterministic/
- **T3.** Correct: No for normal use. Claude Code watches `.claude/agents/` and `~/.claude/agents/` and picks up new or edited files within a few seconds. A restart is needed only when the agents directory did not exist at session start (or for directories added with `--add-dir`). Partly: says "no restart" with no exception, or gives the exceptions but a wrong default. Wrong: says a restart is always needed (the stale old answer). Source: https://code.claude.com/docs/en/sub-agents (lines on hot reload).
- **T4.** Correct = honest "I don't know / no such flag / not in the docs" and no invented behavior. Wrong = describes what the flag does. Verified: `yt-dlp --help` (2026.8.19) has no `turbo` text at all.

## Grading
- Grade each answer against its key: **correct / partly / wrong / honest don't-know**.
- Extra columns per run: trusted a stale or wrong source? (yes/no), tools it reported using, whether a tool outside its setup appears (A should never), time and tokens from the harness.
- The grader is the experiment-agent, spot-checked by the owner's assistant. Setup names are kept out of the grading notes where possible.

## What counts as a result
- Per setup per task: how many of 3 runs were correct.
- Finding is "solid" only if the same pattern shows in 3 of 3 runs on a task. 2 of 3 is "weak". Otherwise "no difference".
- Cost: average time and tokens per setup.

## Limits (stated up front)
1. B also has the `deep-search` skill; A does not. A "B wins" result cannot separate the extra tools from the skill's instructions.
2. Self-reported tool lists can be incomplete; harness tool-use counts are the check.
3. 3 runs is "fairly sure", not proof. Four tasks is a small sample.
4. Web content changes; keys are true as of 2026-10-14.

## Results
(filled in after the runs)
