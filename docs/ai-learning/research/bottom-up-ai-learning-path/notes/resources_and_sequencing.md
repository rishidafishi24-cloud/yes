# Bottom-up AI learning path: best free resources per step, and whether the order holds up (researched 2026-10-13)

## Key Question 1: What are the 1 to 3 best current free resources for each of the 9 planned steps?

### Takeaway
Every step has strong, free, current official material. Anthropic (Claude Academy / Skilljar plus the platform and Claude Code docs), modelcontextprotocol.io, LM Studio docs, Karpathy, 3Blue1Brown and the Transformer Explainer cover steps 1 to 8. Step 9 is best served by CyLab Security Academy (picoCTF's new name since May 2026), crackmes.one level-1 crackmes and the official Ghidra Beginner class. Two catalog changes matter: picoCTF.org has become CyLab Security Academy, and Anthropic's courses now appear under two hostnames (anthropic.skilljar.com and academy.claude.com).

### Cited Findings

**Catalog/platform status changes (as of Oct 2026)**
- anthropic.skilljar.com lists at least 23 courses, including Claude 101, Claude Code 101, Claude Code in Action, AI Fluency: Framework & Foundations, AI Fluency for Students, AI Fluency for Builders, Introduction to Model Context Protocol, MCP: Advanced Topics, Introduction to Agent Skills, Introduction to Subagents, Introduction to Claude Cowork, and "AI Capabilities and Limitations" ("an introductory course on how AI works"). There is no course dedicated only to prompting; the AI Fluency courses come closest — [Anthropic Academy (Skilljar)](https://anthropic.skilljar.com/)
- academy.claude.com ("Claude Academy") lists "AI Fluency: Framework and foundations" (14 lessons, 1 quiz, 4 hr), "AI capabilities and limitations" (13 lessons, 1 quiz, 3.5 hr) and "Building effective human-agent teams (beta)" (5 lessons, 45 min). It describes itself as "Free courses, tutorials, and use cases" — [Claude Academy](https://academy.claude.com/)
- The official Claude Code docs link to "Claude Academy" with free self-paced courses, including academy.claude.com/courses/claude-code-101 and /claude-code-in-action. That suggests the catalog is moving to academy.claude.com — [Claude Code docs overview](https://code.claude.com/docs/en/overview)
- picoCTF.org has become **CyLab Security Academy**, "Carnegie Mellon University's free cybersecurity learning platform." Logins created before May 8, 2026 work at cylabacademy.org, and progress carries over — [picoctf.org](https://picoctf.org/)
- The Hugging Face /learn index lists 12 courses (LLM, Context, Agents, smol, Deep RL, etc.) but **does not list the MCP course**. The MCP course page is still live — [HF Learn](https://huggingface.co/learn); [HF MCP Course](https://huggingface.co/learn/mcp-course/unit0/introduction)
- skills.github.com now redirects to GitHub Learn (learn.github.com/skills) — [skills.github.com](https://skills.github.com/)
- MCP docs URLs now include a spec version in the path (e.g. /docs/2026-07-28/learn/architecture) — [MCP intro](https://modelcontextprotocol.io/docs/getting-started/intro)

**Step 1: One request start to finish (statelessness, context, tokens)**
- Anthropic's "Context windows" doc defines the context window as "all the text a language model can reference when generating a response, including the response itself", a "working memory" that is separate from training data. Each turn's input phase "contains all previous conversation history plus the current user message". The system prompt, messages, tool results and tool definitions all count toward the window. The doc also explains "context rot" (accuracy degrades as the token count grows). Free, official, with diagrams — [Anthropic Context windows doc](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- Tiktokenizer (tiktokenizer.vercel.app) is a free, open-source, no-account browser playground. It color-codes how text splits into tokens and counts them, and Karpathy introduced it in his tokenizer video. It shows OpenAI encodings (e.g. o200k_base), not Claude's tokenizer — [Lilly Tech tiktokenizer guide](https://aischool.lillytechsystems.com/tiktokenizer/getting-started.html); [SourcePulse project page](https://www.sourcepulse.org/projects/1845695)
- 3Blue1Brown's "Large Language Models explained briefly" is a short animated explainer made for a Computer History Museum exhibit. Grant Sanderson made it because the longer transformer videos targeted "a mildly technical audience" — [3Blue1Brown Substack](https://3blue1brown.substack.com/p/large-language-models-explained-briefly)
- Karpathy's "Intro to Large Language Models" (Nov 2023, about 1 hr, general audience) covers what an LLM is ("a next-token predictor with two files"), pretraining vs fine-tuning, the "LLM OS" framing, tool use, and security (jailbreaks, prompt injection, data poisoning). One guide says it "requires no math or code". Its specifics are dated but its concepts hold up — [BERI summary](https://www.beri.net/learning/karpathy-intro-to-llms); [Simon Willison](https://simonwillison.net/2023/Nov/23/intro-to-large-language-models/)

**Step 2: App layers (model / runner / app / provider)**
- LM Studio docs cover getting started, downloading a model, Chat with Documents, MCP servers, an OpenAI-compatible local API server, a REST API, headless mode ("llmster") and config presets. The engines are llama.cpp (GGUF) and MLX. Running a model locally and then serving it to other apps over an OpenAI-compatible API shows the runner/app split directly — [LM Studio docs](https://lmstudio.ai/docs/app); [OpenAI-compat API](https://lmstudio.ai/docs/api/openai-api)
- Odysseus is a new (mid-2026) self-hosted, open-source "AI workspace" covering chat, agents, research, docs, email and calendar. Its Snap Store listing says it connects to Ollama, **LM Studio**, OpenAI, Anthropic, and any OpenAI-compatible endpoint. Its agent layer supports MCP, skills and memory. Setup is via Docker (docker compose, then localhost:7000) — [Snapcraft listing](https://snapcraft.io/odysseus); [dsebastien review](https://www.dsebastien.net/odysseus-ai/). **Conflicts:** sources disagree on the license (AGPL-3.0 vs MIT) and the launch date. One review attributes the launch to Felix Kjellberg (PewDiePie), notes it had no formal release tags, and other sources list llama.cpp/vLLM/Ollama as backends without LM Studio — [Gigazine](https://gigazine.net/gsc_news/en/20260627-odysseus); [madebyagents comparison](https://www.madebyagents.com/desktop-apps/compare/lm-studio-vs-odysseus)
- Karpathy's "How I use LLMs" (Feb 2025, about 2h11m) is a practical tour of interaction modes, choosing between models, pricing tiers, "thinking" models, and tools (search, Python interpreter) — [Analytics Vidhya summary](https://www.analyticsvidhya.com/blog/2025/03/how-andrej-karpathy-uses-llms/)
- Zed's AI docs explain the layers of an AI editor. They cover the Agent Panel, Zed's native agent, "External Agents" (ACP-integrated agents running their own process), Terminal Threads for running agent CLIs, LLM providers and API keys, and "Use a Local Model" — [Zed AI overview](https://zed.dev/docs/ai/overview)

**Step 3: Tools (function calling / the agent loop)**
- The Hugging Face Agents Course Unit 1 ("Agent Fundamentals") covers tools, thoughts, actions, observations and chat templates, and it is theory-focused. The course is free, certification is free, each unit takes about 3 to 4 hrs/week, and the stated prerequisite is basic Python — [HF Agents Course](https://huggingface.co/learn/agents-course/unit0/introduction)
- The Anthropic context-windows doc walks through how a tool-use cycle enters the context. Turn 1 outputs a tool-use request, the tool_result is fed back as input, and everything accumulates in the window — [Anthropic Context windows doc](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- Claude Code docs, official and free to read, cover the agentic tool loop in practice: reading files, running commands, permissions, a beginner "terminal guide", and a quickstart. Most Claude Code surfaces require a paid Claude subscription or a Console account — [Claude Code overview](https://code.claude.com/docs/en/overview)

**Step 4: MCP / connectors / plugins / skills**
- modelcontextprotocol.io "What is MCP" calls MCP "a USB-C port for AI applications", an open standard connecting AI apps to data, tools and workflows. It links to Architecture and Security Best Practices pages — [MCP intro](https://modelcontextprotocol.io/docs/getting-started/intro)
- The MCP "Connect to local MCP servers" user guide is the best hands-on first MCP lab. It configures the Filesystem server in Claude Desktop by editing `claude_desktop_config.json`, which requires **Node.js/npx**. It warns: "The server runs with your user account permissions" and says to grant only folders you're comfortable with. Every action requires approval, and API keys go in an `env` block — [MCP connect-local-servers](https://modelcontextprotocol.io/docs/develop/connect-local-servers)
- Anthropic's "Introduction to Agent Skills" (building, configuring and sharing Skills in Claude Code) and "Introduction to Subagents" are free on Skilljar. "Introduction to Model Context Protocol" builds servers and clients in Python, so it is code-heavy — [Anthropic Academy](https://anthropic.skilljar.com/)
- The HF **Context Course** teaches context engineering for code agents in this unit order: Skills → MCP → Plugins → Sub-agents → Hooks → a minimal agent harness. It requires basic Python, the command line, and an installed code agent (Claude Code, Codex, OpenCode) — [HF Context Course](https://huggingface.co/learn/context-course)
- LM Studio supports MCP servers with local models — [LM Studio MCP docs](https://lmstudio.ai/docs/app/mcp)
- DeepLearning.AI "MCP: Build Rich-Context AI Apps with Anthropic" (Elie Schoppik): intermediate level, about 1h38m, 11 video lessons. Access is free during the platform beta, but graded items may need PRO — [DeepLearning.AI course](https://deeplearning.ai/short-courses/mcp-build-rich-context-ai-apps-with-anthropic)

**Step 5: Memory and RAG**
- Anthropic's "Contextual Retrieval" post (Sep 19, 2024) explains RAG plainly: chunking, embeddings, similarity search and BM25 keyword matching. It also says that if a knowledge base is under about 200k tokens (about 500 pages) you can put it all in the prompt and skip RAG. That is a useful link back to step 1. Some jargon (TF-IDF, reranking) goes unexplained — [Anthropic Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval)
- Claude Code memory: `CLAUDE.md` is read at the start of every session, and "auto memory" saves learnings across sessions. Together they are a concrete example of memory as text re-injected into context — [Claude Code overview](https://code.claude.com/docs/en/overview) (links to /docs/en/memory)
- LM Studio "Chat with Documents" lets you attach documents to a local chat and run RAG offline. The docs page does not explain how the retrieval works — [LM Studio RAG doc](https://lmstudio.ai/docs/app/basics/rag); [LM Studio docs index](https://lmstudio.ai/docs/app)

**Step 6: Builder basics (git, npm, JSON, .env)**
- GitHub Skills "Introduction to GitHub" takes under an hour and has no prerequisites. It runs as a template repo guided by Actions: create a branch, commit, open a PR, merge, and end with a Markdown profile README. A public repo is recommended (private repos use Actions minutes) — [Introduction to GitHub](https://github.com/skills/introduction-to-github)
- Oh My Git! is an open-source game for Windows, macOS and Linux. It teaches git with command cards, a live visualization of repo internals, and a real git terminal — [Oh My Git!](https://ohmygit.org/)
- The MCP local-server guide is a practical JSON, npm/npx and env-var lesson in disguise. It uses a JSON config file, `npx -y <package>`, an `"env"` block holding an API key, and `npm install -g npm` for troubleshooting — [MCP connect-local-servers](https://modelcontextprotocol.io/docs/develop/connect-local-servers)
- Claude Code docs include a beginner "terminal guide" and recommend Git for Windows on native Windows — [Claude Code overview](https://code.claude.com/docs/en/overview)

**Step 7: Local model internals (runners, quantization, VRAM, GPU backends)**
- LM Studio system requirements on Windows: the CPU must support AVX2, 16GB RAM is recommended, and at least 4GB dedicated VRAM is recommended. The page does not mention AMD, Vulkan, or ROCm — [LM Studio system requirements](https://lmstudio.ai/docs/app/system-requirements)
- For AMD Polaris cards (RX 400/500, including the RX 580), Vulkan is the working route; ROCm is unsupported. A 2026 guide recommends trying Vulkan first in LM Studio on desktop AMD GPUs — [glukhov.org ROCm vs Vulkan 2026](https://glukhov.org/llm-hosting/comparisons/amd-rocm-vs-vulkan-llm-hosting/)
- A community project runs llama.cpp on an RX 580 with the Vulkan backend, calling it "the most robust method". An 8B vision model nearly fills the 8GB of VRAM, so context and batch size need trimming — [llama-cpp-rx580 (GitHub)](https://github.com/peterjdolan/llama-cpp-rx580)
- AMD says LM Studio ships a llama.cpp port that can use Vulkan for GPU offload. This is vendor material focused on newer Ryzen AI chips — [AMD blog](https://www.amd.com/en/blogs/2024/accelerating-llama-cpp-performance-in-consumer-llm.html)

**Step 8: How models are made**
- Karpathy's "Deep Dive into LLMs like ChatGPT" (Feb 5, 2025) is a general-audience walk through the whole pipeline: data collection, tokenization, pretraining, post-training into an assistant, hallucinations, and tool use as a mitigation. Its length is listed at about 3h31m by an aggregator; one secondary source called it "1 hour", which likely confuses it with the 2023 Intro talk — [DEV Community summary](https://dev.to/absterellio/andrej-karpathys-deep-dive-into-llms-like-chatgpt-576o); [rosetta.to listing](https://rosetta.to/u/andrejkarpathy/2025)
- 3Blue1Brown Deep Learning Chapter 5, "Transformers, the tech behind LLMs" (Apr 1, 2024), is followed by Chapter 6, "Attention in transformers, step-by-step". It assumes or reviews vectors, matrix-vector products, dot products, softmax and probability distributions — [3Blue1Brown lesson: GPT](https://www.3blue1brown.com/lessons/gpt). Simon Willison called the attention video "the clearest explanation I've seen of the topic anywhere" — [Simon Willison](https://simonwillison.net/2024/Apr/11/3blue1brown/)
- The Transformer Explainer (Georgia Tech Polo Club) runs a live GPT-2 small (124M) in the browser. You can type text and inspect tokenization, embeddings, positional encoding, multi-head attention maps, the MLP and output probabilities, and adjust temperature, top-k and top-p. Free, no install — [Transformer Explainer](https://poloclub.github.io/transformer-explainer/)

**Step 9: Apply it — REA on a CTF practice target**
- CyLab Security Academy (formerly picoCTF) is "always free" and serves "middle schoolers through adults". It has 500+ practice challenges from beginner to advanced across 8 domains, including Reverse Engineering (disassembling, decompiling, tracing execution) and an AI domain (prompt injection, adversarial examples, model inversion). Teachers can set up classrooms — [CyLab Security Academy](https://cylabacademy.org/)
- crackmes.one hosts about 4,792 crackmes and 6,818 writeups. You register to submit, and auto-validated crackmes earn points — [crackmes.one](https://crackmes.one/). Its FAQ points beginners to difficulty-1 crackmes. It lists Ghidra, IDA, Binary Ninja, x64dbg and GDB as tools, and advises running crackmes in a VM, taking a snapshot first, and disabling network access — [crackmes.one FAQ](https://crackmes.one/faq)
- The official Ghidra "Introduction to Ghidra" student guide sits in the NSA Ghidra repo under GhidraDocs/GhidraClass/Beginner. It comes as slides plus a "withNotes" version, is usable as a self-paced tutorial, and its exercises "work with any program". The README warns that Edge renders the slides poorly — [Ghidra Beginner README (mirror)](https://git.sudo.is/mirrors/ghidra/src/branch/master/GhidraDocs/GhidraClass/Beginner/README.txt)

### Inferences
- Best picks per step:
  1. Anthropic context-windows doc, 3B1B "LLMs explained briefly", Tiktokenizer.
  2. LM Studio docs (local server), Odysseus pointed at LM Studio, Karpathy "How I use LLMs".
  3. HF Agents Unit 1 (read for concepts) and Claude Code docs.
  4. MCP intro plus "Connect to local servers", Anthropic "Intro to Agent Skills", MCP Security Best Practices.
  5. Anthropic Contextual Retrieval, Claude Code memory docs, LM Studio Chat with Documents.
  6. GitHub "Introduction to GitHub", Oh My Git!, the MCP config guide as a JSON/npx/env lab.
  7. LM Studio system-requirements and runtime settings, plus the Vulkan-on-Polaris guide.
  8. Karpathy Deep Dive, 3B1B Ch5–6, Transformer Explainer.
  9. CyLab Academy RE challenges, crackmes.one difficulty 1, the Ghidra Beginner class.
- The Anthropic prompt-engineering interactive tutorial is dated (built on Claude 3 Haiku) and API-based. For a non-coder in 2026 it is lower priority than the AI Fluency course or Claude Code docs — [Prompt eng tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial)
- Odysseus is very new, and sources conflict on its license and backends. Treat it as optional, and plan to verify LM Studio compatibility against the GitHub README before relying on it.

### Gaps
- I could not identify or verify the "REA MCP tool". Its name, repository, safety model and supported targets are unknown. The writer should get the exact project link from the user.
- I found no verified free resource dedicated to JSON, .env and npm for non-coders, beyond the MCP config guide and Claude Code's terminal guide. I did not verify MDN or other primers.
- I did not fetch the direct YouTube URLs for Karpathy's three videos or for 3B1B chapters 1–4. The descriptions and lengths come from secondary summaries (Simon Willison, BERI, DEV, an aggregator).
- I did not fetch OpenAI Codex docs. Zed's page does not name Claude Code or Codex as external agents, so ACP support for them is unconfirmed here.
- I did not fetch the MCP Security Best Practices page itself, only its link from the intro page.
- I could not confirm whether the anthropic.skilljar.com and academy.claude.com catalogs are the same or are migrating.

## Key Question 2: Which resources suit a non-coder high schooler, and what are their length, format and cost?

### Takeaway
Conceptual videos, browser tools, Anthropic's AI Fluency and "AI capabilities and limitations" courses, OpenAI Academy foundations, Elements of AI Part 1, the GitHub intro, the MCP user guide and CyLab Academy are all accessible without coding and free. Hugging Face's LLM, MCP and Context courses, Anthropic's Intro to MCP, and DeepLearning.AI's MCP and Claude Code courses assume Python or Git. They are best skimmed for concepts or saved for later.

### Cited Findings

**No coding needed**
- 3Blue1Brown "LLMs explained briefly": a short video made for a general museum audience. Free — [3B1B Substack](https://3blue1brown.substack.com/p/large-language-models-explained-briefly)
- Karpathy, "Intro to LLMs": about 1 hr, "no math or code", free on YouTube — [BERI](https://www.beri.net/learning/karpathy-intro-to-llms)
- Karpathy, "How I use LLMs": about 2h11m. "Deep Dive": about 3h31m, general audience — [rosetta.to](https://rosetta.to/u/andrejkarpathy/2025)
- Transformer Explainer: runs in the browser, no stated requirements, free — [Transformer Explainer](https://poloclub.github.io/transformer-explainer/)
- Tiktokenizer: free, in-browser, no account — [Lilly Tech guide](https://aischool.lillytechsystems.com/tiktokenizer/getting-started.html)
- Anthropic "AI Fluency: Framework and foundations" (14 lessons, 4 hr) and "AI capabilities and limitations" (13 lessons, 3.5 hr). Free — [Claude Academy](https://academy.claude.com/). "AI Fluency for Students" is on Skilljar — [Anthropic Academy](https://anthropic.skilljar.com/)
- OpenAI Academy "AI Foundations" (about 60–75 min) → "Applied AI Foundations" (about 75–90 min) → "Agents and Workflows". Free with a ChatGPT login and hosted on Gradual. Badges at ≥80%, but these are "not certifications" — [OpenAI Help Center](https://help.openai.com/sr-rs/articles/20001270-openai-academy-courses); [Analytics Vidhya](https://www.analyticsvidhya.com/blog/2026/06/free-openai-ai-courses-with-certificates/)
- Elements of AI Part 1: free, from MinnaLearn and the University of Helsinki, needs "no complicated math or programming". Part 2 ("Building AI") recommends basic Python — [Elements of AI](https://www.elementsofai.com/)
- GitHub "Introduction to GitHub": under 1 hr, no prerequisites — [GitHub Skills](https://github.com/skills/introduction-to-github)
- Oh My Git!: open source, a desktop game — [Oh My Git!](https://ohmygit.org/)
- MCP "Connect to local servers": a step-by-step GUI and JSON-edit guide. It needs Node.js installed but no programming — [MCP guide](https://modelcontextprotocol.io/docs/develop/connect-local-servers)
- CyLab Security Academy: free, for middle school to adult — [CyLab](https://cylabacademy.org/)
- Ghidra Beginner class: self-paced slides — [Ghidra README](https://git.sudo.is/mirrors/ghidra/src/branch/master/GhidraDocs/GhidraClass/Beginner/README.txt)

**Watchable for concepts; skip or skim the code**
- 3B1B Ch 5–6: assume vectors, matrix-vector products and softmax — [3B1B GPT lesson](https://www.3blue1brown.com/lessons/gpt)
- HF Agents Course: the prerequisite is basic Python, but Unit 1 is theory-focused. 3–4 hrs/week per unit, free certificates — [HF Agents](https://huggingface.co/learn/agents-course/unit0/introduction)
- DeepLearning.AI "Claude Code: A Highly Agentic Coding Assistant": about 2 hr, 10 videos, intermediate. Best with "familiar with Python and Git". Free during the beta; certificates need PRO — [DeepLearning.AI](https://www.deeplearning.ai/short-courses/claude-code-a-highly-agentic-coding-assistant/)
- Anthropic "Contextual Retrieval": a readable blog post with some unexplained jargon — [Anthropic](https://www.anthropic.com/news/contextual-retrieval)

**Assumes coding (later or optional)**
- HF LLM Course: requires "good Python knowledge". Each chapter is about 6–8 hrs/week, with no certificate currently. Chapters 10–12 cover fine-tuning, dataset curation and reasoning models — [HF LLM Course](https://huggingface.co/learn/llm-course/chapter1/1)
- HF MCP Course: expects experience in at least one programming language (Python or TypeScript examples). Free certificate — [HF MCP Course](https://huggingface.co/learn/mcp-course/unit0/introduction)
- HF Context Course: basic Python, command line, and an installed code agent. Codex needs a paid ChatGPT plan or API key — [HF Context Course](https://huggingface.co/learn/context-course)
- Anthropic "Introduction to Model Context Protocol" builds MCP servers and clients in Python — [Anthropic Academy](https://anthropic.skilljar.com/)
- The Anthropic prompt-engineering tutorial runs against the API with Claude 3 Haiku and recommends a Google Sheets version (Claude for Sheets) as more user-friendly. Its requirements and cost are not stated on the repo page — [GitHub repo](https://github.com/anthropics/prompt-eng-interactive-tutorial)

**Costs to flag**
- Claude Code needs a paid Claude subscription or a Console account on most surfaces, and the Desktop app requires a paid subscription — [Claude Code overview](https://code.claude.com/docs/en/overview)
- Codex (as used in the HF Context Course) needs a paid ChatGPT plan or an OpenAI API key — [HF Context Course](https://huggingface.co/learn/context-course)

### Inferences
- For a fast, clutter-averse learner, the leanest no-code core is about 15 hours:
  - 3B1B brief (minutes)
  - Karpathy Intro (1 h)
  - Anthropic "AI capabilities and limitations" (3.5 h)
  - Karpathy "How I use LLMs" (2 h)
  - Karpathy Deep Dive (3.5 h, can be split)
  - Transformer Explainer and Tiktokenizer (hands-on)
  - GitHub intro (<1 h)
  - The MCP local-server guide
- The paid-tool requirement (Claude Code / Codex) is the main cost risk for a high schooler. The local stack (LM Studio, Zed with a local model, Odysseus) gives a free path for practicing the "app/runner/provider" and tools/MCP concepts.
- Courses that "require Python" (HF Agents and Context, the DeepLearning.AI courses) can still work as "watch the concept videos, let Claude Code write the code". That fits the "build without coding" goal, but the learner should know they are skipping the exercises.

### Gaps
- No verified total hours for Anthropic's "AI Fluency for Students", "Claude Code 101" or "Introduction to Agent Skills"; the catalog page didn't show lengths.
- No verified age minimums for Anthropic Academy, OpenAI Academy (which requires a ChatGPT account, with its own age terms) or Hugging Face accounts. The writer should flag account-age terms as unverified.

## Key Question 3: Is the proposed order sound against reputable AI-literacy frameworks? What should change?

### Takeaway
The bottom-up spine (request → layers → tools → MCP → memory/RAG) is sound and matches how Anthropic, Hugging Face and OpenAI order their own materials. Three changes are recommended:
1. Move builder basics (JSON, terminal, Node/npx, env vars, git) to just before MCP, because the official MCP setup requires them.
2. Swap steps 7 and 8, so the learner knows how a model is made before learning how its weights are run and compressed locally.
3. Thread safety and ethics (prompt injection, permissions, responsible use) through every step instead of saving them for the end.

The frameworks do not prescribe a strict order, but they consistently put use and understanding before design and building.

### Cited Findings
- **AI4K12 Five Big Ideas:** Perception; Representation & Reasoning; Learning; Natural Interaction; Societal Impact. These are organized as grade-band progression charts (K-2, 3-5, 6-8, 9-12) for curriculum developers, and they are not a prescribed sequence. The latest dated announcement on the site is Feb 2024, with no generative-AI update visible — [AI4K12 home](https://ai4k12.org/); [Gradeband progression charts](https://ai4k12.org/gradeband-progression-charts/)
- AI4K12 Big Idea 3 (Learning): "Computers can learn from data". Machine learning is statistical inference that finds patterns in data and requires large amounts of training data, usually from people — [AI4K12 Big Idea 3](https://ai4k12.org/big-idea-3-overview/)
- **EC/OECD AI Literacy Framework "Empowering Learners for the Age of AI" (final, launched June 18, 2026):** 19 competences in four domains: Engaging with AI, Creating with AI, Managing AI, and Shaping AI. The May 2025 draft had 22 competences, and its fourth domain was "Designing AI". It is non-binding and will inform PISA 2029's media and AI literacy assessment — [EdTech Innovation Hub](https://edtechinnovationhub.com/news/european-commission-and-oecd-set-19-ai-literacy-competences-for-schools); [KI-Campus](https://ki-campus.org/en/blog/ai-literacy-framework-published-oecd-and-european-commission). These are secondary sources; I did not retrieve the primary OECD/EC document.
- **Anthropic AI Fluency (4D framework):** Delegation, Description, Discernment and Diligence, across three modes (automation, augmentation, agency). Developed with Rick Dakan and Joseph Feller and licensed CC BY-NC-SA 4.0 — [Anthropic AI Fluency PDF](https://www-cdn.anthropic.com/b383cf6baddbfc72fdf8b0ed533a518e2872d531.pdf); [eWeek](https://www.eweek.com/news/anthropic-ai-fluency-course/). One commentator warns that compressing distinct skills into one acronym can make it feel like a checklist — [The Neuron](https://www.theneuron.ai/explainer-articles/inside-anthropics-ai-fluency-masterclass-on-human-ai-collaboration)
- **OpenAI Academy:** AI Foundations → Applied AI Foundations → Agents and Workflows. "Take them in this order: each one assumes the last." The sequence runs from basics, prompting and context, to workflows, to agents — [OpenAI Help Center](https://help.openai.com/sr-rs/articles/20001270-openai-academy-courses); [Analytics Vidhya](https://www.analyticsvidhya.com/blog/2026/06/free-openai-ai-courses-with-certificates/)
- **Elements of AI:** Part 1 (concepts, no programming) comes before Part 2 (algorithms, with Python) — [Elements of AI](https://www.elementsofai.com/)
- **Hugging Face:** the MCP course points learners who lack background to the LLM Course and Agents Course first. The Context Course orders its units Skills → MCP → Plugins → Sub-agents → Hooks → agent harness — [HF MCP Course](https://huggingface.co/learn/mcp-course/unit0/introduction); [HF Context Course](https://huggingface.co/learn/context-course)
- **Karpathy's pairing:** "How I use LLMs" is a follow-up to "Deep Dive". He teaches how models are built first, then usage — [Analytics Vidhya](https://www.analyticsvidhya.com/blog/2025/03/how-andrej-karpathy-uses-llms/)
- **Evidence for moving builder basics earlier:** the official MCP local-server tutorial needs Node.js/npx, a hand-edited JSON config, absolute file paths, an `env` block with API keys, and possibly `npm install -g npm` — [MCP connect-local-servers](https://modelcontextprotocol.io/docs/develop/connect-local-servers). Claude Code recommends Git for Windows and works directly with git commits and PRs — [Claude Code overview](https://code.claude.com/docs/en/overview)
- **Evidence for swapping 7 and 8:** Karpathy's Intro describes an LLM as "a next-token predictor with two files" (parameters plus the code that runs them). That framing links training output directly to what a local runner loads — [BERI](https://www.beri.net/learning/karpathy-intro-to-llms)
- **Evidence for threading safety earlier:**
  - The MCP intro and setup guides foreground security: servers run with user permissions, actions need approval, and there is a dedicated security best-practices page — [MCP guide](https://modelcontextprotocol.io/docs/develop/connect-local-servers); [MCP intro](https://modelcontextprotocol.io/docs/getting-started/intro)
  - Karpathy's 2023 talk covers prompt injection and data poisoning — [BERI](https://www.beri.net/learning/karpathy-intro-to-llms)
  - CyLab's AI domain covers prompt injection — [CyLab](https://cylabacademy.org/)
  - AI4K12 Big Idea 5 (Societal Impact) and EC/OECD "Managing AI" make responsible use a core domain — [AI4K12](https://ai4k12.org/); [EdTech Innovation Hub](https://edtechinnovationhub.com/news/european-commission-and-oecd-set-19-ai-literacy-competences-for-schools)

### Inferences
- **The order is sound overall.** Mechanism-first from "one request" mirrors Anthropic's own docs, where context comes first, then tools, then memory and compaction. Anthropic's context-windows doc even ties RAG and memory back to context limits. It also matches the frameworks' "Engaging/using before Creating/Shaping" progression.
- **Recommended revised order:**
  - **0, first hour:** "What an LLM is." 3B1B brief, then Karpathy Intro (first part), then Tiktokenizer. Statelessness only makes sense once next-token prediction and tokens are concrete.
  - **1:** One request start to finish. Anthropic context-windows doc; count tokens on a real chat.
  - **2:** App layers, hands-on immediately. Install LM Studio, load a small model (runner plus app), turn on its OpenAI-compatible server, point Odysseus or Zed at it (a different app on the same runner), then compare with Claude (a cloud provider). Early hands-on suits a fast learner who dislikes clutter.
  - **2.5 (moved from 6), "just-in-time builder basics":** terminal, JSON syntax, env vars and API-key hygiene, Node/npx, then git (Intro to GitHub, Oh My Git!). This sits before tools and MCP, because MCP and Claude Code depend on it.
  - **3:** Tools and the agent loop. HF Agents Unit 1 concepts, Claude Code docs, "How I use LLMs".
  - **4:** MCP, then skills, plugins, subagents and hooks. Follow the HF Context Course ordering, and add MCP security best practices plus prompt injection here, not later.
  - **5:** Memory and RAG. Contextual Retrieval, CLAUDE.md and auto memory, LM Studio Chat with Documents.
  - **6 (was 8):** How models are made. Karpathy Deep Dive, 3B1B Ch 5–6, Transformer Explainer.
  - **7 (was 7):** Local model internals. GGUF and quantization, VRAM budgeting on 8GB, Vulkan vs ROCm on the RX 580, context length vs VRAM. This makes more sense once the learner knows what weights are.
  - **8 (was 9):** RE foundations first (CyLab RE challenges, Ghidra Beginner, crackmes level 1 in a VM), then add REA MCP as an assistant. The learner should be able to judge AI output on RE (Anthropic's "Discernment") before automating it.
- **Use-like-a-pro thread:** run Anthropic "AI Fluency: Framework and foundations" or "AI Fluency for Students" alongside steps 1–3, as Anthropic and OpenAI do with their foundations tracks. That builds Delegation, Description, Discernment and Diligence habits while the mechanics are learned.

### Gaps
- None of the frameworks consulted (AI4K12, EC/OECD, Elements of AI, Anthropic, OpenAI) addresses "AI builder" topics such as MCP, local models or git ordering. Sequencing evidence for steps 3–7 comes from course structures (HF, Anthropic, OpenAI) and tool prerequisites, not from literacy frameworks.
- I could not retrieve AI4K12's 9-12 progression-chart contents or one-line Big Idea statements beyond titles and the Big Idea 3 overview.
- I did not retrieve the primary EC/OECD framework PDF, so the domain names come from secondary coverage, which is consistent across two sources.

## Key Question 4: What are safe and legal reverse-engineering learning paths for teens (CTF platforms, DMCA exemptions, game ToS)?

### Takeaway
The safest path uses targets built to be reverse-engineered: CyLab Security Academy (picoCTF) RE challenges, then crackmes.one difficulty-1 binaries in a snapshotted, network-disabled VM, with the official Ghidra Beginner class. Applying REA there keeps everything legal. US DMCA §1201 provides narrow interoperability (§1201(f)) and security-testing (§1201(j)) exceptions, plus the 2024 Copyright Office exemptions for good-faith security research, repair and abandoned-server games. None of these is a blanket license, none shields against CFAA or contract (EULA/ToS) claims, and game EULAs commonly forbid reverse engineering. Modding owned things should therefore stay offline and single-player, use official mod tools where they exist, and avoid anything touching online play or anti-cheat.

### Cited Findings
- **CTF platforms**
  - CyLab Security Academy (formerly picoCTF) is free, designed for middle schoolers to adults, and includes a Reverse Engineering domain among 500+ challenges — [CyLab](https://cylabacademy.org/); [picoctf.org](https://picoctf.org/)
  - crackmes.one is "dedicated to educational reverse engineering challenges (crackmes) only"; "all crackmes … have been made to be cracked." It **prohibits** game cracks, trainers, cheats or mods, commercial software cracking or DRM circumvention (keygens or patches for paid software), and real malware. It advises a VM, a snapshot, and disabling network access, and says antivirus detections on crackmes are normal because of anti-debugging and packing — [crackmes.one FAQ](https://crackmes.one/faq)
- **17 U.S.C. §1201(f) (interoperability):** a person who has lawfully obtained the right to use a program may circumvent to identify and analyze elements needed for an independently created program to interoperate, provided it isn't infringement. Sharing is allowed only to enable interoperability and only if it doesn't violate other law — [17 U.S.C. §1201 (Cornell LII)](https://www.law.cornell.edu/uscode/text/17/1201)
- **§1201(j) (security testing):** this covers good-faith testing of a computer, system or network **with the authorization of the owner or operator**. It must not infringe or violate other law, including the CFAA (18 U.S.C. §1030). Factors considered include whether the results were used solely to promote security or were shared with the developer — [17 U.S.C. §1201 (Cornell LII)](https://www.law.cornell.edu/uscode/text/17/1201)
- **37 CFR §201.40 exemptions (last amended 89 FR 85446, Oct 28, 2024):**
  - (b)(18) good-faith security research: circumvention on a lawfully acquired device, or on a system with the owner's authorization, "solely for the purpose of good-faith security research", in an environment designed to avoid harm. "Not a safe harbor from, or defense to, liability under other applicable laws" (CFAA named).
  - (b)(15) consumer device diagnosis, maintenance and repair (game console repair is limited to the optical drive, with protections restored afterward).
  - (b)(19) video games whose external authentication server support has ended (by publisher statement or ≥6 months discontinued), for personal local gameplay or institutional preservation.
  - [37 CFR 201.40 (Cornell LII)](https://www.law.cornell.edu/cfr/text/37/201.40)
- The 2024 (ninth triennial) proceeding concluded with a Final Rule dated Oct 28, 2024. Exemptions last for "the ensuing three-year period" — [Copyright Office 1201 (2024)](https://www.copyright.gov/1201/2024/)
- The tenth triennial (2027) cycle is underway. Renewal petitions dated 06/2026 seek renewal of the security-research exemption (Blaze and Bellovin; MEMA; Software Freedom Conservancy) and the abandoned-video-games exemption — [Blaze & Bellovin renewal petition](https://www.copyright.gov/1201/2027/petitions/renewal/Renewal-Pet-Security-Research-Blaze-and-Bellovin.pdf); [Abandoned Video Games renewal petition](https://www.copyright.gov/1201/2027/petitions/renewal/Renewal-Pet-Abandoned-Video-Games-Ken-Austin.pdf)
- **Game EULAs and ToS:**
  - Rockstar's GTA V license says users agree not to "reverse engineer, decompile, disassemble … or otherwise modify the Software." Rockstar later said its focus is protecting GTA Online and that it had not banned anyone for single-player mods. Players reported bans, so the accounts conflict — [Guru3D](https://www.guru3d.com/story/rockstar-changes-eula-can-ban-players-for-modding-gta-v/?print); [Wccftech](https://wccftech.com/rockstar-eula-bans-players-modding-gta/amp/)
  - Paradox's Hearts of Iron IV license also bans reverse engineering, except where "applicable law" permits — [Steam Community thread](https://steamcommunity.com/app/394360/discussions/0/1474222595309103914)
  - Anti-cheat and cheat bans are usually a separate ToS clause, covering trainers, bots, scripts and extraction tools, and are the clause most often enforced — [Steam Community / forum excerpts via search](https://steamcommunity.com/discussions/forum/1/5241649843384076041)

### Inferences
- **Recommended safe RE progression for this learner:**
  1. CyLab Academy beginner RE challenges in the browser, built for high schoolers.
  2. The Ghidra Beginner class.
  3. crackmes.one difficulty-1 crackmes in a VM with a snapshot and network off.
  4. Only then, run REA MCP against those same practice binaries inside the VM. Restrict the MCP server's filesystem access to the challenge folder, following the MCP guide's least-privilege warning.
  5. For "modding things they own": prefer games with official mod support or SDKs, offline single-player only, never multiplayer or anti-cheat-protected titles, and never distribute cracks or DRM bypasses.
- Owning a copy is not the same as permission. §1201(f) and (j) and the §201.40 exemptions are narrow. CFAA and contract (EULA) liability remain separate, and the security-research exemption explicitly says it is not a safe harbor. For a minor, the practical rule is to analyze only things built for practice, or devices or software you own, offline, without circumventing online services, and to ask a parent or guardian if unsure. This is general information, not legal advice.
- The exemptions are US-specific. If the learner is outside the US, different laws apply (e.g. the EU Software Directive's decompilation rules). This was not researched.

### Gaps
- I did not verify whether CyLab Academy or crackmes.one set minimum ages or require parental consent; the crackmes FAQ does not mention age.
- I did not retrieve major platforms' current ToS text (Valve Steam Subscriber Agreement, Riot, Epic) on reverse engineering and modding. Enforcement claims rest on news coverage of Rockstar and on forum excerpts.
- I found no authoritative teen-specific guidance on RE legality, and nothing on non-US jurisdictions.
- I could not verify what the "REA MCP tool" does or how safe it is, e.g. whether it executes binaries or only does static analysis, or makes network calls.
