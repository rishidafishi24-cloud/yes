# AI from the ground up: progress notes

> Merged into `knowledge-map.md` on 2026-10-14. That file is now the source of truth.

Saved 2026-10-14. Built from a question-and-teach loop: ask short questions, teach only what was missed, re-ask a different way, and stop when a concept is right twice in a row.

Learner setup: Ryzen 5 2600, 16 GB RAM, RX 580 8 GB (about 7.2 GB usable VRAM). Apps: LM Studio, Odysseus, Zed, Claude Code, Codex.

## Scoreboard

**Known**
- Git saves history on your PC; GitHub hosts copies of repos.
- Prompt injection: the settings (tools off, approvals on) are the guarantee; the prompt only steers.
- JSON is strict: no trailing comma, double quotes only.
- A full rewrite of a game needs a decompiler; a pass-through mod does not.
- Distillation: a small model trained on a big model's answers (not a shrunken copy of its weights).
- Pretraining teaches facts and language; instruction tuning teaches the habit of answering as an assistant; preference tuning (RLHF) shapes tone, helpfulness, refusals.
- Knowledge cutoff: fix with a search tool or by pasting the information in.
- A3B: 30B decides memory, about 3B active decides speed.
- MCP server = standard box of tools; skill = instructions loaded on demand.
- Quantization: Q4 about 0.5 byte per weight, so a 9B model is about 5 GB and fits 8 GB; Q8 is about 9 GB and does not.
- Prefill (reading) is slow on the RX 580, decode (writing) is fine.
- Agents compound errors: 0.95 to the 20th is about 36%.
- Decompiling vs. embedding are different things.
- Fine-tuning order to try: system prompt, RAG, then fine-tuning.
- Evals: one run is not enough; repeat runs to find the luck band.
- Weights do not change when you chat; context does.
- Hallucination fix: a tool that checks or verifies output, plus sources.

**Half credit or needs a retry**
- RLHF (the model is nudged, it does not "choose").
- Open weights (weights are a file you run locally; the license decides what you may do).
- Seen / inferred / unknown tags (the point is trust: do not build on guesses as facts).
- Lethal trifecta (private data + untrusted content + a way to send out; remove one).
- Diffusion (start from noise, remove it step by step, guided by the text embedding).
- Secrets: `.env` is plain text, not encrypted; `.gitignore` only stops uploading.
- LoRA (cheap fine-tuning: a small add-on of weights, not context).
- Pinning (lock to an exact version instead of `@latest`).
- GGUF (single file LM Studio runs) vs. safetensors (original format).

## Key ideas worth keeping

- Every message resends the whole package: system prompt, tool descriptions, history, new message. The model remembers nothing.
- Four layers: model, runner, app, provider. Find the layer before blaming the model.
- A tool call: the model writes a request, the app runs it and sends the result back as text.
- Use the highest rung that works: API or command, then browser code, then mouse clicks.
- Embeddings are points in a high-dimensional space; similar meanings are near each other. RAG and diffusion both use them.
- Context vs. training on your data: context is cheap and instant, training is costly and changes the model. Facts that change belong in context.

## Project decisions (context)

- Content division: Shorts Creator first, then Ambient, Music, and Animation creators, with a Content Reviewer. Pipeline in `companies/networked-ai-company/skills/content-pipeline/SKILL.md`. Owner picks and reasons go to the Learning agent, not Study.
- Shorts toolkit in `tools/content-shorts/` (reframe, style, loudness, check, batch runner, captions, music mixer, source finder). Tested on synthetic video only.
- Reverse-engineering research report: REA 6.4.0, Universal Modder, the AI clones, and Jev (TypeSafe AI's decision model, not the JEB decompiler). Many numbers there are unverified.
- Wanted: an AI experiment lab to compare models, prompts, and tools with repeated-run evals. Check existing tools (promptfoo is already in the Paperclip repo under `evals/promptfoo`) before building.

## Why the assistant sometimes has no information

- A model's knowledge stops at its training cutoff (the assistant's is June 2026). Anything newer has to come from a tool.
- In the cloud session used here, many sites (YouTube, news sites, npm) were blocked by the network policy, so some research could only use search summaries.
- Fix: a search-enabled setup that fetches raw pages, transcripts, and repos, and labels what it could and could not open. Being researched next.

## Open questions

- Which existing experiment-lab tool to use instead of building one.
- What a reliable research agent needs (search, fetch, transcripts, repos, notes) and whether it belongs inside the lab app.
- Where Obsidian fits.
