# Knowledge map

The source of truth for what the owner knows. Merged on 2026-10-14 from the local session's testing (Oct 13–14, only fair-question rounds count) and the Yo chat's scoreboard (`ai-from-the-ground-up-progress.md`, Oct 14). The newest evidence wins.

**States** (from `loop.md`): Unknown, then Gauged, then **Misconception** or **Gap**, then **Taught**, **Verified**, and finally **Applied**. *Half* means half credit: re-test it.
**Mastered** = Verified (right twice in a row on differently worded questions). **Applied** = used on a real project.

| # | Concept | State | Evidence | Next |
|---|---|---|---|---|
| **Foundations** |||||
| 1 | Tokens, next-token prediction | Verified | Local round 12 | none |
| 2 | Temperature | Verified | Local round 12 | none |
| 3 | Weights are fixed, chatting changes context only | Verified | Yo scoreboard, local W2 | none |
| 4 | Statelessness: the app resends the whole package every message | Taught | Local W3 "not sure"; cycle 1 gauge L1 ✗; re-test #1 0 of 4 (still pictures the model or cache holding the chat); re-test #2: 2 of 3 right in a row (app vs. model ✓, package ✓) | **One more re-test (deleted-message case, plain LM Studio)** |
| 5 | Context overflow: the app trims or summarizes, nothing is "compressed into memory" | Taught | Misconception in local round 10. Yo: "it starts shortening the context and keeps key points" (close) | **Re-test** |
| 6 | KV cache and prompt caching are shortcuts, not memory | Taught | Misconception in local round 14 ("model memory") | **Re-test** |
| 7 | Chat templates (`<\|im_end\|>` leaking) | Taught | Misconception in local round 4 ("not enough VRAM") | **Re-test** |
| 8 | Prefill (reading) vs. decode (writing) speed | Verified | Yo scoreboard | none |
| 9 | Hallucination, and grounding with tools or sources | Verified | Local round 10 Q4, Yo | none |
| **Layers and apps** |||||
| 10 | Four layers: model, runner, app, provider | Verified | Local W2 (LM Studio runs, Odysseus orchestrates), Yo key ideas | none |
| 11 | OpenRouter is a gateway to providers | Verified | Local round 14 | none |
| 12 | Editor assistants (Zed, VS Code) vs. agents (Claude Code, Codex) | Gap | Local A2: "they be doing the same thing?" | Gauge |
| **Tools and agents** |||||
| 13 | Tool call: the model asks, the app runs real code | Verified | Local W3, Yo key ideas | none |
| 14 | What the model receives: tool descriptions as text, costing context | Taught | Local round 10 Q2 unknown | **Re-test** |
| 15 | Questions vs. requests (the "can you search?" behavior) | Taught | Lesson 4 in the local session | **Re-test** |
| 16 | API, then browser code, then mouse clicks (computer use) | Taught | Yo key ideas, lesson chapter 6 | **Re-test** |
| 17 | Agents as loops, errors compounding | Verified | Local round 11, Yo | none |
| 18 | Subagents get a separate context | Verified | Local round 13 | none |
| 19 | How agents learn their environment (system prompt, project files, looking around) | Taught | Lesson chapter 6 | **Re-test** |
| **MCP, skills, plugins, security** |||||
| 20 | MCP server = a standard box of tools; skill = instructions loaded on demand | Verified | Yo scoreboard | none |
| 21 | Connector vs. plugin | Gap | Local round 2 Q1 | Gauge |
| 22 | Tool overload (fewer tools is better) | Verified | Their own lesson, local rounds | none |
| 23 | Prompt injection: settings guarantee, prompts only steer | Verified | Yo scoreboard (local round 12 was a miss) | none |
| 24 | Lethal trifecta | Half | Yo | **Re-test** |
| 25 | Tool poisoning and MCP supply-chain risk | Gap | Local round 6 Q1 | Gauge |
| **Builder basics** |||||
| 26 | JSON | Verified | Yo scoreboard | none |
| 27 | git vs. GitHub | Verified | Yo scoreboard | none |
| 28 | npm, npx, package.json | Misconception | Local W2: "package.json is a compressed project" | Teach |
| 29 | Pinning versions | Half | Yo | **Re-test** |
| 30 | `.env` and `.gitignore` don't encrypt | Half | Misconception in local round 6, half credit in Yo | **Re-test** |
| 31 | API keys, frontend/backend, localhost vs. deploy, ports, terminal | Verified | Local rounds 7 and 13 | none |
| **Memory, RAG, context** |||||
| 32 | App memory = saved text pasted back in | Verified | Local W2 | none |
| 33 | RAG; prompt, then RAG, then fine-tune, by cost | Verified | Local W3, Yo | none |
| 34 | Embeddings as points in a space of meaning | Taught | Yo key ideas ("infinite 4D plane" intuition) | **Re-test** |
| 35 | Context engineering | Gap | Local round 17 | Gauge |
| **How models are made** |||||
| 36 | Pretraining, instruction tuning, preference tuning | Verified | Yo scoreboard | none |
| 37 | How RLHF works (the model is nudged, it doesn't "choose") | Half | Yo | **Re-test** |
| 38 | Distillation (incl. DeepSeek R1-Distill) | Verified | Yo scoreboard | none |
| 39 | Knowledge cutoff | Verified | Yo scoreboard | none |
| 40 | Fine-tuning and LoRA (extra weights, not context) | Half | Yo: thought LoRA "gives context" | **Re-test** |
| 41 | Abliteration removes refusals, no intent added | Verified | Local round 12 | none |
| 42 | Diffusion image models | Half | Misconception in local round 14 (pixel by pixel), half credit in Yo | **Re-test** |
| **Local models** |||||
| 43 | Quantization (Q4 vs. Q8 sizes and fit) | Verified | Yo scoreboard | none |
| 44 | VRAM capacity vs. compute | Misconception | Local round 11: "too weak" and "doesn't fit" seen as the same | Teach |
| 45 | MoE / A3B (total size sets memory, active size sets speed) | Verified | Yo scoreboard | none |
| 46 | GGUF vs. safetensors | Half | Yo | **Re-test** |
| 47 | Open weights and licenses | Half | Yo, plus local round 17 Q3 on licenses | **Re-test** |
| 48 | RX 580 on Vulkan, and how to optimize big local models | Taught | Local chat (Oct 14) | **Re-test** |
| **Evals (Stage 2)** |||||
| 49 | Repeat runs and the luck band | Verified | Yo scoreboard, their own Paperclip plan | none |
| 50 | Pairwise A/B preference judging | Verified | Their own learning-agent design | none |
| 51 | Grader types: hidden tests, AI judge, pairwise | Gap | n/a | Gauge |
| 52 | Tracing (seeing every package and tool call) | Gap | n/a | Gauge |
| **Reverse engineering (Stage 5)** |||||
| 53 | Decompiling vs. embedding | Verified | Yo scoreboard | none |
| 54 | Full rewrite needs a decompiler, a pass-through mod doesn't | Verified | Yo scoreboard | none |
| 55 | Static vs. dynamic analysis | Gap | n/a | Gauge |
| 56 | Unity Mono vs. IL2CPP | Gap | n/a | Gauge |
| **Media (Stage 6)** |||||
| 57 | What image and video models do and don't understand | Gap | Their own open question in Yo | Gauge |

## Summary (2026-10-14)
- **Verified:** 28 of 57
- **Re-test (Taught or Half):** 18
- **Gap:** 9
- **Misconception still open:** 2 (npm/package.json, VRAM vs. compute)
- Stage 1 is almost done. Clear the re-test queue first, then start Stage 2.
