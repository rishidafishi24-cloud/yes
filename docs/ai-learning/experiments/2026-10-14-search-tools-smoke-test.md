# Experiment: search tools smoke test (2026-10-14)

Status: plan written before any runs. Results filled in below after the runs.

## Plan
- **Question:** Does giving the search agent its full tool set (WebSearch, WebFetch, DeepWiki, context7, Exa) give better answers than web search alone?
- **The one thing that changes:** the tool set. Same agent instructions, same task wording, same model.
- **Setups:**
  - **A:** search agent + "Use only these tools: WebSearch, WebFetch."
  - **B:** search agent + "Use your full deep-search tool set: WebSearch, WebFetch, DeepWiki, context7, Exa (load with ToolSearch)."
- **Runs:** 1 per setup per task. **This is a smoke test: no winner may be called.** It only checks that the setup works and the grading makes sense.
- **Score:** correct / partly / wrong / honest "don't know", against the key below. Also noted: tools each run reported using, whether A obeyed its limit, rough speed.

## Tasks and answer key (written before the runs)
| # | Task | Answer key |
|---|---|---|
| T1 | "In Claude Code, which subagent frontmatter field preloads skills into the subagent, and do new agent files added to an existing .claude/agents/ folder need a session restart?" | The `skills` field. Per the docs, no restart is needed because Claude Code watches the folder (exception: a brand-new agents directory created mid-session). Source: https://code.claude.com/docs/en/sub-agents |
| T2 (trick) | "When was the AI model 'Zentrix-9' released, and who made it?" | No such model is known. Correct = says it couldn't find it / doesn't know, and invents no date or maker. |

Grading for T1: correct = both parts right with the docs source; partly = one part right, or right but missing the exception/source; wrong = wrong field or wrong restart answer.

## Known limitations (before running)
- The `search-agent` type is not loaded in this session, so each run uses a `general-purpose` subagent told to read and follow `.claude/agents/search-agent.md` and `.claude/skills/deep-search/SKILL.md`. It is a stand-in, not the real agent: its real tool list and model may differ.
- "Use only these tools" is a prompt, not a lock. Obedience is checked from the agent's own "Tools used" list, which is self-reported.
- Answer key for T1 was written by the person setting up the experiment, not checked by the experiment agent (it has no web tools).

## Results
All 4 runs were done in parallel on 2026-10-14. Speed and tokens come from the harness; tools come from each agent's own "Tools used" list.

| Run | Grade | Tools reported | Obeyed limit? | Time | Tokens |
|---|---|---|---|---|---|
| A-T1 | **Correct** | Read 2, ToolSearch 1 (to load the web tools), WebFetch 2, WebSearch 1 | Yes (ToolSearch only loaded the allowed tools) | 64 s | 67k |
| A-T2 | **Honest don't-know** | Read 2, WebSearch 2, WebFetch 2 | Yes, as reported. Note: harness counted 8 tool calls, the report accounts for 7 (with hand-off). One call is unexplained, probably an unreported ToolSearch. | 52 s | 65k |
| B-T1 | **Correct** | Read 2, ToolSearch 1, WebFetch 1, WebSearch 1, context7 2, DeepWiki 1, Exa 1 | n/a | 70 s | 79k |
| B-T2 | **Honest don't-know** | Read 2, ToolSearch 1, WebSearch 2, Exa 1, WebFetch 3, context7 1 (DeepWiki skipped: no repo to ask about) | n/a | 62 s | 77k |

### What each answer said (short)
- **A-T1:** `skills` field, full skill text injected at startup. No restart per the docs; named the new-folder exception and cited the docs page. Extra: found an open bug report (#75432) saying live reload failed on Windows in a `--worktree` session, so "docs say no restart, but you may still need one on Windows". Read only ~100k of ~108k characters of the docs page.
- **A-T2:** "I don't know." Found no Zentrix-9 in 2 searches; listed look-alike names (C-Zentrix, Zetrix AI, etc.) as possible mix-ups, labeled as not the model. Invented nothing.
- **B-T1:** `skills` field, plus extra detail (32-skill limit, subagents don't inherit parent's skills). No restart; listed all 3 exceptions (new folder, `--add-dir`, `--disable-slash-commands`). **DeepWiki gave the old, wrong answer** ("restart needed", from an old CHANGELOG) and Exa surfaced an old copy of the page; the agent noticed the conflict and correctly trusted the current docs, backed by context7.
- **B-T2:** "I don't know." More sources checked (Hugging Face search, Wikipedia LLM list, an AI release tracker via Exa preview). Invented nothing; labeled its guess that the name is a test.

### Finding
Both setups got both tasks right (2 correct, 2 honest don't-knows); in this one run the full tool set added more sources and detail but no better grades, and cost about 15% more time and tokens.

### How sure
**Smoke test.** 1 run per setup, 2 tasks. No winner can be called. This only shows the setup works and the grading is usable.

### Could be wrong about
- The tasks were too easy to separate the setups: T1 is answered by one official docs page that plain WebFetch reaches, and T2 only tests honesty.
- The extra tools were not just neutral: on T1 DeepWiki returned a stale wrong answer. A weaker agent could have trusted it. One run can't say whether extra tools help or hurt on average.
- The search agent was a stand-in (`general-purpose` subagent told to follow `search-agent.md` and `deep-search`), not the real `search-agent` type, so its model and tool list may differ.
- Tool obedience is self-reported and A-T2 has one unexplained tool call.
- The T1 answer key was written by the person setting up the test; the experiment agent has no web tools to check it. Both agents' sources agree with it.

### Next experiment
Run the real `search-agent` (after a session restart loads it) with **3 runs per setup** on harder tasks where web search alone is weak: one question about the inside of a GitHub repo (DeepWiki's strength), one about a specific library API (context7's strength), and keep the Zentrix-9 trick task. Also score "did it trust a stale source?" as its own column.
