# How AI Models Are Made and How AI Apps Use Outside Knowledge (beginner-level, as of 13 Oct 2026)

*Source notes: items marked (fetched) were read in this session. Items marked (primary, not re-fetched) cite the original paper or official page for well-established, abstract-level claims that I did not re-open during this session. Third-party or affiliate sources are flagged. The learner already knows that models predict tokens, that weights are frozen after training, and what abliteration does at a high level.*

---

## Q1. The training pipeline: pretraining, SFT, RLHF and alternatives (DPO, RLAIF, Constitutional AI), reasoning RL (RLVR, R1, o1), knowledge cutoffs, and "thinking tokens"

### Takeaway
A modern chat model is built in stages:
1. **Pretraining.** A "base model" reads trillions of tokens and learns to predict the next one.
2. **Supervised fine-tuning (SFT, also called instruction tuning).** It trains on example conversations so it behaves like an assistant.
3. **Preference tuning.** RLHF, or cheaper variants such as DPO, RLAIF and Constitutional AI, teach it which answers people (or an AI judge following written principles) prefer.
4. **Reasoning RL (since late 2024).** Reinforcement learning on problems whose answers a program can check (RLVR) teaches the model to "think" in long chains of tokens before it answers.

Knowledge cutoffs exist because the training-data snapshot is frozen before training starts, and the weights stay fixed afterward.

### Cited Findings
**Pretraining (scale and objective)**
- DeepSeek-V4 (April 2026) was pretrained on "more than 32T diverse and high-quality tokens." (fetched) — [arXiv 2606.19348, DeepSeek-V4 report](https://arxiv.org/abs/2606.19348)
- DeepSeek-V3 (Dec 2024) was pretrained on 14.8 trillion tokens. It has 671B total parameters, of which 37B are activated per token (Mixture-of-Experts). Full training took 2.788M H800 GPU-hours. (primary, not re-fetched) — [arXiv 2412.19437, DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437)
- Meta's Llama 3 was "pretrained on over 15T tokens." (primary, not re-fetched) — [Meta AI blog, Introducing Meta Llama 3 (Apr 2024)](https://ai.meta.com/blog/meta-llama-3/)
- The Chinchilla scaling result: for compute-optimal training, model size and training tokens should be scaled up equally. Chinchilla (70B) used the same compute as Gopher (280B) but about 4x more data, and outperformed it. (primary, not re-fetched) — [Hoffmann et al. 2022, arXiv 2203.15556](https://arxiv.org/abs/2203.15556)
- A pretrained-only model is not automatically helpful. InstructGPT's authors write that "making language models bigger does not inherently make them better at following a user's intent." (primary, not re-fetched) — [Ouyang et al. 2022, InstructGPT, arXiv 2203.02155](https://arxiv.org/abs/2203.02155)

**SFT and RLHF (the InstructGPT recipe)**
- InstructGPT used three steps (primary, not re-fetched) — [arXiv 2203.02155](https://arxiv.org/abs/2203.02155):
  1. Human labelers wrote demonstration answers, and GPT-3 was supervised-fine-tuned on them.
  2. Labelers ranked several model outputs, and a reward model was trained to predict those rankings.
  3. The model was optimized against the reward model with reinforcement learning (PPO).
- Human raters preferred outputs from the 1.3B-parameter InstructGPT over the 175B GPT-3, despite the 100x size difference. (primary, not re-fetched) — [arXiv 2203.02155](https://arxiv.org/abs/2203.02155)

**Alternatives to classic RLHF**
- **DPO (Direct Preference Optimization, 2023)** skips the separate reward model and the RL loop. It trains directly on pairs of preferred and rejected answers with "a simple classification loss," and the authors call it "stable, performant, and computationally lightweight." (primary, not re-fetched) — [Rafailov et al., arXiv 2305.18290](https://arxiv.org/abs/2305.18290)
- In practice, a DPO dataset row looks like `{"prompt": ..., "chosen": ..., "rejected": ...}`. Hugging Face TRL's DPOTrainer expects this "preference" type. (fetched) — [Hugging Face TRL docs, Dataset formats](https://huggingface.co/docs/trl/dataset_formats)
- **Constitutional AI (Anthropic, Dec 2022).** "The only human oversight is provided through a list of rules or principles" (the constitution). (primary, not re-fetched) — [Bai et al., arXiv 2212.08073](https://arxiv.org/abs/2212.08073)
  - In the supervised phase, the model critiques and revises its own outputs.
  - In the RL phase, an AI model judges which of two responses is better. The authors call this "RL from AI Feedback (RLAIF)."
- **RLAIF works about as well as RLHF.** A Google study found RLAIF achieves performance comparable to RLHF on summarization and on helpful and harmless dialogue. (primary, not re-fetched) — [Lee et al. 2023, arXiv 2309.00267](https://arxiv.org/abs/2309.00267)

**Reasoning RL (RLVR, o1, DeepSeek-R1)**
- OpenAI o1 (Sept 2024): a "large-scale reinforcement learning algorithm teaches the model how to think productively using its chain of thought." Performance "consistently improves with more reinforcement learning (train-time compute) and with more time spent thinking (test-time compute)." (primary, not re-fetched) — [OpenAI, Learning to reason with LLMs](https://openai.com/index/learning-to-reason-with-llms/)
- The term **RLVR (Reinforcement Learning with Verifiable Rewards)** was introduced in AI2's Tülu 3 paper (Nov 2024). The reward comes from checking whether an answer is correct (for example, a math answer that matches), not from a learned human-preference model. (primary, not re-fetched) — [Lambert et al., Tülu 3, arXiv 2411.15124](https://arxiv.org/abs/2411.15124)
- **DeepSeek-R1-Zero** was trained from DeepSeek-V3-Base with GRPO and **no SFT at all**. (fetched) — [DeepSeek-R1 paper v1 HTML](https://arxiv.org/html/2501.12948v1)
  - It used only rule-based rewards: an "accuracy" reward for a correct answer and a "format" reward for putting reasoning between think tags.
  - Its AIME 2024 pass@1 score rose from **15.6% to 71.0%** during RL, and reached 86.7% with majority voting over 64 samples.
  - An intermediate checkpoint showed an "aha moment," writing "Wait, wait. Wait. That's an aha moment I can flag here" and re-evaluating its approach.
  - Drawbacks: poor readability and mixing of languages.
- **The full DeepSeek-R1 pipeline** (fetched) — [same](https://arxiv.org/html/2501.12948v1):
  1. A "cold start" SFT on thousands of long chain-of-thought examples.
  2. Reasoning RL, with a language-consistency reward added.
  3. Rejection sampling to build about 600k reasoning plus about 200k non-reasoning examples (about 800k total), followed by SFT of V3-Base for 2 epochs on them.
  4. A final RL stage covering all scenarios: rule-based rewards for math, code and logic, and reward models for general chat.
- DeepSeek tried process reward models (PRMs) and Monte Carlo Tree Search, and reported both as unsuccessful. PRMs led to reward hacking and added overhead. MCTS faced a token search space far larger than chess. (fetched) — [same](https://arxiv.org/html/2501.12948v1)
- **GRPO (Group Relative Policy Optimization)** comes from DeepSeekMath (Feb 2024). It is a variant of PPO that "enhances mathematical reasoning abilities while concurrently optimizing the memory usage of PPO." Instead of a separate critic model, it scores each answer against the average of a group of sampled answers to the same question. (primary, not re-fetched) — [Shao et al., arXiv 2402.03300](https://arxiv.org/abs/2402.03300)
- The R1 paper was later peer-reviewed and published in *Nature* 645, 633–638 (2025). arXiv v2 is dated 4 Jan 2026. (fetched) — [arXiv 2501.12948 abstract page](https://arxiv.org/abs/2501.12948)

**Thinking tokens**
- OpenAI's reasoning models generate reasoning tokens that "are not visible via the API" but still take up context-window space and "are billed as output tokens." (primary, not re-fetched) — [OpenAI API docs, Reasoning models](https://platform.openai.com/docs/guides/reasoning)
- DeepSeek-V4 (April 2026) offers three modes. (fetched) — [Hugging Face blog on DeepSeek-V4](https://huggingface.co/blog/deepseekv4)
  - Non-think: fast, no chain of thought.
  - Think High: explicit reasoning in think blocks.
  - Think Max: maximum reasoning effort, needing a context window of at least 384K tokens.
- The DeepSeek API exposes "dual modes (Thinking / Non-Thinking)." (fetched) — [DeepSeek API news, V4 Preview](https://api-docs.deepseek.com/news/news260424)
- Anthropic (Oct 2026) describes Claude's reasoning as "protected." Users normally see summarized reasoning, and distillers have tried to extract "unsummarized" reasoning. (fetched) — [Anthropic, Strengthening our defenses against distillation attacks (12 Oct 2026)](https://www.anthropic.com/research/distillation-defenses)
  - With Claude Fable 5.1 and Opus 5.5, Anthropic introduced "preserved thinking."
  - With Sonnet 5.5, reasoning transcripts are "accessible only to the organization whose request produced the transcript."

**Knowledge cutoff**
- Anthropic's Help Center lists a training-data cutoff for each model and warns that models "may not be aware of events or information that occurred after their respective cutoff dates." (seen via search summary, not fully fetched) — [Claude Help Center, How do I use Claude's models](https://support.claude.com/en/articles/8114494-how-do-i-use-claude-s-models)
  - Examples from that summary: Claude Fable 5.1 (June 2026), Opus 5 (May 2026), Sonnet 5 (January 2026).
- Anthropic distinguishes a "reliable knowledge cutoff" (the date through which knowledge is most extensive and reliable) from a broader "training data cutoff." (from a third-party mirror of Anthropic's docs, which is stale) — [mirror of Claude models overview](https://claude.yourdocs.dev/docs/about-claude/models/overview)
- A third-party fact-check says the boundary is fuzzy because pretraining corpora mix documents from many dates, and that a model's own answer to "what is your cutoff?" is unreliable. (third-party) — [metehan.ai, LLM knowledge cutoff dates](https://metehan.ai/articles/llm-knowledge-cutoff-dates/)
- Concrete example: OpenAI's open-weight gpt-oss chat template writes "Knowledge cutoff: 2024-06" and "Current date: ..." into the system prompt. The model is told the date because it cannot know it. (fetched) — [Hugging Face TRL docs, Harmony section](https://huggingface.co/docs/trl/dataset_formats)

### Inferences
- **Beginner framing:**
  - Pretraining is like reading the whole library. SFT is like an internship where you copy model answers. RLHF/DPO is a coach saying "this answer is better than that one." RLVR is practicing math problems with an answer key.
  - The learner already knows "weights are fixed after training." The cutoff follows directly: the library was photocopied on a certain date, so nothing after that date is in the model.
- **Why "reliable" cutoffs lag the "training data" cutoff:** less text has been written online about the last few months before the scrape, so recent events are thinly covered. This is consistent with Anthropic giving two separate dates.
- **The models still only predict tokens.** "Thinking tokens" are ordinary tokens the model generates for itself before the answer. RL rewards the final answer, and longer, self-checking chains emerge because they earn more reward. R1-Zero's "aha moment" is the clearest public example.
- **Constitutional AI vs. RLAIF:** Constitutional AI is a specific kind of RLAIF in which the AI judge follows a written list of principles. DPO is about *how* you learn from preferences. RLHF vs. RLAIF is about *who* supplies the preferences (humans or an AI).

### Gaps
- I did not fetch the current official Anthropic models-overview page. Exact per-model cutoff dates come from a search summary of the Help Center and a stale mirror, so verify them before publishing.
- Frontier labs (OpenAI, Anthropic, Google) have not publicly documented their exact 2026 post-training pipelines. The stages above come from InstructGPT, Constitutional AI, Tülu 3 and DeepSeek-R1, which are the best public references.
- I found no authoritative public token count for frontier closed models trained in 2025–2026. Only open-model reports (DeepSeek, Meta) give numbers.

---

## Q2. How hobbyists actually fine-tune: LoRA/QLoRA, tools, dataset formats, hardware (RX 580 vs. cloud)

### Takeaway
Hobbyists almost never retrain a whole model. They:
1. Freeze it, usually loaded in 4-bit to save memory.
2. Train small add-on "LoRA adapter" matrices on a few hundred to a few thousand chat-formatted examples, using Unsloth, Hugging Face TRL or Axolotl.

A 7–8B model needs roughly 5–6 GB of VRAM with QLoRA on a supported GPU. The **RX 580 is not supported** by current ROCm or Unsloth, so the realistic path for this learner is a free cloud GPU such as Google Colab.

### Cited Findings
**LoRA and QLoRA (the core technique)**
- **LoRA (2021)** freezes the pretrained weights and adds small trainable "low-rank" matrices to each layer. (primary, not re-fetched) — [Hu et al., arXiv 2106.09685](https://arxiv.org/abs/2106.09685)
  - Compared with fully fine-tuning GPT-3 175B, it cuts trainable parameters "by 10,000 times" and GPU memory "by 3 times."
  - It adds no extra inference latency.
- **QLoRA (2023)** loads the base model in 4-bit and trains LoRA adapters on top. (primary, not re-fetched) — [Dettmers et al., arXiv 2305.14314](https://arxiv.org/abs/2305.14314)
  - It made it possible to fine-tune a 65B model on a single 48 GB GPU while preserving full 16-bit fine-tuning performance.
  - It introduced NF4 (4-bit NormalFloat), double quantization and paged optimizers.
  - Its Guanaco model reached 99.3% of ChatGPT's level on the Vicuna benchmark after 24 hours on one GPU.

**Unsloth (the most beginner-friendly option)**
- Minimum VRAM figures from Unsloth's docs, with the warning that these are "the absolute minimum" (fetched via search summary) — [Unsloth Requirements](https://unsloth.ai/docs/get-started/fine-tuning-for-beginners/unsloth-requirements)

  | Model size | QLoRA (4-bit) | LoRA (16-bit) |
  |---|---|---|
  | 7B | ~5 GB | ~19 GB |
  | 8B | ~6 GB | ~22 GB |
  | 70B | ~41 GB | ~164 GB |

- On NVIDIA, Unsloth needs CUDA capability 7.0 or higher (V100, **T4**, RTX 20/30/40, A100, H100, etc.). Its advice for out-of-memory errors is to set the batch size to 1–3. (fetched via search summary) — [same](https://unsloth.ai/docs/get-started/fine-tuning-for-beginners/unsloth-requirements)
- **AMD support table** (fetched) — [Unsloth docs, AMD](https://unsloth.ai/docs/basics/amd)
  - Full support: RDNA 4 (RX 9000), RDNA 3.5 (Ryzen AI 300 / Strix Halo), RDNA 3 (RX 7000), RDNA 2 (RX 6000), and Instinct MI100/MI200/MI300/MI350 (Linux only).
  - RDNA 1 (RX 5000) gets **Vulkan inference only**.
  - Polaris and the RX 500 series are not listed. The page says older GPUs "do not have the required hardware support."
- Unsloth's AMD page also makes these claims (vendor claims) (fetched) — [same](https://unsloth.ai/docs/basics/amd):
  - Up to 70% less VRAM for training and up to 80% less for RL.
  - In one benchmark, Llama-3.1-8B LoRA SFT peaked at 18.3 GB, versus 24.3 GB for TRL with FlashAttention 2.
  - Gemma 4 can be trained in 8 GB of VRAM, and Qwen3.5 in 3 GB.
  - "Unsloth Studio" is a browser interface for local fine-tuning.

**The RX 580 specifically**
- Official ROCm support for Polaris 10 chips (including the RX 580) was dropped years ago. A 2021 Debian AI mailing-list post noted this when PyTorch 1.8 got ROCm support. (search summary) — [debian-ai list, Mar 2021](https://lists.debian.org/debian-ai/2021/03/msg00005.html)
- Unofficial community Docker images do run PyTorch on ROCm 6.1.2 on an RX 580, marked "Tested." They warn that Linux kernels 6.12/6.13 crashed with segfaults. (community, search summary) — [GitHub woodrex83/ROCm-For-RX580](https://github.com/woodrex83/ROCm-For-RX580)
- A Level1Techs thread describes hacky ports of newer ROCm to gfx803 (Polaris). People report training a small chess-bot model and getting image generation to "more or less" work. (community, unverified) — [Level1Techs forum, ROCm on Polaris](https://forum.level1techs.com/t/rocm-10-0-on-polaris/255050)

**Dataset formats (what a hobbyist actually prepares)**
- Hugging Face TRL defines a "conversational" format: a list of `{"role": "user"|"assistant", "content": ...}` messages under `"messages"`. (fetched) — [Hugging Face TRL docs, Dataset formats](https://huggingface.co/docs/trl/dataset_formats)
  - Example row: `{"messages":[{"role":"user","content":"What color is the sky?"},{"role":"assistant","content":"It is blue."}]}`
  - The "standard" format uses plain text, e.g. `{"text": "..."}`.
- Which trainer expects which data type (fetched) — [same](https://huggingface.co/docs/trl/dataset_formats):
  - SFTTrainer: language-modeling or prompt-completion data.
  - DPOTrainer: preference data (prompt, chosen, rejected).
  - GRPOTrainer: prompt-only data, because the reward function scores generated answers.
  - KTOTrainer: unpaired preference data (a completion plus a true/false label).
  - Tool-calling SFT data needs an extra `tools` column.
- Axolotl is a config-driven fine-tuning tool: you describe the base model, dataset and LoRA settings in a YAML file. (primary repo, not re-fetched) — [GitHub axolotl-ai-cloud/axolotl](https://github.com/axolotl-ai-cloud/axolotl)

### Inferences
- **A typical 2026 hobbyist workflow:**
  1. Open a free Unsloth Colab notebook.
  2. Pick a small instruct model (e.g. 1–8B Qwen, Llama or Gemma).
  3. Upload a JSONL file of a few hundred to a few thousand `messages` conversations.
  4. Load the model in 4-bit and attach LoRA adapters.
  5. Train for 1–3 epochs.
  6. Save the small adapter, or merge and export to GGUF for local apps such as Ollama or LM Studio.
- **Mapping to the learner's knowledge:** fine-tuning *does* change weights. With LoRA the original weights stay frozen, and a small "patch" of new weights is learned and added on top. That is why adapters are only megabytes, not gigabytes.
- **RX 580 verdict:**
  - Training on it is not realistic: it is not on Unsloth's support list, it lacks official ROCm/PyTorch support, and it has 8 GB of VRAM on an old architecture.
  - The community Docker route exists but is fragile, and not a good first project for a non-coder.
  - The RX 580 *may* run inference of small quantized models through llama.cpp's Vulkan backend ([llama.cpp repo](https://github.com/ggml-org/llama.cpp)). That is my inference; I did not verify RX 580 Vulkan performance this session.
- **Colab:** a free Colab T4 (16 GB) is above Unsloth's stated QLoRA minimums for 7–8B models (5–6 GB). Free-tier session limits apply.

### Gaps
- I did not verify current (Oct 2026) Google Colab free-tier GPU availability, time limits, or Kaggle's free GPU quota. These change often.
- I did not verify whether Unsloth's free notebook catalog currently includes specific 2026 models (Gemma 4, Qwen3.5), beyond the AMD-page claims.
- I found no source showing Unsloth itself running on an RX 580. Community reports cover generic PyTorch/ROCm only.

---

## Q3. Distillation: what it is, DeepSeek-R1's distilled Qwen/Llama models, what DeepSeek did that was notable (GRPO, R1-Zero, costs and disputes), and later developments to 2026

### Takeaway
**Distillation** means training a smaller "student" model on the outputs of a stronger "teacher." DeepSeek released six small "R1-Distill" models (Jan 2025) made by fine-tuning Qwen2.5 and Llama 3 models on about 800k answers written by R1. They found this beat running RL directly on the small models.

DeepSeek was notable for three things:
- Showing that pure RL (R1-Zero, using the memory-efficient GRPO algorithm) can teach reasoning without human-written reasoning examples.
- Publishing low cost figures: $5.6M for the V3 base-model training run, and $294K for the R1 RL run. Both are disputed as incomplete.
- Releasing open weights.

Since then:
- **Feb 2026:** Anthropic accused DeepSeek, Moonshot and MiniMax of illicitly distilling Claude.
- **April 2026:** DeepSeek released V4, with 1M-token context.
- **Oct 2026:** Anthropic reported that new defenses cut extractable reasoning 10–100x.

### Cited Findings
**What distillation is**
- The classic paper: Hinton, Vinyals and Dean (2015) showed you can "compress the knowledge in an ensemble into a single model" by training it on the larger model's soft output probabilities. (primary, not re-fetched) — [arXiv 1503.02531](https://arxiv.org/abs/1503.02531)
- Anthropic's plain-language definition: "training a less capable model on the outputs of a stronger one." (fetched) — [Anthropic, Detecting and preventing distillation attacks (23 Feb 2026)](https://www.anthropic.com/research/detecting-and-preventing-distillation-attacks)
  - It calls distillation "a widely used and legitimate training method."
  - "Frontier AI labs routinely distill their own models to create smaller, cheaper versions."

**DeepSeek-R1's distilled models (Jan 2025)**
- Six dense models: 1.5B, 7B, 8B, 14B, 32B and 70B. (fetched) — [DeepSeek-R1 paper v1](https://arxiv.org/html/2501.12948v1)
  - Bases: Qwen2.5-Math-1.5B, Qwen2.5-Math-7B, Llama-3.1-8B, Qwen2.5-14B, Qwen2.5-32B, Llama-3.3-70B-Instruct.
  - All were trained only with SFT on about 800k R1-generated samples. No RL was applied to them.
- Results (fetched) — [same](https://arxiv.org/html/2501.12948v1):
  - R1-Distill-Qwen-7B scored 55.5% on AIME 2024, above QwQ-32B-Preview's 50.0%.
  - R1-Distill-Qwen-32B scored 72.6% on AIME 2024 vs. o1-mini's 63.6%, 94.3% on MATH-500 vs. 90.0%, and 57.2% on LiveCodeBench vs. 53.8%.
- **Key experiment: distillation vs. RL on a small model.** (fetched) — [same](https://arxiv.org/html/2501.12948v1)
  - DeepSeek ran over 10K RL steps directly on Qwen-32B ("DeepSeek-R1-Zero-Qwen-32B") and got only QwQ-32B-Preview-level results.
  - The distilled 32B was much better: AIME 72.6 vs. 47.0, GPQA Diamond 62.1 vs. 55.0, LiveCodeBench 57.2 vs. 40.2.
  - Conclusion: distilling from a stronger model beats large-scale RL on small models.
- The teacher's size: R1 is built on DeepSeek-V3-Base, with 671B total and 37B active parameters per token. (primary, not re-fetched) — [arXiv 2412.19437](https://arxiv.org/abs/2412.19437)

**What else was notable**
- R1-Zero learned reasoning with pure RL (GRPO plus rule-based rewards) and no SFT. AIME rose from 15.6% to 71.0%, and the "aha moment" appeared (see Q1). (fetched) — [DeepSeek-R1 paper v1](https://arxiv.org/html/2501.12948v1)
- **Cost claims and disputes**
  - **V3 run, $5.576M:** 2.788M H800 GPU-hours at an assumed $2/GPU-hour. The paper says this covers only the official training run, excluding "prior research and ablation experiments." (primary, not re-fetched) — [DeepSeek-V3 report, arXiv 2412.19437](https://arxiv.org/abs/2412.19437)
  - **R1 run, $294,000:** stated in DeepSeek's peer-reviewed *Nature* paper (17 Sept 2025). (search summary of Reuters-sourced coverage) — [CTV News / Reuters](https://www.ctvnews.ca/business/article/chinas-deepseek-says-its-hit-ai-model-cost-just-us294000-to-train/); [TechSpot](https://www.techspot.com/news/109542-rare-disclosure-deepseek-claims-r1-model-training-cost.html)
    - It covered 512 Nvidia H800 chips for 80 hours. A100s were used for preparatory experiments.
    - It excludes the roughly $6M base model.
  - **Disputes (same search summary):**
    - SemiAnalysis reported DeepSeek had access to roughly 50,000 Nvidia Hopper GPUs.
    - US officials told Reuters in June 2025 that DeepSeek had access to restricted H100s.
- **Distillation accusations against DeepSeek**
  - The Financial Times reported in Jan 2025, citing OpenAI insiders, that OpenAI saw evidence DeepSeek had distilled its models. (fetched) — [CNBC, 24 Feb 2026](https://www.cnbc.com/2026/02/24/anthropic-openai-china-firms-distillation-deepseek.html)
  - In Feb 2026, OpenAI sent an open letter to US legislators describing "adversarial distillation." (fetched) — [same](https://www.cnbc.com/2026/02/24/anthropic-openai-china-firms-distillation-deepseek.html)

**Later developments, 2025–2026**
- **Anthropic, 23 Feb 2026:** "industrial-scale campaigns" by DeepSeek, Moonshot and MiniMax produced over 16 million exchanges with Claude through about 24,000 fraudulent accounts. (fetched) — [Anthropic](https://www.anthropic.com/research/detecting-and-preventing-distillation-attacks)
  - **DeepSeek:** over 150,000 exchanges. It asked Claude "to imagine and articulate the internal reasoning behind a completed response and write it out step by step," which generates chain-of-thought training data. It also asked for "censorship-safe alternatives" to politically sensitive questions.
  - **Moonshot:** over 3.4M exchanges.
  - **MiniMax:** over 13M exchanges. It pivoted within 24 hours to target a newly released Claude model.
  - Proxy "hydra cluster" networks ran up to 20,000+ accounts at once.
- Analysts quoted by CNBC say the line between legitimate and illicit distillation is "often blurry." The controversy is about fraudulent access and terms-of-service violations, not the technique itself. (fetched) — [CNBC](https://www.cnbc.com/2026/02/24/anthropic-openai-china-firms-distillation-deepseek.html)
- **DeepSeek-V4 Preview, 24 Apr 2026** (fetched) — [DeepSeek news](https://www.deepseek.com/en/news/v4-preview/); [arXiv 2606.19348](https://arxiv.org/abs/2606.19348); [CNBC 24 Apr 2026](https://www.cnbc.com/2026/04/24/deepseek-v4-llm-preview-open-source-ai-competition-china.html)
  - Open weights in two sizes, both with 1M-token context:
    - V4-Pro: 1.6T total / 49B active parameters.
    - V4-Flash: 284B total / 13B active parameters.
  - New hybrid compressed-sparse attention, "manifold-constrained hyper-connections," and the Muon optimizer.
  - At 1M context it needs 27% of the inference FLOPs and 10% of the KV cache of V3.2.
  - Huawei confirmed its Ascend chips can run V4. DeepSeek said V4 is optimized for agent tools such as Claude Code.
  - The old `deepseek-chat` and `deepseek-reasoner` API names were retired after 24 July 2026.
- **Anthropic, 12 Oct 2026:** new defenses (fetched) — [Anthropic, Strengthening our defenses against distillation attacks](https://www.anthropic.com/research/distillation-defenses)
  - Preserved thinking, a two-stage classifier with a false-positive rate under 0.1%, and account bans.
  - Early evidence: the defenses cut distillers' harvested data "by around 90 to 99%," and extracted reasoning tokens fell 10–100x.
  - Tens of thousands of accounts were banned.
  - The post refers to an earlier September 2026 report.

### Inferences
- **Beginner framing:** distillation is the "student copies the teacher's worked solutions" method.
  - DeepSeek used its *own* big model (R1) as the teacher for Qwen and Llama students. That is legitimate, and so the "R1-Distill-Qwen-7B" name means "a Qwen 7B that studied 800k R1 solutions." It is not R1 shrunk down.
  - The 2026 controversy is about using a *competitor's* model as the teacher without permission.
- **Why distillation beats RL on small models:** RL can only reinforce good behaviors the model sometimes stumbles on, and small models rarely produce good long reasoning on their own. Distillation hands them complete examples. This is my interpretation of the R1 result, consistent with the paper's conclusion.
- **Why cost numbers mislead:** "$294K" and "$5.6M" measure single final training runs. They leave out failed experiments, staff, data, and buying the hardware. That is why both the "cheap DeepSeek" narrative and the disputes are partly right.

### Gaps
- I did not retrieve Anthropic's September 2026 distillation report referenced in the Oct 2026 post.
- I did not verify release details for the intermediate DeepSeek releases (V3.1, V3.2, V3.2-Exp/Speciale). V3.2 is only confirmed as V4's predecessor through the V4 abstract.
- I found no confirmation of a model called "DeepSeek-R2."
- I found no DeepSeek public response to the Feb 2026 accusations in this session.
- The SemiAnalysis GPU estimate comes from secondary coverage, not the original SemiAnalysis report.

---

## Q4. Abliteration: how it works (refusal direction, Arditi et al. 2024) and its measured side effects

### Takeaway
Arditi et al. (2024) found that in many open chat models, "refusing" corresponds largely to a single direction in the model's internal activation space. Abliteration:
1. Estimates that direction (average activations on harmful prompts minus average activations on harmless ones).
2. Edits the weights so the model can no longer write along it.

Measured side effects are model- and tool-dependent:
- General knowledge (MMLU) usually barely moves.
- Math reasoning can drop sharply in some cases (up to about −19 points on GSM8K).
- A July 2026 study found abliterated models become measurably more optimistic and hedge less, even on tasks with no refusals at all.

### Cited Findings
- **Arditi et al. (2024)** (primary, not re-fetched) — [Arditi et al., "Refusal in Language Models Is Mediated by a Single Direction," arXiv 2406.11717](https://arxiv.org/abs/2406.11717)
  - Across 13 popular open-source chat models up to 72B parameters, refusal "is mediated by a one-dimensional subspace."
  - Erasing that direction stops the model refusing harmful instructions. Adding it makes the model refuse even harmless ones.
  - The authors propose a white-box jailbreak (a weight edit) that "surgically disables refusal with minimal effect on other capabilities."
  - They also show that adversarial-suffix jailbreaks work by suppressing this direction.
- **The name "abliteration"** was popularized by Maxime Labonne's Hugging Face blog (2024). (primary, not re-fetched; details from memory of the post) — [Labonne, "Uncensor any LLM with abliteration"](https://huggingface.co/blog/mlabonne/abliteration)
  - The post computes the refusal direction from harmful vs. harmless prompt activations, then orthogonalizes the weights.
  - It reported a performance drop after abliteration and "healed" it with an extra DPO fine-tune (NeuralDaredevil-8B-abliterated).
- **Tool comparison (Dec 2025)** across four tools (Heretic, DECCP, ErisForge, FailSpy) and 16 models of 7–14B parameters (fetched) — [Young, arXiv 2512.13655](https://arxiv.org/abs/2512.13655); [GitHub repo](https://github.com/ricyoung/abliteration-comparison)
  - Average change on MMLU, GSM8K and HellaSwag:

    | Tool | MMLU | GSM8K | HellaSwag |
    |---|---|---|---|
    | ErisForge | −0.12 pp | −0.28 pp | −0.08 pp |
    | DECCP | −0.61 pp | −0.13 pp | −0.25 pp |
    | Heretic | −0.78 pp | −7.81 pp | −0.56 pp |

  - Math reasoning (GSM8K) was most sensitive, ranging from +1.51 pp to −18.81 pp. The worst case was Yi-1.5-9B with Heretic, a 26.5% relative drop.
  - KL divergence from the original model ranged from 0.043 to 1.646.
  - DPO-only-aligned Zephyr-7B was easiest to abliterate (98% attack success).
- **Cybersecurity-domain study (2026)** on 24 open models (fetched) — [arXiv 2607.02714, "Not All Refusals Are Equal"](https://arxiv.org/pdf/2607.02714)
  - MMLU was preserved everywhere (maximum degradation 0.028).
  - Refusal is spread across many layers, especially in huge MoE models.
  - Effects differ by harm domain. Misinformation refusals dropped most (−22.3 pp mean).
  - Some models resisted the standard method (Mistral-Large, GLM 4.7). Others "collapsed" across all domains (Phi-4-mini, Gemma-27B, Llama Maverick).
  - Safety-training method predicted susceptibility best: DPO-trained models were most susceptible (median about 30 pp drop), GRPO-trained ones least (5–8 pp).
  - A domain-targeted abliteration of Kimi K2 (1T parameters) cut cybersecurity refusals from 100% to 7% while keeping refusals for explicit content.
- **"Abliteration Is Not a Scalpel" (July 2026)** compared official vs. huihui-ai abliterated versions of Gemma-4-26B-A4B and Qwen3-30B-A3B on 21,600 stock up/down predictions. The task triggers no refusals, so any difference is a pure side effect. (fetched; preprint) — [arXiv 2607.17427](https://arxiv.org/html/2607.17427)
  - Abliterated models were more optimistic (+12.2 pp and +7.4 pp more "up" bets).
  - They wrote longer self-justifications and used fewer uncertainty words.
  - Expressed confidence shifted in *opposite* directions in the two families.
  - Instruction-following was preserved.
  - The authors also found a stale chat template in a community abliterated checkpoint that silently mangled prompts.
- **Safety-pretraining study (2025)** (fetched; preprint) — [arXiv 2510.02768](https://arxiv.org/html/2510.02768v1)
  - Abliteration mainly turned refusals of harmful prompts into compliance.
  - Safety spread through pretraining data (rephrasing plus metatags plus refusals) was much more robust.
  - Qwen3 showed no loss under abliteration in their setup.
  - Models could not reliably tell whether their own outputs were refusals after abliteration.

### Inferences
- **Beginner framing:** abliteration is not training. No new data is learned. It is a geometry edit that deletes one "arrow" in the model's internal space, the one meaning "I should refuse."
- **Why side effects appear:** that arrow is not perfectly separate from other behaviors, such as caution, hedging and careful step-by-step math. Removing it nudges those too, and by different amounts in different models.
- **Trend:** newer safety training (GRPO-based safety, safety spread through pretraining data, large MoE models) seems harder to abliterate cleanly. This fits the "single direction" story being most true for older or DPO-only aligned models.

### Gaps
- The 2025–2026 side-effect studies are arXiv preprints, not peer-reviewed. Sample sizes are small (for example, benchmark comparisons on only 3 models in the Dec 2025 study).
- I did not re-fetch Arditi et al. or Labonne's blog this session. Exact quotes and benchmark tables should be checked.

---

## Q5. Diffusion image/video models (denoising, latent diffusion, text conditioning) and how hosted services like Higgsfield wrap them

### Takeaway
Most image and video generators are **diffusion** models:
- **Training:** add random noise to images step by step, and train a network to predict and remove that noise.
- **Generating:** start from pure static and denoise many times, all pixels at once rather than one pixel at a time.
- **Latent diffusion** (Stable Diffusion) does this in a compressed "latent" image space for speed.
- **Text steers each step** through a text encoder (such as CLIP) and cross-attention, strengthened by "classifier-free guidance."

The learner's "pixel-by-pixel" guess describes older autoregressive image models, and partly GPT-4o-style native image generation, which predicts image *tokens* in sequence.

Higgsfield is mainly an aggregator and creative interface on top of third-party models (Kling, Veo, Sora, Seedance, Wan, Nano Banana), adding routing, presets, character consistency and upscaling.

### Cited Findings
- **DDPM (2020)** established modern diffusion: a model learns to reverse a gradual noising process. (primary, not re-fetched) — [Ho et al., arXiv 2006.11239](https://arxiv.org/abs/2006.11239)
- **Latent diffusion** applies diffusion "in the latent space of powerful pretrained autoencoders," cutting compute. Its cross-attention layers turn diffusion models into generators "for general conditioning inputs such as text or bounding boxes." This is the basis of Stable Diffusion. (primary, not re-fetched) — [Rombach et al., arXiv 2112.10752](https://arxiv.org/abs/2112.10752)
- **CLIP** learned matching text and image representations from 400 million (image, text) pairs. Its text encoder is widely used for conditioning. (primary, not re-fetched) — [Radford et al., arXiv 2103.00020](https://arxiv.org/abs/2103.00020)
- **Classifier-free guidance** trains the model with and without the text prompt, then combines the two predictions. This trades diversity for prompt-faithfulness (the "guidance scale" users see). (primary, not re-fetched) — [Ho & Salimans, arXiv 2207.12598](https://arxiv.org/abs/2207.12598)
- Newer models such as Stable Diffusion 3 use "rectified flow" transformers, a close cousin of diffusion. (primary, not re-fetched) — [Esser et al., arXiv 2403.03206](https://arxiv.org/abs/2403.03206)
- **Video:** OpenAI described Sora (2024) as "a diffusion model" and "a diffusion transformer" that denoises "spacetime patches." (primary, not re-fetched) — [OpenAI, Video generation models as world simulators](https://openai.com/index/video-generation-models-as-world-simulators/)
- **Autoregressive image generation (the learner's guess)**
  - OpenAI's Image GPT (2020) was trained to "auto-regressively predict pixels." (primary, not re-fetched) — [OpenAI, Image GPT](https://openai.com/index/image-gpt/)
  - GPT-4o's native image generation (March 2025) is described by OpenAI as autoregressive, unlike diffusion-based DALL·E. Independent analysts note the full architecture is unpublished, and a diffusion-style decoder may be involved. (search summary) — [InfoQ, GPT-4o images](https://www.infoq.com/news/2025/04/gpt-4o-images); [heise analysis](https://heise.de/-10343544)
  - Reported advantages: better text rendering, and placing up to about 20 objects correctly.
- **Higgsfield** (mostly third-party and affiliate-style sources) (search summary) — [Higgsfield Help Center, Which AI model should I use](https://higgsfield.ai/creator-hub/help-center/ai-models/which-ai-model-should-i-use); [No Film School](https://nofilmschool.com/higgsfield-all-in-one-ai-platform); [pasqualepillitteri.it guide (2026)](https://pasqualepillitteri.it/en/news/677/higgsfield-ai-video-guide); [framia review](https://framia.converge.ai/blog/higgsfield-review)
  - It gives one-account access to third-party models such as Sora 2, Kling 2.6/3.0, Google Veo 3.1, Wan 2.6, Seedance and MiniMax Hailuo, alongside its own "Soul" image models.
  - It can route a request to an engine based on chosen parameters.
  - "Soul ID" injects a character's visual signature into requests for consistency.
  - It applies proprietary upscaling to 4K.
  - "Cinema Studio" / "DOP" add camera-control presets.
  - Its help center says Seedance suits realistic motion and Kling suits longer or multi-shot clips, and that the latest model version is used automatically.
- **Source conflict:** one review calls "Nano Banana" a Higgsfield proprietary model. In fact, Nano Banana is Google's Gemini 2.5 Flash Image, so Higgsfield hosts it rather than owning it. (primary, not re-fetched) — [Google Developers Blog, Introducing Gemini 2.5 Flash Image (aka nano-banana)](https://developers.googleblog.com/en/introducing-gemini-2-5-flash-image/)

### Inferences
- **Beginner framing:** a diffusion model is like a sculptor who sees a block of TV static and is asked, "What noise should I remove to get closer to 'a cat on a skateboard'?" It asks this 20–50 times. The text prompt is consulted at every step.
- **What a wrapper like Higgsfield adds:** a user interface, prompt rewriting and templates, automatic model selection, character reference images, post-processing, and credit billing on top of API calls to model makers. The heavy model mostly runs elsewhere. This is the same "wrapper" pattern as many chat apps.

### Gaps
- Higgsfield's own model architectures and its exact current model list (Oct 2026) were not verified on higgsfield.ai directly. Its catalog changes quickly.
- I did not verify GPT-4o image generation's architecture beyond OpenAI's high-level description. OpenAI has not published it.

---

## Q6. Embeddings and RAG (vector search, chunking; RAG vs. fine-tuning vs. long context), "context engineering," and how app memory works

### Takeaway
- An **embedding** turns text into a list of numbers (a vector) so that similar meanings sit close together.
- **RAG** (retrieval-augmented generation):
  1. Split documents into chunks.
  2. Embed the chunks and store them in a vector database.
  3. At question time, find the closest chunks (often combined with keyword search) and paste them into the prompt.

  This matches the learner's guess, "search for related notes."
- **RAG vs. fine-tuning vs. long context:** RAG adds facts without changing weights. Fine-tuning changes behavior and style. Long context just pastes everything in, which works for small knowledge bases (Anthropic says under about 200k tokens) but suffers "context rot."
- **"Context engineering"** was popularized in June 2025 by Tobi Lütke and Andrej Karpathy (with Cognition's Walden Yan using it slightly earlier). Anthropic formalized it in a 29 Sept 2025 post.
- **App "memory"** is context engineering in practice. Claude saves topic memories and searches past chats with visible RAG tool calls. ChatGPT combines saved memories with background reference to chat history.

### Cited Findings
**Embeddings**
- Word2vec (2013) showed that word vectors capture meaning arithmetically: vector("King") − vector("Man") + vector("Woman") lands closest to vector("Queen"). (primary, not re-fetched) — [Mikolov et al., arXiv 1301.3781](https://arxiv.org/abs/1301.3781)
- A recommended visual explainer for beginners. (not re-fetched) — [Jay Alammar, The Illustrated Word2vec](https://jalammar.github.io/illustrated-word2vec/)

**RAG basics**
- The original RAG paper combined "parametric memory" (the model's weights) with "non-parametric memory" (a dense vector index of Wikipedia searched by a neural retriever). (primary, not re-fetched) — [Lewis et al. 2020, arXiv 2005.11401](https://arxiv.org/abs/2005.11401)
- **Anthropic's Contextual Retrieval post (19 Sept 2024)** (fetched) — [Anthropic, Introducing Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval)
  - **Standard pipeline:**
    1. Split the corpus into chunks of "a few hundred tokens."
    2. Turn each chunk into a vector with an embedding model and store it in a vector database.
    3. Retrieve the most similar chunks for a query.
    4. Often also run BM25 keyword search to catch exact terms like error codes, and merge the two result lists with rank fusion.
  - **The chunking problem:** a chunk such as "The company's revenue grew by 3% over the previous quarter" loses which company and which quarter.
  - **The fix:** prepend a 50–100-token, AI-written context to each chunk before indexing.
  - **Retrieval failures** (relevant chunk not in the top 20), from a 5.7% baseline:

    | Method | Failure rate | Reduction |
    |---|---|---|
    | Contextual embeddings | 3.7% | −35% |
    | Plus contextual BM25 | 2.9% | −49% |
    | Plus reranking | 1.9% | −67% |

  - **When to skip RAG:** if the knowledge base is under about 200,000 tokens (about 500 pages), put it all in the prompt. Prompt caching cuts latency more than 2x and cost up to 90%.

**Limits of long context**
- Models often do best when key information is at the start or end of a long input, and "significantly degrade" when it is in the middle. (primary, not re-fetched) — [Liu et al., "Lost in the Middle," arXiv 2307.03172](https://arxiv.org/abs/2307.03172)
- Anthropic calls this "context rot." As tokens grow, recall declines, so context is "a finite resource with diminishing marginal returns" with an "attention budget." (fetched) — [Anthropic, Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- Context windows keep growing and getting cheaper. DeepSeek-V4 supports 1M tokens using 10% of V3.2's KV cache at that length. (fetched) — [arXiv 2606.19348](https://arxiv.org/abs/2606.19348)

**Context engineering: origin and definition**
- **Origin of the term** (secondary sources; exact origin disputed) (search summary) — [Simon Willison, 27 June 2025](https://feeds.simonwillison.net/2025/Jun/27/context-engineering/); [jiangren.com.au explainer](https://jiangren.com.au/en/learn/context-engineering/intro); [aiwiki context engineering](https://www.aiwiki.ai/wiki/context_engineering/raw)
  - Walden Yan (Cognition) used the term on 12 June 2025 in "Don't Build Multi-Agents."
  - Shopify CEO Tobi Lütke posted on about 18–19 June 2025 that he preferred "context engineering" over "prompt engineering."
  - Andrej Karpathy endorsed it on about 25 June 2025, describing "the delicate art and science of filling the context window with just the right information for the next step."
  - Philipp Schmid wrote a detailed treatment on 30 June 2025.
- **Anthropic's 29 Sept 2025 post** (fetched) — [Anthropic Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
  - It defines context engineering as "the set of strategies for curating and maintaining the optimal set of tokens" during inference. That covers system prompts, tools, external data and message history, not just the prompt wording.
  - It calls this the "natural progression" of prompt engineering.
  - The goal is the "smallest possible set of high-signal tokens."
  - **Just-in-time retrieval:** keep file paths or queries, and load data with tools when needed.
  - **Compaction:** summarize a conversation near the limit and restart from the summary.
  - **Structured note-taking:** e.g. a NOTES.md or to-do file kept outside the context window.
  - **Sub-agents:** they work in clean contexts and return condensed summaries.

**How app memory works**
- **Claude** (fetched) — [Claude Help Center, How does Claude's memory work](https://support.claude.com/en/articles/11817273-how-does-claude-s-memory-work)
  - It "saves memory as a set of individual topics as you chat," either on its own or when asked.
  - Users can view, edit and delete memories in Settings > Memory.
  - Sensitive topics such as health or politics are excluded unless the user opts in. Government ID numbers are never saved.
  - Past-chat search uses "Retrieval-Augmented Generation (RAG)" and appears as a visible tool call. It searches chats outside projects, or within one project.
  - Each project has its own memory space and summary.
  - Incognito chats are excluded.
  - A legacy mode used a synthesized summary refreshed every 24 hours.
  - Memory is on by default for Free, Pro and Max users. Team/Enterprise owners must enable it.
- **ChatGPT**
  - It has "saved memories" (discrete facts the user can view and delete) and, since 10 April 2025, can "reference all of your past chats" in the background. (search summary; partly third-party) — [OpenAI Community announcement, 10 Apr 2025](https://community.openai.com/t/chatgpt-can-now-reference-all-past-conversations-april-10-2025/1229453/77); [AlternativeTo news](https://alternativeto.net/news/2025/4/chatgpt-s-memory-can-now-reference-all-your-past-chats-for-more-personalized-interactions)
  - A third-party analysis claims ChatGPT keeps about the last 40 conversations as summarized context. Unverified, not confirmed by OpenAI. — [memx.app blog](https://memx.app/blog/chatgpt-reference-chat-history-vs-saved-memories/)

### Inferences
- **Beginner framing:**
  - An embedding is a "GPS coordinate for meaning."
  - RAG is an open-book exam: the model's weights are what it memorized, and retrieval hands it the right textbook pages.
  - Fine-tuning is more like changing the student's habits or style. It is a poor way to add frequently changing facts, because retraining is needed every time the facts change.
  - Long context is bringing the whole textbook into the exam. It works for small books, but the student skims the middle (context rot / lost-in-the-middle).
- **Memory ties back to "weights are fixed":** app memory never changes the model's weights. It is saved text that the app (or the model, through a search tool) puts back into the context window. It is RAG plus context engineering applied to your own chat history.
- **Context engineering explains why "the same model" behaves differently** in different apps (Claude.ai vs. Claude Code vs. a third-party app). Each app assembles different system prompts, tools, retrieved documents and memories around the same weights.

### Gaps
- OpenAI has not published the internal mechanism of ChatGPT's "reference chat history" (summaries vs. embeddings vs. a search tool). Third-party descriptions are unverified.
- The exact first use of "context engineering" is disputed. I could not fetch the original Lütke or Karpathy posts on X, so the dates and quote rely on secondary sources.
- I did not gather benchmark data comparing RAG vs. fine-tuning for factual recall. The RAG-vs-fine-tuning contrast above is standard practitioner guidance, not a cited study.
