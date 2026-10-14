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
- 2026-10-14, cycle 1 (layering): didn't pick A or B. Wants **UML diagrams where possible, with a technical and a plain-English explanation side by side** until the terms are solid. Default to this format.
- 2026-10-14: what they want is "an agent I can talk to that keeps learning off me and adding context", and they don't want it complicated. This setup (chat + notes files + skill) is that. Don't add agents or tools for it.
- 2026-10-14, cycle 1: the calculator analogy plus sequence diagram did NOT land (re-test 0 of 4). Try a concrete artifact next (the actual JSON package, a notepad metaphor). Also wants to learn how to change model weights (Stage 7).
- 2026-10-14: the app vs. model split clicked through their own examples ("ChatGPT web is an app, not a model"; Chub/Janitor = basic apps that add a system prompt). Plain step-by-step from zero plus their own examples works better than diagrams-first. Concrete everyday examples beat metaphors.

## Sandbox RPG planning
- 2026-10-14: Project at C:\Users\god\Documents\ChatGPT\gb. Product/architecture discussion only until implementation is explicitly authorized. REA and Universal Modder are the intended investigation/adaptation/verification tools; they are not assumed to extract portable mechanics automatically.
- 2026-10-14: The assistant owns assessing the sandbox RPG vision and creating the base outline for REA, Universal Modder, and relevant tools/skills to realize it. Every milestone should explicitly say what each repository will do, what must be built beyond its capabilities, and how the result will be verified at ordinary and high power. Do not offer generic prototype plans that omit these repositories or treat them as optional references. Product questions belong to the user; technical assessment and recommendations belong to the assistant.
- Develop ordinary slow/weak gameplay and simplified fast/high-power gameplay together in one shared prototype, expanding gradually. Playable spherical mini-planets are later content, not the starting assumption for Earth.
- Combat camera should follow automatically with a fast, sharp response; hands are occupied with combat inputs, so continual use of the look stick should not be required. Foreground walls/surfaces blocking the action should become extremely transparent. The game selects a target automatically; the player can switch the lock to another enemy using the right stick or mouse. Camera response to teleporting remains open for testing, likely a mix; no specific policy has been chosen.
- Detailed confirmed/open/proposed game context: .cursor/rules/game-product-context.mdc and docs/design/power-scaled-movement-combat.md in the game project.
- 2026-10-14: **Live demos on their own model beat explanations.** Three explanations failed, but one real experiment (deleted message + warm cache, via the LM Studio API) made it concrete. Prefer "prove it on their PC" when possible.
- 2026-10-14: **Rule: answer my latest message directly, first.** No recap or jumping ahead before the answer.
- 2026-10-14: confused by tutor jargon in reports ("Verified", "queue", "cycle", "commit"). **Report in plain words:** "you learned it", "next topic", "save your notes online". Explain every new term in simple words and always give a bit of context on what the topic is.
- 2026-10-14 RESTART: asked to restart because (1) things were built without being explained, (2) Claude Code itself was never taught, (3) too much jargon, (4) too much at once, (5) their message wasn't answered first. New start prompt is in `start-prompt.md`. Lesson 1 = how to use Claude Code. **Never create a tool, file or setting without explaining it first and asking.**
- 2026-10-14: **didn't know the small boxes in Claude Code's chat are tool calls** (thought they were tips), so they had never been checking what I actually did. Teach the UI hands-on.
- 2026-10-14: rejected starting a new session: "every interaction is context for personalizing the lesson." Keep teaching in the same session when possible, and save conversations into notes.
- 2026-10-14: wants a **research, study, experiment** workflow running on **OpenRouter models**, in OpenCode (installed in WSL Ubuntu, v1.18.32). Research compiles the newest models, and experiments test them on fixed tasks. Starting defaults: deepseek-v4.1-flash and qwen3.8-flash (untested).
- 2026-10-14: **Default level = 4th grade.** Teach only exactly what they ask, very basic, short but detailed, objective. Use charts or UML diagrams only when they help. Go deeper only when they ask.
- 2026-10-14: said "do it all" for the search/teaching/experiment agent setup, and wants a **baby tutorial afterward**: exactly what was done, and why, in plain English. Built: search-agent + deep-search skill, experiment-agent + run-experiment skill, tutor-cycle hands research off. First smoke test: both setups were correct; the full tool set cost about 15% more and DeepWiki gave one stale answer.

## Animation creation app planning
- 2026-10-14: This project is separate from the sandbox RPG. We are using REA (https://github.com/morluto/rea) and Universal Modder (https://github.com/rehan-remade/universal-modder) as intended project tools. Assess their actual capabilities and limits; neither is assumed to automatically extract portable features or animation understanding.
- The assistant is responsible for assessing the user's animation vision and creating the base outline for the tools, skills, MCP connections, and app foundation needed to realize it. Each proposed milestone should explain what each repository contributes, what custom work is needed, and how the result will be checked. The assistant owns technical assessment and recommendations; the user owns creative goals and judges improvement.
- Goal: an image-first animation app connecting image generation/editing, clips, and audio with animation concepts such as speed treatments, viewpoint, timing, style, backgrounds, and character interactions. Record experiment instances, code/settings/results, and user feedback so earlier work can be revisited. Keep an untouched base and compare changes against both that base and the latest accepted version.
- Assess an established creative application as the foundation before building another editor. Adobe was raised as a possibility; Krita and Blender are candidates, not confirmed choices. The project remains its own app; its relationship to an existing editor is still open. This memory request authorizes recording the direction, not choosing a host, installing tools, or implementing an integration.
