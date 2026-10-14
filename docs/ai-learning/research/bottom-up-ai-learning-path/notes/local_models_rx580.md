# Running local LLMs on an AMD RX 580 8 GB with LM Studio, and the concepts behind it (as of October 2026)

Target machine: Ryzen 5 2600 (6 cores / 12 threads, AVX2, **no integrated graphics**), 16 GB DDR4, AMD RX 580 8 GB (Polaris / GCN4, 256 GB/s), Windows, LM Studio, plus Odysseus.

How to read the evidence labels used below:
- **[Official]**: vendor or project documentation, model cards, license text.
- **[Community benchmark]**: the llama.cpp Vulkan scoreboard thread. These are user-submitted `llama-bench` runs with a fixed model and method, so they are reproducible, but they come mostly from Linux and are not vendor-verified.
- **[Anecdotal]**: single user reports and bug reports.
- **[Blog / low]**: third-party roundups and SEO-style guides, often unsourced.
- **[Modeled]**: estimates computed by a website, not measured.
- Anything under "Inferences" is my own reasoning or arithmetic, not a sourced fact.

---

## 1. RX 580 support in LM Studio: Vulkan vs. ROCm, realistic speeds, and "am I cooked without NVIDIA?"

### Takeaway
On Windows the RX 580 runs local models through llama.cpp's **Vulkan** backend, which LM Studio ships as its "Vulkan llama.cpp" runtime. ROCm/HIP on Windows does not support Polaris; it doesn't even support RDNA2. Community benchmarks put the RX 580 at about **39 tokens/s generation and about 258 tokens/s prompt processing** on the standard 7B Q4_0 test. That is roughly half an RTX 3060's generation speed and about one seventh of its prompt-processing speed. So the student isn't "cooked." For models that fit in 8 GB, the card is perfectly usable. It is just slow at reading long prompts.

### Cited Findings
- **[Community benchmark]** The llama.cpp Vulkan performance thread uses Llama 2 7B at Q4_0 run with `llama-bench` as its standard test. pp512 means processing a 512-token prompt and tg128 means generating 128 tokens, both reported in tokens/s. — [llama.cpp discussion #10879](https://github.com/ggml-org/llama.cpp/discussions/10879)
- **[Community benchmark]** Scoreboard entries for Polaris/GCN cards (Vulkan, tokens/s) — [llama.cpp discussion #10879](https://github.com/ggml-org/llama.cpp/discussions/10879):
  - **RX 580: pp512 258.03, tg128 39.32**. No flash-attention (FA) entry. Driver not stated.
  - RX 570: pp512 226.11 / tg128 37.44. With FA: 229.23 / 40.18.
  - RX 480: 248.66 / 34.71. With FA: 194.52 / 37.23.
  - RX 470: 207.16 / 40.11. With FA: 211.25 / 43.35. Uses the RADV (Linux Mesa) driver, and its numbers rose across reruns from Dec 2024 to Jul 2026.
  - Comparison cards: RX 6600 pp512 758.50 / tg128 50.57 (FA: 804.64 / 53.17). RTX 3060 pp512 1815.70 / tg128 75.94 (FA: 2012.88 / 80.59).
- **[Anecdotal]** A community project reports that an RX 580 8 GB ran Gemma-3n-E4B-it in 44.74 s on Vulkan versus 188.47 s on CPU, a 4.21x speedup. That is total wall-clock time rather than tokens/s, and the project says results depend on quantization, drivers, OS and load. — [VulkanIlm (Talnz007) mirror](https://gh.nn.ci/Talnz007/VulkanIlm)
- **[Blog / low]** A llama.cpp Vulkan build guide says older cards such as the GTX 1060 6 GB or RX 580 work through Vulkan, while CUDA support for those old cards has been dropped and ROCm doesn't support them. — [bestllmfor.com Vulkan guide](https://bestllmfor.com/guide/compiler-llama-cpp-vulkan/)
- **[Official]** AMD's HIP SDK for Windows system requirements (7.2.0 docs, marked as legacy) list support only for RDNA3, RDNA4 and some Radeon PRO cards (gfx1100/1101/1102/1200/1201). RDNA2 cards (RX 6600–6950 XT, gfx1030–1032) are explicitly marked **unsupported**, as is the Radeon PRO VII (gfx906). Polaris (gfx803, RX 470/480/570/580) does not appear at all. — [AMD HIP SDK Windows system requirements](https://rocm.docs.amd.com/projects/install-on-windows/en/latest/reference/system-requirements.html)
- **[Anecdotal]** An LM Studio bug report confirms that LM Studio on Windows offers a "Vulkan llama.cpp" runtime alongside a "CPU llama.cpp" runtime. In that report, Vulkan runtime 2.4.0 under LM Studio 0.4.4 produced repeated special tokens and crashes on an RX 6700 XT, while the CPU runtime worked with the same file. Another user on Strix Halo fixed crashes by switching to the ROCm runtime, which is not an option for Polaris. — [LM Studio bug tracker #1565](https://github.com/lmstudio-ai/lmstudio-bug-tracker/issues/1565)
- **[Blog / low]** A 2026 AMD hosting guide recommends starting with Vulkan in LM Studio on desktop AMD GPUs. It notes that Vulkan drivers cover more graphics hardware than ROCm libraries, so Vulkan is the likely path for older Radeon cards. The article is in Italian and paraphrased here. — [glukhov.org ROCm vs Vulkan guide (IT)](https://www.glukhov.org/it/llm-hosting/comparisons/amd-rocm-vs-vulkan-llm-hosting/)
- **[Official]** LM Studio requires a CPU with AVX2 on x64 Windows, recommends at least 16 GB RAM and at least 4 GB of dedicated VRAM. The Ryzen 5 2600 meets the AVX2 requirement. — [LM Studio system requirements](https://lmstudio.ai/docs/app/system-requirements)
- **[Modeled, unreliable]** willitrunai.com estimates about 14 tok/s for Qwen3 8B Q4_K_M on an RX 580 and says it "slightly exceeds" 8 GB at about 8.8 GB. These figures are modeled, not measured. Its sister pages give implausible numbers, such as about 8 tok/s for a 0.6B model, so don't use this site as evidence. — [willitrunai Qwen3 8B on RX 580](https://willitrunai.com/ja/can-run/qwen-3-8b-on-rx-580-8gb)

### Inferences
- **Realistic speeds for 3B to 8B at Q4.** These are my estimates, scaled from the measured RX 580 7B Q4_0 result (tg 39 t/s on a ~3.56 GiB file; the file size is background knowledge) by file size, since generation speed scales roughly inversely with bytes read per token:
  - ~3–4B Q4_K_M (~2–2.5 GB file): roughly 55–75 t/s generation.
  - ~7–8B Q4_K_M (4.58 GiB for Llama 3.1 8B, per the quantize README): roughly 28–33 t/s generation.
  - ~9B Q4_K_M (e.g., Qwen3.5-9B): roughly mid-20s t/s, if it fully fits.
  - Prompt processing should be about 200–260 t/s at 7–8B, so a 4,000-token prompt (system prompt plus tool definitions plus chat history, which agent apps like Odysseus produce) takes **about 15–20 s before the first output token**. This is the main practical pain point.
  - Windows drivers may come in lower than the mostly Linux/RADV scoreboard numbers. No Windows-specific RX 580 llama-bench result was found.
- **"Cooked without CUDA?"** No. Generation speed is the part users feel in chat, and there the RX 580 is about 52% of an RTX 3060 (39 vs 76 t/s). The gap is mostly in prompt processing (about 7x). CUDA's real advantage is the wider software ecosystem (vLLM, training, PyTorch), not llama.cpp chat. ROCm wouldn't rescue this card on Windows anyway, since AMD's own list excludes even RDNA2.
- **No integrated graphics matters.** The Ryzen 5 2600 has no iGPU, so Windows, the browser and the Odysseus UI draw on the RX 580. Some VRAM (likely a few hundred MB to about 1 GB; not measured) is used before any model loads. Plan for about 7–7.5 GB usable rather than 8.
- Because Vulkan runtime regressions have been reported in LM Studio (#1565), the student should know how to switch or roll back runtime versions in LM Studio's runtime settings, and how to test with the CPU runtime as a baseline.

### Gaps
- I found no measured RX 580 numbers on **Windows** in LM Studio specifically, and no RX 580 result for modern quants (Q4_K_M) or modern architectures (Qwen3.5 hybrid attention, Gemma 4). The student could run `llama-bench` or watch LM Studio's tok/s readout to produce one.
- I could not confirm whether the Vulkan runtime currently shipped in LM Studio (0.4.x) has any Polaris-specific issues. The #1565 regression concerned RDNA2.
- Official LM Studio documentation listing which AMD GPUs the Vulkan runtime supports was not found. The system-requirements page doesn't mention Vulkan, CUDA or ROCm.

---

## 2. Recommended models for 8 GB VRAM (late 2026), what fits or partially offloads, and abliterated trade-offs

### Takeaway
In 2026 the consensus small-GPU picks are **Qwen3.5-9B** (Apache 2.0, strong tool calling, BFCL-V4 66.1) and **Gemma 4 E4B** (Apache 2.0, native tool use). Both fit fully in 8 GB at Q4. Larger **MoE** models, namely gpt-oss-20b (21B/3.6B active), Gemma 4 26B A4B (25.2B/3.8B active) and Qwen3-30B-A3B (30.5B/3.3B active), do **not** fit in 8 GB VRAM, but can run with partial or expert offload into the 16 GB of system RAM, more slowly. Abliteration measurably lowers benchmark quality. No source quantifies its effect on tool calling.

### Cited Findings
- **[Official] Qwen3.5-9B**: about 9B parameters (Safetensors shows ~10B because of a vision encoder). It is a dense model whose 32 layers interleave Gated DeltaNet (linear attention) blocks with Gated Attention blocks. It has 262,144-token native context, takes image and video input, uses the **Apache-2.0** license, has thinking on by default (`<think>`), and turns thinking off via `enable_thinking: False`. The card says the Qwen3 `/think` and `/nothink` soft switches are not officially supported. Its citation metadata gives February 2026. Tool/agent benchmarks: **BFCL-V4 66.1** (Qwen3.5-4B 50.3; Qwen3-30B-A3B-Thinking-2507 42.4), TAU2-Bench 79.1. — [Qwen/Qwen3.5-9B model card](https://huggingface.co/Qwen/Qwen3.5-9B)
- **[Official] Gemma 4 family** (technical report published Jul 2, 2026), licensed **Apache 2.0**, which is a change from earlier Gemma terms — [google/gemma-4-E4B-it model card](https://huggingface.co/google/gemma-4-E4B-it):
  - E2B: 2.3B effective (5.1B with embeddings), 128K context, text/image/audio.
  - E4B: 4.5B effective (8B with embeddings), 128K context, text/image/audio.
  - 12B Unified: 11.95B dense, 256K context.
  - 26B A4B (MoE): 25.2B total, **3.8B active**, 256K context, text and image.
  - 31B dense: 30.7B, 256K context.
  - "E" means *effective* parameters. Per-Layer Embeddings are large lookup tables, so the effective count is much smaller than the total.
  - Native structured tool use is supported. Thinking is toggled with a `<|think|>` token in the system prompt.
- **[Official] gpt-oss-20b**: 21B total, **3.6B active** (MoE). MoE weights are post-trained in MXFP4. It "runs within 16GB of memory," uses **Apache 2.0**, and has function calling, web browsing, Python tool use, Structured Outputs, and reasoning effort low/medium/high set in the system prompt. It **must be used with the "harmony" response format**. Collection dated Aug 2025. — [openai/gpt-oss-20b model card](https://huggingface.co/openai/gpt-oss-20b)
- **[Official] Qwen3-30B-A3B**: 30.5B total, **3.3B activated**, 48 layers, **128 experts with 8 active per token**, GQA with 32 query heads and 4 KV heads. Native context is 32,768 tokens, extendable to 131,072 with YaRN. License **Apache-2.0**. Has thinking and non-thinking modes. — [Qwen/Qwen3-30B-A3B model card](https://huggingface.co/Qwen/Qwen3-30B-A3B)
- **[Blog / low]** Multiple 2026 roundups name **Qwen3.5-9B at Q4_K_M** as the top 8 GB pick, with weights cited around 5.6 GB (about 6.6 GB as an Ollama package), and **Gemma 4 E4B** (about 4.6 GB at Q4_0) as the runner-up with more context headroom. One guide that tested on an RTX 3070 calls Qwen3.5-9B the most reliable 8 GB model for agent workflows. Another says Gemma 4 is less consistent on complex multi-tool chains. The guides advise keeping context at 8K–16K on 8 GB unless tested. Other names mentioned: Ministral 3 8B and Granite 4.2 8B for function calling. — [vdf.ai best local LLM by VRAM](https://vdf.ai/blog/best-local-llm-by-vram/); [mayhemcode 4/6/8 GB guide (Jun 2026)](https://www.mayhemcode.com/2026/06/best-local-llms-for-4gb-6gb-and-8gb.html); [atomic.chat 8 GB guide](https://atomic.chat/blog/guides/best-local-llm-8gb); [morphllm best Ollama models (Sep 2026)](https://www.morphllm.com/best-ollama-models); [MindStudio Gemma 4 vs Qwen 3.5](https://www.mindstudio.ai/blog/gemma-4-vs-qwen-3-5-open-weight-comparison)
- **[Blog / low]** One roundup reports broken tool calling in Ollama for Qwen 3.5 27B, a reminder that tool calling depends on the runtime's template and parser as well as the model. — same roundup set as above (claim aggregated by search; specific article not isolated)
- **[Official, how-to] Abliteration**: it finds a "refusal direction" in the residual stream (the mean activation difference between harmful and harmless prompts) and removes it, permanently via weight orthogonalization. The author reports "a performance drop in the ablated version across all benchmarks." A follow-up DPO fine-tune "recover[ed] most of the performance drop," except GSM8K (math). The author calls abliteration "fine-tuning without retraining." — [mlabonne, "Uncensor any LLM with abliteration" (Hugging Face blog)](https://huggingface.co/blog/mlabonne/abliteration)

### Inferences
- **Fit table for this PC.** Sizes are estimated from parameters × bits-per-weight ÷ 8, using the Q4_K_M ≈ 4.89 bpw figure from the quantize README. Real MoE GGUFs vary.
  - Qwen3.5-9B Q4_K_M ≈ 5.5–6 GB → **fits fully** with modest context. Its hybrid linear-attention layers should keep KV cache growth smaller than a pure-attention 9B. This is my inference, not tested.
  - Gemma 4 E4B Q4 ≈ 4.6 GB → **fits fully** with more room for context.
  - Llama 3.1 8B Q4_K_M = 4.58 GiB (measured, quantize README) → fits. Q8_0 = 7.95 GiB → **does not realistically fit** once the KV cache and Windows' own VRAM use are included.
  - gpt-oss-20b (~12–13 GB in its native MXFP4 GGUF; my background figure, not verified) → **partial offload**: part on the RX 580, the rest in system RAM.
  - Gemma 4 26B A4B Q4_K_M ≈ 15.4 GB → partial or expert offload. Fits in 8 GB VRAM + 16 GB RAM, but leaves little room for Windows and apps.
  - Qwen3-30B-A3B Q4_K_M ≈ 18.6 GB → **borderline** on 24 GB total (8 VRAM + 16 RAM) once Windows takes its 3–5 GB. A Q3_K_M (~15 GB) or IQ3 quant is the realistic choice. Expect slowdowns if Windows starts paging.
- For **tool calling via Odysseus** the safest choice is a non-abliterated Qwen3.5-9B or Gemma 4 E4B. Odysseus defaults to text-based (fenced-block) tool calling for manually added endpoints (see section 8), which depends heavily on instruction-following quality, and that is exactly what abliteration tends to degrade.
- **Abliterated trade-offs to teach**: (1) a general quality drop unless the model was "healed" (check the model card for DPO/fine-tune steps); (2) abliteration removes the refusal behavior but doesn't add knowledge; (3) safety guardrails are gone, so the user is responsible for what it outputs; (4) the base model's license still applies. An abliterated Llama is still under the Llama license.
- Thinking models (Qwen3.5, gpt-oss, Gemma 4 with thinking on) spend many tokens "reasoning" before answering. At about 25–35 t/s that adds noticeable wait, so turning thinking off is a useful lever on this GPU.

### Gaps
- No primary benchmark data was found on **how abliteration affects tool-calling accuracy** specifically, such as BFCL scores for abliterated vs. original models.
- The full Qwen3.5 lineup was not verified (e.g., whether a Qwen3.5-35B-A3B MoE or 2B/4B sizes exist). Only 9B and 4B are confirmed via the 9B card.
- No 2026 Llama release was checked. Whether Meta has a current small Llama recommended for 8 GB is unverified.
- Exact GGUF file sizes for gpt-oss-20b, Gemma 4 26B A4B and Qwen3.5-9B were not fetched from GGUF repos.
- No measured RX 580 speeds exist for any MoE model with CPU offload.

---

## 3. Quantization explained: bits per weight, quality-loss evidence, K-quants vs. I-quants

### Takeaway
Quantization stores each weight with fewer bits. Q8_0 uses about 8.5 bits per weight and is nearly lossless. Q4_K_M uses about 4.9 bits, which makes the file about 42% smaller than Q8_0, at a small but measurable quality cost. On Llama 3 8B, Q4_K_M picks the same top token as the full-precision model about 92% of the time, versus about 98% for Q8_0. Below about 3.5 bpw quality falls quickly. I-quants (IQ) and an "importance matrix" squeeze more quality out of very low bit counts.

### Cited Findings
- **[Official] Bits per weight and size, measured on Llama-3.1-8B** — [llama.cpp quantize README](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md):

  | Quant | bpw | Size (GiB) |
  |---|---|---|
  | IQ2_XXS | 2.38 | 2.23 |
  | Q2_K | 3.16 | 2.95 |
  | IQ3_XXS | 3.25 | 3.04 |
  | Q3_K_M | 4.00 | 3.74 |
  | IQ4_XS | 4.46 | 4.17 |
  | Q4_K_S | 4.67 | 4.36 |
  | **Q4_K_M** | **4.89** | **4.58** |
  | Q5_K_M | 5.70 | 5.33 |
  | Q6_K | 6.56 | 6.14 |
  | **Q8_0** | **8.50** | **7.95** |
  | F16 | 16.00 | 14.96 |

  Bpw is above the nominal bit count because each block also stores scales. "K_M" mixes keep some sensitive tensors at higher precision.
- **[Official]** The README says quantization reduces accuracy, measured by perplexity and/or KL divergence, and that "This can be minimized by using a suitable imatrix file" (importance matrix, `--imatrix`). — [llama.cpp quantize README](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md)
- **[Official] Quality-loss scoreboard, Llama 3 8B** (FP16 perplexity 6.233; lower KLD means closer to the original) — [llama.cpp perplexity README](https://github.com/ggml-org/llama.cpp/blob/master/tools/perplexity/README.md):

  | Quant | Size (GiB) | Perplexity | Mean KL divergence |
  |---|---|---|---|
  | Q8_0 | 7.96 | 6.234 | 0.0014 |
  | Q6_K | 6.14 | 6.253 | 0.0055 |
  | Q5_K_M | 5.33 | 6.289 | 0.0108 |
  | **Q4_K_M** | 4.58 | 6.407 | **0.0313** |
  | Q4_K_S | 4.37 | 6.501 | 0.0431 |
  | IQ4_XS (imatrix) | 4.14 | 6.460 | 0.0363 |
  | Q3_K_M | 3.74 | 6.888 | 0.1019 |
  | IQ3_M (imatrix) | 3.53 | 6.898 | 0.1025 |
  | IQ3_XXS (imatrix) | 3.05 | 7.458 | 0.1836 |
  | Q2_K (no imatrix) | 2.96 | 9.752 | 0.4451 |
  | Q2_K (imatrix) | 2.96 | 8.648 | 0.3322 |

- **[Official]** "Same top token as FP16" for Llama 3 8B: **Q8_0 97.7%, Q6_K 96.0%, Q4_K_M 91.9%, Q2_K 71.1%**. The README also warns that perplexity is **not** directly comparable between different models, especially with different tokenizers, and is meant for comparing a quant against its own FP16 version. At Q2_K, Llama 3 8B lost far more (KLD 0.445) than Llama 2 7B (0.109). — [llama.cpp perplexity README](https://github.com/ggml-org/llama.cpp/blob/master/tools/perplexity/README.md)
- **[Official] How the formats work** — [Hugging Face GGUF docs](https://huggingface.co/docs/hub/gguf):
  - K-quants use "super-blocks." Q4_K is 8 blocks of 32 weights with 6-bit scales and mins (4.5 bpw). Q6_K is 6.5625 bpw. Q3_K is 3.4375 bpw. Q2_K is 2.625 bpw.
  - I-quants (IQ4_XS 4.25 bpw, IQ3_XXS 3.06, IQ2_XXS 2.06, IQ1_S 1.56) use 256-weight super-blocks, and their weights are derived using a super-block scale plus an **importance matrix**.
  - Q8_0, Q4_0, Q5_0 and similar are "legacy" round-to-nearest types with 32-weight blocks.
  - MXFP4, used by gpt-oss, is a 4-bit microscaling floating-point type.

### Inferences
- **Q4_K_M vs Q8_0 for this student:** Q8_0 of an 8B model (7.95 GiB) can't fit in an 8 GB card alongside the KV cache and the Windows desktop. Q4_K_M (4.58 GiB) fits with room for context, and loses about 8% top-token agreement. Rule of thumb: **use the biggest model you can fit at about Q4_K_M rather than a smaller model at Q8_0**. That heuristic is common community advice. The data above supports "Q4_K_M is a modest loss" but does not directly prove "bigger model at Q4 beats smaller at Q8" (see gaps).
- Q4_K_M generation is also faster than Q8_0, because generation speed scales with bytes read per token (see section 4).
- I-quants give the best quality per byte at 2–3.5 bpw. Speed of IQ quants on Vulkan/Polaris wasn't verified. Some IQ kernels are slower on older GPUs, but that is background knowledge, not a sourced claim.
- Teaching analogy: KL divergence measures "how different are the probability guesses," and same-top-token % measures "how often it would pick the same next word."

### Gaps
- No primary 2026 KLD data was found for **Qwen3.5 or Gemma 4** quants. The scoreboard is Llama 3 8B.
- No controlled source was fetched for the claim "a larger model at Q4 beats a smaller model at Q8." It is widely repeated community wisdom but not verified here.
- No data on IQ-quant vs K-quant **speed** on the Vulkan backend for GCN4.

---

## 4. Memory capacity vs. bandwidth vs. compute: why generation is memory-bound, prompt processing is compute-bound, and what partial offload does

### Takeaway
There are three different limits: **capacity** (does the model fit in 8 GB?), **bandwidth** (how fast can the GPU read the weights? this sets generation speed) and **compute** (how many math operations per second? this sets prompt-reading speed). "Doesn't fit" and "GPU too weak" are separate problems. The RX 580 has enough bandwidth for usable chat speeds on models that fit. Its weakness is compute (slow prompt processing) and its 8 GB capacity. When a model doesn't fit, partial offload puts some layers in much slower system RAM, and generation slows toward CPU speed.

### Cited Findings
- **[Community benchmark]** The same 7B Q4_0 test shows the pattern clearly — [llama.cpp discussion #10879](https://github.com/ggml-org/llama.cpp/discussions/10879):
  - Generation (tg128): RX 580 39 t/s, RX 6600 51 t/s, RTX 3060 76 t/s. That is only about a 2x spread.
  - Prompt processing (pp512): RX 580 258, RX 6600 759, RTX 3060 1816 t/s. That is about a 7x spread.
- **[Anecdotal]** On an RX 580, Vulkan was 4.21x faster than CPU on the same Gemma-3n task. — [VulkanIlm mirror](https://gh.nn.ci/Talnz007/VulkanIlm)
- **[Modeled]** willitrunai's own methodology notes that cards which fit the whole model in VRAM run far faster than ones that offload to system RAM. — [willitrunai](https://willitrunai.com/ja/can-run/qwen-3-8b-on-rx-580-8gb)
- **[Third-party docs]** Keeping the KV cache on the GPU benefits throughput but uses more VRAM. Moving it off the GPU saves VRAM but is slower, because the GPU must read it from host memory. — [Aspose LLM docs, offload_kqv](https://docs.aspose.com/llm/net/developer-reference/parameters/context/offload-kqv/)

### Inferences
- **Why generation is memory-bound (arithmetic).** To produce each new token, the GPU must read essentially every (active) weight once, but does only about 2 math operations per weight. The RX 580 can do about 6 TFLOPS (background spec) yet read only 256 GB/s, so reading is the bottleneck.
  - Ceiling: 256 GB/s ÷ ~3.8 GB (7B Q4_0) ≈ **67 tokens/s**. The measured 39 t/s is about 60% of that ceiling, which is typical.
  - For an 8B Q4_K_M (4.58 GiB ≈ 4.9 GB) the ceiling is about 52 t/s, so expect about 30 t/s.
  - This is also why **smaller quants generate faster**: fewer bytes to read per token.
- **Why prompt processing is compute-bound.** All prompt tokens are processed in parallel as big matrix multiplications, so each weight read is reused across hundreds of tokens and arithmetic becomes the bottleneck. The RTX 3060's ~7x pp advantage reflects tensor cores and coopmat2 support, which the RX 580 lacks, while its ~2x tg advantage reflects mostly bandwidth (360 vs 256 GB/s; background spec). The RX 6600 has *less* raw bandwidth (224 GB/s) yet generates faster than the RX 580, likely because of its 32 MB Infinity Cache and a newer architecture. So "bandwidth sets tg" is a first-order rule, not an exact law.
- **Capacity** is the gate: if the weights + KV cache + Windows' own VRAM use exceed ~8 GB, something must go to system RAM.
- **Partial offload.** LM Studio's "GPU offload" slider sets how many transformer layers live in VRAM; the rest run on the CPU from DDR4. The Ryzen 5 2600 officially supports DDR4-2933, so dual-channel gives about 47 GB/s theoretical (background spec, my arithmetic). That is about 5x slower than the RX 580's 256 GB/s. Every token must pass through *all* layers, so the slow part dominates.
  - Example: a model with 25% of its bytes on CPU spends about 60% of its per-token time there. Speed drops sharply even with a small spill.
  - This is why "8.8 GB model on an 8 GB card" feels much worse than "a bit too big."
- Single-channel RAM (one 16 GB stick) would halve CPU-side bandwidth. Worth checking that the student's 16 GB is 2×8 GB in the correct slots. Background knowledge, not sourced.

### Gaps
- No source measured RX 580 partial-offload speeds at different offload percentages.
- No primary source (e.g., a llama.cpp doc) explicitly stating the memory-bound/compute-bound split was fetched. The explanation above is derived from the benchmark data plus standard arithmetic.

---

## 5. Mixture-of-Experts: what "30B-A3B" means, why MoE runs decently with CPU offload, and the memory still needed

### Takeaway
"Qwen3-30B-A3B" means **30B total parameters, about 3B Active per token**. Inside each layer a router picks 8 of 128 "expert" sub-networks for each token, so only about 3.3B weights are read per token. That makes it fast like a 3B model, but **all 30B must still be stored somewhere**. With 8 GB VRAM + 16 GB RAM, MoE models are the best way to run "bigger than 8 GB" models, because only the small active slice must be read on each token. LM Studio's "Force Model Expert Weights onto CPU" toggle exists for exactly this.

### Cited Findings
- **[Official]** Qwen3-30B-A3B: 30.5B total, 3.3B activated, 48 layers, 128 experts with 8 activated per token. — [Qwen3-30B-A3B model card](https://huggingface.co/Qwen/Qwen3-30B-A3B)
- **[Official]** The same naming pattern appears elsewhere. Gemma 4 "26B A4B" is 25.2B total and 3.8B active. gpt-oss-20b is 21B total and 3.6B active. — [Gemma 4 E4B card](https://huggingface.co/google/gemma-4-E4B-it); [gpt-oss-20b card](https://huggingface.co/openai/gpt-oss-20b)
- **[Blog / low]** A secondary source explains the naming: "26B" is the total stored weights and "A4B" is the active parameters used per inference pass. — [aitoolly Gemma 4 26B A4B](https://aitoolly.com/ai-model/gemma-4-26b-a4b)
- **[Official]** LM Studio 0.3.23 (Aug 2025) added **"Force Model Expert Weights onto CPU"** in the advanced load settings, for machines without enough VRAM to hold a whole MoE model. It uses the same mechanism as llama.cpp's `--n-cpu-moe`. If the entire model fits in VRAM, keeping experts on the GPU (the default) is better. — [LM Studio 0.3.23 blog](https://www.lmstudio.ai/blog/lmstudio-v0.3.23); [LM Studio changelog 0.3.23](https://lmstudio.ai/changelog/lmstudio-v0.3.23)
- **[Anecdotal]** A bug report says "Offload KV Cache to GPU Memory" stopped behaving as expected after the expert-offload toggle was added. The workaround was to set GPU offload to max and enable the expert toggle. Reported against 0.3.23 build 3 and may be fixed since. — [LM Studio bug tracker #900](https://github.com/lmstudio-ai/lmstudio-bug-tracker/issues/900)
- **[Blog / low]** A headline reports that Qwen3 MoE CPU expert offload "doubles decode speed on 12GB VRAM." Only the title was seen; the article was not read. — [aiweekly alert](https://aiweekly.co/alerts/qwen3-moe-cpu-expert-offload-doubles-decode-speed-on-12gb-vram)

### Inferences
- **Why MoE tolerates CPU offload.** Per token, Qwen3-30B-A3B at Q4_K_M reads only about 3.3B × 4.89 / 8 ≈ **2 GB** of weights, versus about 18.6 GB if it were a dense 30B.
  - Even from DDR4 at about 47 GB/s, the CPU-side ceiling is around 20 t/s. Real speeds will be lower; a plausible guess is high single digits to mid-teens t/s on this PC, but this is unmeasured.
  - A dense 30B would crawl at about 2 t/s.
- **Expert offload vs. layer offload.** Expert offload keeps the always-used parts (attention, shared weights, KV cache) on the fast GPU and puts the big, sparsely used expert tables in RAM. That is usually better than splitting whole layers.
- **Memory still needed.** Total weights ≈ total parameters × bpw ÷ 8 (Qwen3-30B-A3B Q4_K_M ≈ 18.6 GB; Q3_K_M ≈ 15 GB). The sum of VRAM and RAM must hold this, plus the KV cache, plus Windows (likely 3–5 GB) and apps. With 16 GB RAM, Q3-level quants of 30B-A3B or Q4 of gpt-oss-20b/Gemma 4 26B A4B are about the ceiling.
- **"Experts" doesn't mean topic experts.** The router learns its own token-level specializations. They aren't "a math expert" and "a history expert." This is a common misconception worth teaching, but the claim is background knowledge, not sourced here.
- Prompt processing for MoE with CPU-resident experts will be slow on this CPU, so long agent prompts hurt even more.

### Gaps
- No measured RX 580 + Ryzen 5 2600 numbers exist for any MoE with expert offload.
- I didn't verify whether current LM Studio exposes a numeric "how many layers' experts on CPU" control (like `--n-cpu-moe N`) or only the on/off toggle.

---

## 6. GGUF vs. safetensors vs. other formats; what LM Studio needs; Hugging Face naming conventions

### Takeaway
**Safetensors** is the "original" tensor-only format that labs publish, usually full precision (BF16), and is used by PyTorch/Transformers/vLLM. **GGUF** is llama.cpp's single-file format: quantized weights *plus* metadata such as the tokenizer and chat template. LM Studio's llama.cpp engine needs GGUF (MLX is for Macs only). On Hugging Face, look for repos ending in `-GGUF`, then pick a quant file (e.g., `Q4_K_M`). Name parts tell you training stage and modifications: Base, Instruct/-it, abliterated, uncensored, distill.

### Cited Findings
- **[Official]** GGUF is a binary format optimized for quick loading and saving, designed for GGML (llama.cpp's library), created by ggerganov (llama.cpp's author). Unlike tensor-only formats like safetensors, it encodes the tensors plus a standardized set of metadata. Models from PyTorch can be converted to GGUF. Hugging Face lists LM Studio, llama.cpp, Ollama and GPT4All as GGUF tools, has a GGUF metadata viewer, and offers the `gguf-my-repo` converter. Example repo naming: `TheBloke/Mixtral-8x7B-Instruct-v0.1-GGUF`, with files like `...Q4_0.gguf` and `...Q5_K_M.gguf`. — [Hugging Face GGUF docs](https://huggingface.co/docs/hub/gguf)
- **[Official]** Safetensors is also a recommended Hub format, but it is tensor-only. — [Hugging Face GGUF docs](https://huggingface.co/docs/hub/gguf)
- **[Official]** The gpt-oss-20b card's file listing shows BF16 and U8 tensor types (safetensors, with MXFP4-packed MoE weights). It says the Transformers chat template applies the harmony format automatically. — [gpt-oss-20b card](https://huggingface.co/openai/gpt-oss-20b)
- **[Official] Naming examples**:
  - Qwen publishes a separate `Qwen3-30B-A3B-Base` alongside the post-trained Qwen3-30B-A3B — [Qwen3-30B-A3B card](https://huggingface.co/Qwen/Qwen3-30B-A3B).
  - Google uses the `-it` suffix ("instruction-tuned"), e.g., `gemma-4-E4B-it` — [Gemma 4 E4B card](https://huggingface.co/google/gemma-4-E4B-it).
  - "Abliterated" models have had a refusal direction orthogonalized out of their weights — [abliteration blog](https://huggingface.co/blog/mlabonne/abliteration).
- **[Official] Chat templates differ per model family**:
  - gpt-oss "should only be used with" the harmony format — [gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b).
  - Qwen3.5 toggles thinking via a chat-template argument (`enable_thinking`) — [Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B).
  - Gemma 4 toggles thinking via a `<|think|>` token in the system prompt — [Gemma 4](https://huggingface.co/google/gemma-4-E4B-it).
  - Qwen3 uses `<think>…</think>` tags and `/think` `/no_think` soft switches — [Qwen3-30B-A3B](https://huggingface.co/Qwen/Qwen3-30B-A3B).

### Inferences
- **Explaining chat templates to a beginner.** A model doesn't "see" chat bubbles. It sees one long text stream with special marker tokens (e.g., "start of user turn," "start of assistant turn," tool-call markers). The chat template is the recipe that turns the chat list into that stream, and each family was trained on its own recipe.
  - Wrong template symptoms: rambling, answering itself, printing marker tokens, broken tool calls. Note that bug #1565's "repeated special tokens" symptom looks similar but was a runtime bug.
  - GGUF stores the template in its metadata, so LM Studio usually gets it right automatically. Re-uploaded or abliterated GGUFs sometimes carry an outdated template.
- **Naming cheat-sheet** (partly background knowledge):
  - **Base**: next-word predictor, not chat-trained.
  - **Instruct / -it / Chat**: tuned to follow instructions.
  - **abliterated**: refusal direction removed by weight editing.
  - **uncensored**: usually *fine-tuned* on data without refusals; the method varies by author.
  - **Distill**: a smaller model trained on a bigger model's outputs, e.g., the well-known DeepSeek-R1-Distill-Qwen models. Not verified in this research.
  - **GGUF / -GGUF**: llama.cpp-ready conversion.
  - **Q4_K_M etc.**: the quant level.
  - **A3B**: active parameters (MoE).
  - **2507**: release date code (Qwen uses YYMM). This is an inference from the "Instruct-2507" naming.
- Who re-uploads matters. Quantizer accounts (e.g., unsloth, bartowski, lmstudio-community) are common sources of GGUFs, but this was not verified in this research.

### Gaps
- I didn't fetch LM Studio's own docs on supported formats (GGUF; MLX on Apple Silicon) or its "staff picks"/lmstudio-community conventions.
- No authoritative source was fetched defining "uncensored" vs. "abliterated." The usage is community convention.

---

## 7. Open-weights vs. open-source vs. closed models, with license examples

### Takeaway
"Open weights" means you can download and run the trained model. "Open source" (by the OSI definition) additionally requires enough information about training data, plus the code, for others to rebuild it, and an unrestrictive license. Most "open" LLMs (Llama, Gemma, Qwen, gpt-oss) are open-weights. Licenses vary: **Apache 2.0** (Qwen3/3.5, Gemma 4, gpt-oss) is permissive. The **Llama Community License** adds conditions: a 700M-user cap, "Built with Llama" attribution, and derivative names starting with "Llama." Closed models (ChatGPT, Claude) can only be used via an API.

### Cited Findings
- **[Official]** Apache-2.0 licenses: Qwen3-30B-A3B ([card](https://huggingface.co/Qwen/Qwen3-30B-A3B)), Qwen3.5-9B ([card](https://huggingface.co/Qwen/Qwen3.5-9B)), Gemma 4 ([card](https://huggingface.co/google/gemma-4-E4B-it); a change from earlier Gemma-specific terms), and gpt-oss-20b, described as permissive with commercial use and fine-tuning allowed ([card](https://huggingface.co/openai/gpt-oss-20b)).
- **[Official] Llama 3.1 Community License** — [Llama 3.1 LICENSE (meta-llama/llama-models)](https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE):
  - Grants a royalty-free right to use, modify and redistribute.
  - Licensees whose products had "greater than 700 million monthly active users" must request a separate license, which Meta may refuse.
  - Distributors must display "Built with Llama."
  - Derivative models must have names that **begin with "Llama"**.
  - Use must follow Meta's Acceptable Use Policy.
- **[Secondary]** The OSI published its Open Source AI Definition 1.0 on Oct 28, 2024. It requires enough detail about training data that a skilled person could recreate a substantially equivalent system, but does not mandate releasing the full dataset. OSI has said Meta's Llama does not meet the definition. — [OSI press mention (Fortune)](https://opensource.org/blog/publication/fortune)
- **[Commentary]** Bruce Schneier argues most "open source" AI models like Llama are "open source in name only" and endorses the term "open weights." — [Schneier on Security, Nov 2024](https://www.schneier.com/blog/archives/2024/11/ai-industry-is-trying-to-subvert-the-definition-of-open-source-ai.html)
- **[Secondary]** Odysseus itself is software (not a model) licensed **AGPL-3.0-or-later**, a copyleft open-source license. — [odysseus-dev/odysseus](https://github.com/odysseus-dev/odysseus)

### Inferences
- A helpful three-level ladder for the student:
  1. **Closed** (ChatGPT/Claude via API only).
  2. **Open weights** (download and run locally; license may restrict use, e.g., Llama).
  3. **Open source in the OSI sense** (weights + code + data information + permissive terms).
- Even Apache-2.0 models like Qwen3.5 are usually "open weights, permissively licensed" rather than OSI open-source AI, because full training data details aren't published. This inference is consistent with the secondary glossary claim summarized in search results but not verified from OSI's own list.
- Abliterated or fine-tuned derivatives inherit the base license. An abliterated Llama is bound by the Llama license and its naming and attribution rules. An abliterated Qwen stays Apache-2.0.
- Note the distinction for the student: AGPL Odysseus is "open source" in the classic software sense, and that is a different question from whether a *model* is open.

### Gaps
- **Non-commercial license example not verified.** Candidates from background knowledge, such as CC-BY-NC-4.0 on some Cohere Command models or Mistral's research/non-production licenses, were not checked in this research. The report writer should not state a specific one without verification.
- OSI's own list of which models pass or fail OSAID was not fetched directly.
- The license of current Llama 4 or later Llama releases was not checked. The findings above are for Llama 3.1.

---

## 8. Best LM Studio settings for this hardware, and connecting Odysseus

### Takeaway
Use the **Vulkan llama.cpp** runtime and pick a model that fits fully, such as Qwen3.5-9B or Gemma 4 E4B at Q4_K_M. Set GPU offload to max. Keep context at about 8K–16K. Try flash attention: Vulkan FA entries exist for Polaris cards, with mixed results. Use KV-cache Q8_0 only if VRAM is tight. Use "Force Model Expert Weights onto CPU" only for MoE models that don't fit. Odysseus (by PewDiePie, AGPL-3.0) connects to any OpenAI-compatible endpoint via Settings. Its docs only spell out Ollama, so the LM Studio URL (`http://localhost:1234/v1` natively, or `http://host.docker.internal:1234/v1` from Docker) is an inference to verify.

### Cited Findings
- **[Community benchmark]** Flash attention on Vulkan for Polaris: the RX 570 improved slightly with FA (tg 37.4→40.2, pp 226→229) and the RX 470 also improved (tg 40.1→43.4). The RX 480 got slower at pp (249→195) but faster at tg (34.7→37.2). No FA result for the RX 580. — [llama.cpp discussion #10879](https://github.com/ggml-org/llama.cpp/discussions/10879)
- **[Anecdotal]** In LM Studio's Python SDK, a user reports that K/V cache quantization settings were not applied while flashAttention and contextLength were. This is an open-ended bug report. — [lmstudio-python issue #107](https://github.com/lmstudio-ai/lmstudio-python/issues/107)
- **[Blog / low]** In llama.cpp, quantizing the KV cache requires flash attention to be enabled, and Vulkan FA is newer and less mature, so test it. — [bestllmfor FA guide](https://bestllmfor.com/guide/flash-attention-2-llm-local-activation/)
- **[Official]** "Force Model Expert Weights onto CPU" is in advanced load settings (since 0.3.23) and is intended only when the model doesn't fit in VRAM. — [LM Studio 0.3.23 blog](https://www.lmstudio.ai/blog/lmstudio-v0.3.23)
- **[Blog / low]** 8 GB guides advise keeping context to 8K–16K unless tested. — [vdf.ai](https://vdf.ai/blog/best-local-llm-by-vram/); [atomic.chat](https://atomic.chat/blog/guides/best-local-llm-8gb)
- **[Secondary] Odysseus background**: a free, open-source, self-hosted AI workspace released by Felix Kjellberg (PewDiePie) at the end of May 2026. It covers chat, agents, deep research, email, memory, model comparison, and a "Cookbook" with hardware-aware recommendations across 270+ models. It works with local runtimes (llama.cpp, Ollama, LM Studio) or cloud APIs. Reported GitHub star counts conflict (e.g., ~42k in 3 days vs. ~66k by June 10, 2026). There has been community criticism about security and "vibecoded" origins. — [OpenSourceForU (Jun 2026)](https://www.opensourceforu.com/2026/06/pewdiepie-launches-open-source-ai-alternative-to-chatgpt-and-claude/); [Let's Data Science](https://letsdatascience.com/news/pewdiepie-releases-open-source-odysseus-ai-workspace-ccad3aef); [Pasquale Pillitteri](https://pasqualepillitteri.it/en/news/4016/odysseus-pewdiepie-local-ai-workspace). The official site and README do not name the author. — [odysseus-dev.github.io](https://odysseus-dev.github.io/odysseus)
- **[Official] Odysseus install** — [odysseus-dev/odysseus README](https://github.com/odysseus-dev/odysseus):
  - License AGPL-3.0-or-later.
  - Docker Compose path: `git clone` → `cp .env.example .env` → `docker compose up -d --build`. The UI is at `http://localhost:7011`, and the first admin password appears in `docker compose logs odysseus`.
  - Security advice: keep `AUTH_ENABLED=true`, keep `LOCALHOST_BYPASS=false` outside local development, and don't expose model ports publicly.
- **[Official] Odysseus endpoint setup** — [Odysseus setup guide (website/setup.md)](https://github.com/odysseus-dev/odysseus/blob/main/website/setup.md):
  - Add endpoints in **Settings**. Odysseus works with "Ollama, vLLM, and other OpenAI-compatible endpoints."
  - Documented example: from Docker to Ollama on the host, use `http://host.docker.internal:11434/v1`. The host server must listen beyond loopback, e.g., `OLLAMA_HOST=0.0.0.0:11434`.
  - On Windows, the native path points at `http://localhost:11434/v1`. It needs Python 3.11+ (`py -3.11 -m venv venv`) and Git for Windows (for `bash.exe`, used by Cookbook downloads and the agent shell tool). The launcher `launch-windows.ps1` binds to 127.0.0.1 unless given `-BindHost 0.0.0.0`.
  - Env vars: `LLM_HOST`, `LLM_HOSTS`, `OPENAI_API_KEY` (optional), `EMBEDDING_URL`.
  - **Tool calling:** a manually added endpoint defaults to **text-based (fenced-block) tool calling**, not native structured calls. Native mode can be forced only via an admin API PATCH to `/api/model-endpoints/<id>` with `{"supports_tools": true}`, because there is no UI control yet (issue #5192).
  - GPU docs cover NVIDIA (CUDA) and AMD **ROCm** overlays for Docker. **Vulkan is not mentioned.** The guide suggests GGUF/Q4 on llama.cpp for first tests on 8 GB GPUs.

### Inferences
- **Suggested starting LM Studio profile for this PC.** This is my synthesis; each item should be tested.
  1. **Runtime:** Vulkan llama.cpp (keep CPU llama.cpp as a fallback test).
  2. **Model:** Qwen3.5-9B or Gemma 4 E4B at Q4_K_M, non-abliterated for tool use, abliterated only for plain chat if desired.
  3. **GPU offload:** max/all layers. If the model doesn't fit, prefer a smaller quant or model over partial offload.
  4. **Context length:** start at 8,192, raise to 16K if VRAM allows. Watch Task Manager's "Dedicated GPU memory." Remember Windows uses some VRAM because there is no iGPU.
  5. **Flash attention:** try ON and compare tok/s; Polaris results were mixed.
  6. **KV cache quantization (K/V = Q8_0):** only if more context is needed; requires FA, and Vulkan support may be flaky.
  7. **CPU threads:** about 6 (the physical core count) is the usual starting point for the CPU-side work. This is not sourced; it's background knowledge.
  8. **MoE experiments** (gpt-oss-20b, Gemma 4 26B A4B, Qwen3-30B-A3B Q3): enable "Force Model Expert Weights onto CPU," max GPU offload, smaller context.
  9. Turn off "thinking" for snappier chat.
- **KV cache sizing example** (arithmetic; head_dim = 128 is my assumption, since the card doesn't state it). Qwen3-30B-A3B stores 2 (K and V) × 48 layers × 4 KV heads × 128 × 2 bytes ≈ **96 KiB per token** at F16. That is about 0.75 GiB at 8K context and about 3 GiB at 32K. Q8_0 KV roughly halves this. This shows why context length competes with model size for the 8 GB.
- **Connecting Odysseus to LM Studio (inferred, not documented):**
  1. In LM Studio, start the local server from the Developer tab. It defaults to port 1234 with an OpenAI-compatible `/v1` API (background knowledge).
  2. In Odysseus → Settings, add an endpoint `http://localhost:1234/v1` for a native Windows install, or `http://host.docker.internal:1234/v1` if Odysseus runs in Docker. With Docker, LM Studio's "serve on local network" option will likely need enabling, mirroring the Ollama `0.0.0.0` requirement.
  3. Use any placeholder API key if one is required.
  4. Pick the loaded model.
  5. Test tool use. Because of the text-based tool-call default, a strong instruction-follower matters.
- Odysseus agent prompts (tool lists, memory, system prompts) are long. On an RX 580, prompt processing of about 250 t/s means several seconds to tens of seconds before replies, so keep tools toggled to what's needed. Odysseus offers per-tool toggles per its homepage.
- Odysseus's Cookbook "Serve" feature runs its own llama.cpp. Whether its builds include Vulkan for Windows/AMD is unknown. Using LM Studio as the server is the safer path for this RX 580.

### Gaps
- **LM Studio's official docs** for per-model load settings (exact names of flash attention, K/V cache quantization, GPU offload, CPU thread pool, "Offload KV cache to GPU") were not retrieved. Setting names above come from the changelog, bug reports and SDK issues.
- I couldn't confirm whether flash attention and KV-cache quantization **work on Polaris in LM Studio's current Vulkan runtime**. The scoreboard shows FA ran on the RX 570/470/480 in upstream llama.cpp.
- Odysseus documentation **does not cover LM Studio** explicitly, LM Studio's port, or Vulkan. The LM Studio connection steps are inferred.
- No official recommendation for CPU thread count was found.
- I couldn't verify whether Odysseus's Cookbook hardware detection recognizes an RX 580 or recommends models correctly for it.
