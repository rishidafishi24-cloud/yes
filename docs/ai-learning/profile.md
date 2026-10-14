# Learner profile

Updated 2026-10-14 from two chats: the local Claude Code session (Oct 13–14) and the cloud chat "Yo" (Oct 6–14, transcript in this folder).

## Who
- High school student. Learns fast. Wants to understand **all of AI** and build with it.
- Doesn't code and doesn't want to code from scratch. Agrees that testing and spotting flaws matter more than writing code.
- Goal: learn to work like a professional AI engineer. The path chosen is **agent engineer**, plus a light model-training track.

## Setup
- Windows PC: Ryzen 5 2600 (6 cores, no integrated graphics), 16 GB DDR4, **AMD RX 580 8 GB** (Vulkan only, no ROCm; about 7.2 GB usable)
- LM Studio with an **abliterated** local model, used through **Odysseus** (PewDiePie's self-hosted workspace: bash, files, web and memory tools, plus MCP)
- Zed with cloud models through **OpenRouter** (worked well), VS Code, **Claude Code**, Codex, OpenCode (found its UI confusing)
- GitHub repo `rishidafishi24-cloud/yes`, a Paperclip fork (this repo)

## Projects (every lesson should tie back to these)
| Project | Where | Notes |
|---|---|---|
| **Paperclip** multi-agent company | this repo, `companies/` | CEO, Reviewer and hand-offs. Planned a 6-task coding exam with hidden tests, a grader script, and a run-twice luck check. |
| **Learning agent** | Paperclip | The owner picks A or B and says why. That's pairwise preference data (DPO). |
| **Content pipeline** | `companies/networked-ai-company/skills/content-pipeline/`, `tools/content-shorts/` | Shorts first, then Ambient, Music and Animation creators plus a Content Reviewer. Wants to repost and edit viral videos: the copyright risk was stated, and they decided to proceed. |
| **Game modding / RE** | n/a | Re-code a Unity game built by Opus with a smaller model and compare. Wants decompiler-based understanding of mechanics, then improvement. Tools: **REA** (6.4.0, JEB tools), **Universal Modder**. |
| **Jev layer** | n/a | TypeSafe AI's fast "System One" decision model, as a cheap and fast layer. |
| **Research agent** | n/a | Reliable search, transcripts and repos. last30days, yt-dlp, GitHub MCP read-only, Obsidian notes. |
| **AI Experiment Lab** | `evals/promptfoo` already exists | Compare models, prompts, tools and weights with repeated-run evals. Check existing tools before building. |

## How they learn best
- **One concept at a time**, short. They rejected a 2.5-hour, 13-chapter page as "not even good".
- **Hates:** clutter, repetition, re-teaching what they know, rounds of questions with no visible progress, and narrowing the course to a single problem they mentioned.
- **Wants:** a strict, objective teacher. Straight pros and cons. Real examples from their own projects. Current information, because new repos appear daily.
- Spots patterns in tests: in early quizzes the longest option was always right, and they noticed. Keep options balanced.
- Prompting level: about C+. They use approval gates and share source material well, but rarely give goals, context or "done" criteria up front. Keep coaching this.

## Strong instincts to build on
- Give the model a tool to check its own environment.
- Remove a risky tool rather than trust a prompt.
- "Test, test, test, never trust the first response, compare." Run things 10 times and compare to a baseline.
- Compare against other sources.
- Worked out the idea of RAG alone. Pictures embeddings as "an infinite space with endpoints".

## Teaching-style log
(Each cycle, add which lesson version they picked, A or B, and why.)
