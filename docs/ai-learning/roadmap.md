# Roadmap: 8 stages

Rendered version: https://claude.ai/artifact/94k46DiAcKp3dy6rYL71av. Each stage runs the loop in `loop.md`. A stage ends when its concepts in `knowledge-map.md` are Verified and its build milestone is done.

| Stage | Topic | Status | Build milestone |
|---|---|---|---|
| **1** | Foundations: requests, layers, tools, MCP, builder basics, memory, how models are made, local models | **Current.** 28 of 57 concepts Verified. Clear the re-test queue in `knowledge-map.md`. | An environment briefing for the Odysseus model, and your own tokens/sec for a 9B and a 30B-A3B model |
| 2 | Evals: baselines, luck, graders, tracing, promptfoo (`evals/promptfoo`), Langfuse | Next | Paperclip's 6-task exam; compare two setups |
| 3 | Agent system design: context engineering, orchestrator and workers, routing (Jev), tools, memory, hooks | Later | Test whether Paperclip's Reviewer raises the exam score |
| 4 | Research agents: search vs. open, cite opened pages, last30days, yt-dlp, GitHub MCP read-only | Later | A cited research agent graded on 10 of your questions |
| 5 | Reverse engineering with agents: decompilers, Mono vs. IL2CPP, static vs. dynamic analysis, REA, Universal Modder, the legal lines | Later | Run REA on your own Unity build and grade it against the real source |
| 6 | Image and video pipelines: diffusion, model weak spots, style control, Higgsfield and fal, platform rules | Later | Free ambient pipeline, with A/B picks going to the learning agent |
| 7 | Changing the model: LoRA/QLoRA on Colab, DPO from your A/B picks, embeddings | Later | A LoRA trained on your preferences vs. the base model |
| 8 | Capstone: AI Experiment Lab | Later | Lab v1: local vs. cloud vs. fine-tune, with real numbers |

Running through every stage: safety, light code reading, and keeping current (five questions for every new repo).
