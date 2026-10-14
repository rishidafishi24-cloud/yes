# One request, start to finish: how an LLM request works in chat apps and local runners (as of October 2026)

Scope note: The learner's setup is LM Studio (local server), Odysseus (self-hosted workspace that talks to LM Studio), Zed + OpenRouter (cloud models), Claude Code and Codex. Doc pages fetched 2026-10-13. Several docs already name 2026 model generations (e.g. "Claude Opus 5.5", "GPT-5.6"), so model names, prices and beta headers below are **version-dependent**. Odysseus code was read from the `main` branch on 2026-10-13. It is under active development, so file names and constants may change.

Three misconceptions to correct: (1) chat history is stored in the weights, (2) an overflowing context is "compressed into memory" automatically, (3) prompt caching is "model memory". The short answer to all three is that the model is a fixed function. The **app** keeps the transcript, decides what to resend, decides when to trim or summarize, and **caches are speed and price shortcuts that never change what the model knows**.

---

## Q1. Chat-completion APIs are stateless. How does the client resend everything (system prompt, tools, history, new message) every turn?

### Takeaway
On standard chat endpoints, every request is independent. The app (Odysseus, Zed, Claude Code, Codex) stores the conversation itself and sends the **whole list** each time: system prompt, tool definitions, every earlier user and assistant message, tool results, and the new message. The model reads it all from scratch (or from a cache), writes a reply, and forgets everything. Some "stateful" endpoints exist, such as OpenAI `previous_response_id` and LM Studio `/api/v1/chat`. These only move the transcript storage to the server. The full history is still fed to the model and still billed or processed as input.

### Cited Findings
**OpenAI**
- OpenAI states: "While each text generation request is independent and stateless, you can still implement multi-turn conversations". You do this by resending earlier messages: "include the model's previous response output as input, and append that input to your next request." — [OpenAI: Conversation state](https://developers.openai.com/api/docs/guides/conversation-state)
- OpenAI also offers server-side state: `previous_response_id` "lets you chain responses and create a threaded conversation". The Conversations API can "persist conversation state as a long-running object". Stored responses are kept 30 days by default, and `store: false` disables storage. — [OpenAI: Conversation state](https://developers.openai.com/api/docs/guides/conversation-state)
- Server-side state does not make the history free: "all previous input tokens for responses in the chain are billed as input tokens in the API." — [OpenAI: Conversation state](https://developers.openai.com/api/docs/guides/conversation-state)

**Anthropic**
- The Anthropic Messages API docs describe each turn as an "Input phase: Contains all previous conversation history plus the current user message". The "Output phase: Generates a text response that becomes part of the input for the next turn." — [Anthropic: Context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- "Everything in the request counts toward the context window: the system prompt, every message in `messages` (including tool results, images, and documents), and your tool definitions. The output Claude generates for the turn, including its extended thinking, counts too." — [Anthropic: Context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- Anthropic's prompt-caching docs give the order of a request: "`tools`, `system`, and `messages` (in that order)". This is a useful mental model of the "envelope" sent each turn. — [Anthropic: Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)

**LM Studio**
- LM Studio's endpoint comparison table (LM Studio 0.4.0+, which introduced the native v1 REST API) reads "Stateful chat | /api/v1/chat ✅ | /v1/responses ✅ | /v1/chat/completions ❌ | /v1/messages ❌". The OpenAI-compatible `/v1/chat/completions` endpoint, which most third-party apps use, is stateless. — [LM Studio: REST API](https://lmstudio.ai/docs/developer/rest)
- In the stateful endpoint, "LM Studio stores the conversation in a chat thread" and "automatically stores and manages the context for you". You continue with `previous_response_id`. Setting `store: false` means "The response will not include a `response_id`." — [LM Studio: Stateful chats](https://lmstudio.ai/docs/developer/rest/stateful-chats)

**Odysseus (verified in source)**
- For OpenAI-compatible endpoints, Odysseus builds `payload = {"model": model, "messages": messages_copy, ...}` and POSTs it to a URL normalized to `/chat/completions`. It sends a full messages array each call. Before sending, it sanitizes the messages: it strips metadata, repairs tool-call pairs and merges consecutive user messages. — [Odysseus src/llm_core.py](https://raw.githubusercontent.com/pewdiepie-archdaemon/odysseus/main/src/llm_core.py)
- Odysseus stores chat history in its own SQLite database: each message is a `DBChatMessage` row linked by `session_id`. This comes from DeepWiki's AI-generated code summary, not a direct read of the file. — [DeepWiki: Odysseus](https://deepwiki.com/search/how-does-odysseus-send-a-chat_939b2a2e-fa35-4efe-ae59-5e191701e2c9)
- Per DeepWiki, a `build_chat_context` step gathers "the system prompt, user preferences, RAG sources, and relevant memories" into the messages list for each LLM call. This is also unverified against source. — [DeepWiki: Odysseus](https://deepwiki.com/search/how-does-odysseus-send-a-chat_939b2a2e-fa35-4efe-ae59-5e191701e2c9)

**Claude Code**
- Claude Code "saves your conversation locally as you work. Each message, tool use, and result is written to a plaintext JSONL file under `~/.claude/projects/`". The transcript lives on the user's disk, not in the model. — [Claude Code: How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works)
- "Sessions are independent. Each new session starts with a fresh context window, without the conversation history from previous sessions." — [Claude Code: How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works)
- Claude Code adds its own context to every conversation, such as CLAUDE.md files, output style instructions, notes when files change on disk, and commit attribution lines. These are called "system reminders". — [Claude Code: How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works)

**Analogy from an educator**
- Andrej Karpathy (Y Combinator AI Startup School, reported June 19, 2025): "LLMs suffer from anterograde amnesia… I recommend people watch these two movies, Memento and 50 First Dates… their weights are fixed, and their context window gets wiped every single morning." He also said: "Context windows are sort of like working memory." — [OfficeChai report of Karpathy talk](https://officechai.com/ai/andrej-karpathy-explains-how-modern-llms-are-like-the-movies-memento-50-first-dates/) (secondary report of a talk, not a transcript)
- Hugging Face's core framing: "All causal LMs, whether chat-trained or not, continue a sequence of tokens… The chat is still just a sequence of tokens, though!" — [Hugging Face: Chat templates](https://huggingface.co/docs/transformers/main/en/chat_templating)

### Inferences
- A step-by-step for one Odysseus → LM Studio turn, based on the sources above:
  1. The user types a message.
  2. Odysseus saves it to its database.
  3. Odysseus builds the list: system prompt + relevant saved memories + (possibly compacted) history + new message.
  4. Odysseus POSTs JSON to LM Studio's `/v1/chat/completions`.
  5. LM Studio applies the model's chat template, turning the list into one long token string (Q3).
  6. LM Studio reuses cached work for any unchanged prefix (Q4).
  7. LM Studio prefills the new tokens (Q5).
  8. LM Studio decodes the reply token by token and streams it back.
  9. Odysseus saves the reply to its database.
  10. LM Studio keeps no record of the conversation on this endpoint.

  The weights are only read, never written, at every step.
- Good beginner analogy (my own wording, consistent with the docs): the model is like a brilliant actor with no memory, handed a **full script** (the messages list) each time and asked to write the next line. The app is the **stage manager** who keeps the script binder.
- Since OpenAI says chained input is still billed, "stateful" endpoints are a convenience for developers. They do not give the model memory.
- Zed + OpenRouter, Claude Code and Codex all follow the same pattern: a local app holds the transcript and resends it. Only Claude Code's storage location is documented above.

### Gaps
- I did not fetch Zed's or Codex CLI's docs on exactly how they store and resend threads. Codex likely stores sessions locally, but I have no source.
- I did not directly verify Odysseus's `build_chat_context` and SQLite claims in source code. They come from DeepWiki's AI summary.
- I did not confirm whether Odysseus ever uses LM Studio's stateful `/api/v1/chat`. The verified code path uses `/chat/completions`.

---

## Q2. What happens when the conversation exceeds the context window? Who does the compressing?

### Takeaway
Nothing compresses itself "into memory". Something has to decide what to drop or shorten. That can be the **runner** (LM Studio overflow policy: stop, truncate middle, or rolling window), the **app** (Odysseus compacts at 85% and trims oldest turns; Zed offers "New from Summary"; Claude Code auto-compacts), or a **router or API** (OpenRouter context compression; Anthropic and OpenAI server-side compaction). When a summary is used, it is just **another ordinary model call** that writes a summary as text. The app then swaps that text in for the old messages. The original details are gone from what the model sees. Nothing goes into the weights.

### Cited Findings
**LM Studio overflow policies** (SDK/API config `contextOverflowPolicy`)
- `stopAtLimit`: "Stop the prediction when the generated tokens length exceeds the context window size. If the generation is stopped because of this limit, the `stopReason` in the prediction stats will be set to `contextLengthReached`".
- `truncateMiddle`: "Keep the system prompt and the first user message, truncate middle."
- `rollingWindow`: "Maintain a rolling window and truncate past messages."
- Source: [LM Studio: LLMPredictionConfigInput](https://lmstudio.ai/docs/typescript/api-reference/llm-prediction-config-input); same text in [lmstudio-js source](https://github.com/lmstudio-ai/lmstudio-js/blob/d5ee7ed3/packages/lms-shared-types/src/llm/LLMPredictionConfig.ts)
- A 2025 bug report shows the policy can be passed per-request on LM Studio's `/api/v0/chat/completions` as `"lmstudio": {"context_overflow_policy": ...}`. At the time this hit a validation bug. — [LM Studio bug tracker #532](https://github.com/lmstudio-ai/lmstudio-bug-tracker/issues/532)
- A GitHub issue filed against LM Studio 0.4.11-1 reports the app failing silently when a tool response exceeds the loaded context length. The model then outputs garbage instead of an error. This is a user report, not confirmed behavior. — [LM Studio bug tracker #1806](https://github.com/lmstudio-ai/lmstudio-bug-tracker/issues/1806) (seen in search results only)
- The context length is a load-time setting in LM Studio ("Set a particular context size for a given model"). It can be saved as a per-model default. — [LM Studio: Per-model defaults](https://lmstudio.ai/docs/app/advanced/per-model)
- In llama.cpp (LM Studio's engine for GGUF), `--context-shift` is "whether to use context shift on infinite text generation (default: disabled)", and `-c, --ctx-size` sets "size of the prompt context (default: 0, 0 = loaded from model)". — [llama.cpp server README](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md)

**Odysseus (verified in `src/context_compactor.py`)**
- `COMPACT_THRESHOLD = 0.85`, with the comment "Trigger compaction at 85% of context window." — [Odysseus src/context_compactor.py](https://raw.githubusercontent.com/pewdiepie-archdaemon/odysseus/main/src/context_compactor.py)
- `maybe_compact` estimates tokens and compares them to the detected context length. It does nothing if there are fewer than 4 non-system messages. Otherwise it splits the conversation at the midpoint and summarizes the **older half** (each message clipped to 2,000 chars before summarizing), keeping the newer half verbatim. — same source
- The summary is written using a `SELF_SUMMARY_SYSTEM_PROMPT` that asks for sections like User Goal, What Was Done, Current State, Pending / Next Steps and Key Context, under 1,000 tokens. It is stored as a **system message** that starts "[Conversation summary — earlier messages were compacted]", with metadata `{"compacted": True}`. — same source
- **Who summarizes:** "Use utility model if configured, otherwise fall back to session model." In practice it is the user's own LM Studio model unless a separate utility model is set. If the summary call fails, the original messages are returned unchanged. — same source
- After compaction, `trim_for_context` does the following:
  - reserves 512 tokens for the reply
  - drops extra system messages first
  - truncates the main system prompt to 2,000 chars if needed
  - then drops the **oldest** conversation turns while keeping the current user message and recent turns. A code comment reads "Hermes-style: recent context matters more than old context".
  - — same source

**Claude Code**
- "Claude Code manages context automatically as you approach the limit. It clears older tool outputs first, then summarizes the conversation if needed. Your requests and key code snippets are preserved; detailed instructions from early in the conversation may be lost. Put persistent rules in CLAUDE.md rather than relying on conversation history." — [Claude Code: How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works)
- Users can steer it: add a "Compact Instructions" section to CLAUDE.md, or run `/compact focus on the API changes`. `/context` shows what is using space. If a huge file refills context right after each summary, Claude Code "stops auto-compacting after a few attempts and shows an error instead of looping." — same source
- Subagents "work in their own context window… Claude gets back a summary when the subagent finishes". This is another app-level context-saving trick. — same source

**Anthropic API (server-side compaction)**
- "Compaction replaces the older turns of a conversation with a summary that Claude writes on the server, so you need no summarization code of your own." Modes: on demand (beta header `compact-2026-09-04`), at a token threshold, or your own client-side summarizer. — [Anthropic: Compaction overview](https://platform.claude.com/docs/en/build-with-claude/compaction) (beta, version-dependent)
- When input alone exceeds the window: "the API returns a 400 `invalid_request_error` ('prompt is too long') on every model." On Claude 4.5+, if generation hits the limit it stops with `stop_reason: "model_context_window_exceeded"`. The API does **not** silently truncate. — [Anthropic: Context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- "Chat interfaces such as claude.ai can also manage the context window on a rolling 'first in, first out' basis." — same source
- More context is not automatically better: "As token count grows, accuracy and recall degrade, a phenomenon known as *context rot*." — same source

**OpenAI API (server-side compaction)**
- Server-side compaction is enabled with `context_management` / `compact_threshold`. It runs "When the rendered token count crosses the configured threshold". The output is an "encrypted compaction item" that "is opaque and not intended to be human-interpretable". There is also a stateless `/responses/compact` endpoint. — [OpenAI: Compaction](https://developers.openai.com/api/docs/guides/compaction)
- Context window definition: maximum tokens per request covering input, output and reasoning. "Tokens generated in excess of the context window limit may be truncated in API responses." — [OpenAI: Conversation state](https://developers.openai.com/api/docs/guides/conversation-state)

**OpenRouter (relevant to Zed + OpenRouter)**
- OpenRouter's **context compression plugin** (enabled with `plugins: [{ id: "context-compression" }]`) works by "removing or truncating messages from the middle of the prompt, until the prompt fits within the model's context window".
- "All OpenRouter endpoints with 8k (8,192 tokens) or less context length will default to using context compression."
- If compression is disabled and the prompt is too long, the request errors.
- The rationale given is that LLMs pay less attention to the middle of sequences.
- Version note: older docs called this the "middle-out" transform. The current page doesn't use that name.
- Source: [OpenRouter: Message transforms](https://openrouter.ai/docs/guides/features/message-transforms)

**Zed**
- Zed's Agent Panel shows token usage for the active thread. "Once you approach the model's context window, a banner appears above the message editor suggesting to start a new thread with the current one summarized and added as context." There is also a "New from Summary" button under Agent Options. — [Zed docs agent-panel.md (repo mirror, main)](https://git.secluded.site/zed/blob/main/docs/src/ai/agent-panel.md?source=1) (canonical page is zed.dev/docs/ai/agent-panel; I only saw the mirror via search)

### Inferences
- **Who does the compressing?** The *app or service* decides when and what. A model only takes part as a hired summarizer, through a normal request ("summarize these messages"). The output is plain text (or an opaque blob for OpenAI) that gets pasted back into the next request. In Odysseus, that summarizer is usually the same local LM Studio model.
- Truncation (LM Studio policies, OpenRouter, Odysseus `trim_for_context`) **deletes** text. Summarization **rewrites** old text into a shorter version that loses detail. Neither stores anything in the model.
- A pitfall specific to Odysseus + LM Studio: Odysseus compacts based on the context length it *detects* (`get_context_length`). If the LM Studio model was loaded with a smaller context than Odysseus thinks, LM Studio's own overflow handling could kick in first. Tool outputs could also overflow, per the #1806 report. I have not verified this.
- Teaching analogy (my own): a whiteboard with fixed size. When it fills, someone must erase. They might erase the oldest notes (rolling window), the middle (truncate middle), or erase a section and write a short summary in its place (compaction). The whiteboard never becomes the student's brain.

### Gaps
- LM Studio's default overflow policy for the chat UI vs. the server API is not stated in the official docs I found. A third-party blog mentions Rolling Window behavior but is not authoritative. I could not confirm which policy applies to `/v1/chat/completions` requests from Odysseus by default.
- I did not find the exact auto-compaction threshold for Claude Code in the docs. It is not given on the page fetched.
- No source fetched for Codex CLI's auto-compaction behavior. OpenAI's compaction page does not mention Codex.
- How Odysseus's `get_context_length` (in `src/model_context`) detects LM Studio's loaded context length was not checked.

---

## Q3. What are chat templates, and why does a mismatch make a model print `<|im_end|>` or talk as the user?

### Takeaway
A model only ever sees one long token sequence. A **chat template** (a small Jinja program stored in the GGUF/tokenizer metadata) converts the app's list of `{role, content}` messages into that sequence. It adds special marker tokens, such as ChatML's `<|im_start|>user … <|im_end|>`, that the model learned during fine-tuning. The runner also uses a matching **stop token** to know when the reply is over. If the template or stop token is wrong:
- the model may write the end-marker as visible text and keep going,
- it may invent the next "user:" turn (because it is just continuing a transcript), or
- it may continue the user's message instead of answering it.

### Cited Findings
- "The list of `role` and `content` dictionaries that you pass to a chat model get converted to a token sequence, often with control tokens like `<|user|>` or `<|assistant|>` or `<|end_of_message|>`, which allow the model to see the chat structure." Different models use different formats "even if they were fine-tuned from the same base model". — [Hugging Face: Chat templates](https://huggingface.co/docs/transformers/main/en/chat_templating)
- Two Mistral-7B fine-tunes show this. One uses `[INST]…[/INST]` and the other uses `<|user|>`/`<|assistant|>`: "with the wrong control tokens, these models would have drastically worse performance." — [Hugging Face: Chat templates](https://huggingface.co/docs/transformers/main/en/chat_templating)
- The ChatML example from HF:
  ```
  <|im_start|>user
  Hi there!<|im_end|>
  <|im_start|>assistant
  Nice to meet you!<|im_end|>
  <|im_start|>user
  Can I ask a question?<|im_end|>
  <|im_start|>assistant
  ```
  The final `<|im_start|>assistant` is the "generation prompt" (`add_generation_prompt=True`). Without it, "the model may get confused and do something strange, like **continuing** the user's message instead of replying to it!" — [Hugging Face: Chat templates](https://huggingface.co/docs/transformers/main/en/chat_templating)
- HF warns that some tokenizers add `<bos>`/`<eos>` and that "adding additional special tokens is often incorrect or duplicated, hurting model performance." — [Hugging Face: Chat templates](https://huggingface.co/docs/transformers/main/en/chat_templating)
- LM Studio: "By default, LM Studio will automatically configure the prompt template based on the model file's metadata." Jinja is "a templating engine used to encode the prompt template in several popular LLM model file formats."
  - Overriding is needed when "The model does not have a prompt template in its metadata (e.g. custom or older models)", or when metadata is wrong or incomplete.
  - The override is set in My Models → gear icon, either as Jinja or as manual role prefixes and suffixes.
  - "In most cases you don't need to change the prompt template."
  - — [LM Studio: Prompt template](https://lmstudio.ai/docs/app/advanced/prompt-template)
- llama.cpp server: `--jinja` ("whether to use jinja template engine for chat (default: enabled)") and `--chat-template JINJA_TEMPLATE` ("default: template taken from model's metadata"). — [llama.cpp server README](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md)
- Symptoms of a wrong prompt template, per a troubleshooting guide:
  - leaked tags in the output
  - the model writing fake user or assistant turns
  - failure to stop generating
  - The guide says stop tokens must match the model family: `<|eot_id|>` for Llama 3, `<|im_end|>` for ChatML/Qwen, `<end_of_turn>` for Gemma. It says this commonly happens after downloading community GGUFs or converting your own fine-tune.
  - — [LLM Configurator: Wrong prompt template](https://llmconfigurator.com/en/guides/troubleshooting/wrong-prompt-template) (third-party guide; consistent with HF docs but not an official source)
- A Hugging Face discussion on a Llama-3 GGUF traced nonsensical or repeating output to a wrong EOS token ID in the file. — [HF discussion: Llama-3-8B-Instruct-262k GGUF](https://huggingface.co/gradientai/Llama-3-8B-Instruct-262k/discussions/13) (seen in search results only)
- Unsloth's LM Studio guide suggests running `lms log stream` to see the exact prompt LM Studio sends to the model. — [Unsloth: Deploying models to LM Studio](https://unsloth.ai/docs/basics/inference-and-deployment/lm-studio) (seen in search results only)

### Inferences
- Why `<|im_end|>` shows up as text: during fine-tuning, the model learned to *end its turn* by producing the `<|im_end|>` token. The runner is supposed to treat that token as "stop" and hide it. If the runner's stop token is set to a different family's token, or the token is treated as ordinary text (e.g. a broken GGUF tokenizer), the end-marker gets printed and generation continues.
- Why the model "talks as the user": once it has produced `<|im_end|>` and nobody stops it, the most likely next tokens in a chat transcript are `<|im_start|>user`. So it writes the user's next line itself. It is simply continuing the document.
- Relevance for abliterated or community GGUFs: these are re-uploads or modifications of base fine-tunes. A missing or wrong embedded template is a plausible cause of these symptoms. The fix is to set the template or stop string to the original model family's format, which can be checked with `lms log stream`.
- Analogy (my own): the template is like the formatting of a play script ("ROMEO:", "JULIET:", stage directions). The actor was trained on scripts in one format. Hand them a script in another format, or forget to mark where their line ends, and they will keep reading into the next character's lines.

### Gaps
- I did not find an official LM Studio doc page that lists the `<|im_end|>`-leak symptom explicitly. The symptom list comes from a third-party guide.

---

## Q4. KV cache vs. provider prompt caching: what each is, where it lives, why neither is "memory"; pricing basics; llama.cpp/LM Studio reuse; why editing an earlier message forces re-processing

### Takeaway
- **KV cache:** while reading a prompt, the model computes intermediate numbers ("keys and values") for each token. The KV cache stores these numbers so the model doesn't recompute them for every new token. Locally, it lives in the RX 580's VRAM (and/or system RAM). It grows with context length, which is why big context settings eat VRAM.
- **Prompt caching** (Anthropic, OpenAI, and llama.cpp's `cache_prompt`): the runner keeps the KV cache from a *previous request*. If the next request starts with the **exact same prefix**, that part is not reprocessed. On cloud providers it lives on their servers for minutes and makes repeated input cheaper and faster.
- **Neither is memory.** Both are temporary, exact-match, speed and price optimizations. Output is identical with or without them. Nothing is learned. Change one character early in the conversation and everything after that point must be recomputed.

### Cited Findings
**KV cache basics**
- During prefill, the LLM "processes the input tokens to compute the intermediate states (keys and values)." "To avoid recomputing all these tensors for all tokens at each time step, it's possible to cache them in GPU memory." "Growing linearly with batch size and sequence length, the memory requirement can quickly scale." — [NVIDIA: Mastering LLM Techniques: Inference Optimization](https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/)
- Per-token size formula: `2 * (num_layers) * (num_heads * dim_head) * precision_in_bytes`. — [NVIDIA](https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/)
- OpenAI on its prompt cache: "The prompt cache stores key-value (KV) tensors, not the tokens themselves." — [OpenAI: Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)

**llama.cpp / LM Studio prompt cache reuse**
- `cache_prompt`: "Re-use KV cache from a previous request if possible". Only the differing suffix is processed. Default `true`. The docs warn that "enabling this option can cause nondeterministic results" because logits may differ slightly across batch sizes. — [llama.cpp server README](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md)
- `--cache-reuse N`: "min chunk size to attempt reusing from the cache via KV shifting… (default: 0)". `-cram, --cache-ram N`: "set the maximum cache size in MiB (default: 8192, -1 - no limit, 0 - disable)". `--slot-save-path`: "path to save slot kv cache". — [llama.cpp server README](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md)
- Odysseus adds `session_id` and `cache_prompt: true` to requests sent to local OpenAI-compatible servers. Its docstring says "llama.cpp assigns requests to processing slots via LRU when no stable identifier is present", so "consecutive turns of the same chat can land on different slots and lose their cached prefix entirely." "Both fields are llama.cpp / LM Studio extensions to the OpenAI schema" (issue #2927). — [Odysseus src/llm_core.py](https://raw.githubusercontent.com/pewdiepie-archdaemon/odysseus/main/src/llm_core.py)
- A llama.cpp RX 580 user comment shows that the KV cache type (f16 vs q8_0, mixed K/V types) changes speed on Polaris. Mixed types dropped performance sharply. The comment doesn't clearly name the model, so treat as unverified. — [llama.cpp discussion #23109](https://github.com/ggml-org/llama.cpp/discussions/23109) (seen in search summary only)

**Anthropic prompt caching** (version-dependent prices)
- Prefix order and invalidation: "Prompt caching references the entire prompt: `tools`, `system`, and `messages` (in that order)". "Changes at each level invalidate that level and all subsequent levels." Cache hits require "100% identical prompt segments". — [Anthropic: Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- Lifetime: "By default, the cache has a 5-minute lifetime. The cache is refreshed for no additional cost each time the cached content is used." A 1-hour TTL is available "at additional cost". — same source
- Prices relative to base input:
  - 5-minute cache write = 1.25×
  - 1-hour cache write = 2×
  - cache read = 0.1×, with per-model exceptions listed: 0.05× for Opus 5.5 and Sonnet 5.5, and 0.025× for "Claude Fable 5.1" and "Mythos 5.1"
  - Minimum cacheable length varies by model (e.g. 512 tokens for Opus 5.5/Haiku 5.5, 4,096 for Haiku 4.5). Shorter prompts are silently not cached.
  - — same source
- "Caches are isolated between organizations. Different organizations never share caches." — same source
- "Prompt caching has no effect on output token generation. The response you receive is identical to what you would get if prompt caching were not used." — same source
- "Cached prompt prefixes still occupy the context window: prompt caching changes what you pay for those tokens, not whether they count." — [Anthropic: Context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows)

**OpenAI prompt caching** (version-dependent)
- "Prompt caching is enabled by default for supported OpenAI models."
- "The minimum cacheable prompt length is 1,024 tokens for GPT-5.6 and later". Earlier models vary.
- Reused tokens are billed at "the model's reduced cached-input rate… discounted up to 95%."
- "Entries typically remain active for around 5 to 10 minutes of inactivity, up to one hour". Extended retention can keep them "up to 24 hours".
- "Cache reuse requires the entire rendered prefix to match." "Put stable developer instructions and shared reference material first."
- "Prompt caching does not change how the model generates output tokens." "Caches are not shared across organizations".
- Source: [OpenAI: Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)

### Inferences
- **Why editing an earlier message forces reprocessing:** each token's keys and values depend on all tokens before it. So a cache is only valid for an *unchanged prefix*: Anthropic says changes invalidate "that level and all subsequent levels", OpenAI requires "the entire rendered prefix to match", and llama.cpp only skips the matching prefix. Editing message #3 of 40 means messages 3–40 (and everything after) must be prefilled again. On an RX 580 that can take many seconds (Q5).
- The same logic applies to truncation and compaction. When a rolling window drops the oldest messages, or Odysseus replaces the older half with a summary, the *beginning* of the prompt changes. That likely invalidates most of the cached prefix, so the next turn after a trim or compaction is slow. llama.cpp's KV-shifting options (`--cache-reuse`, context shift) are designed to reduce this cost. I have not verified how LM Studio applies them.
- Where each lives:
  - Local KV cache: VRAM/RAM on the learner's PC. It is lost when the model unloads; llama.cpp can also save it to disk.
  - Provider cache: on Anthropic, OpenAI or OpenRouter-routed provider servers, scoped to the org or workspace, expiring after minutes.
  - Neither one can be "remembered" by a new chat unless the new chat begins with exactly the same tokens.
- Back-of-envelope VRAM cost (my calculation; please verify config values): for a Llama-3-8B-style model with grouped-query attention (32 layers, 8 KV heads × 128 dims), FP16 KV ≈ 2 × 32 × 1024 × 2 bytes ≈ 128 KiB per token. That is about 1 GiB at 8,192 tokens and about 4 GiB at 32,768 tokens, on top of the model weights. This is why a large context setting can push a model off an 8 GB card.
- Analogy (my own): the KV cache is like **the scratch work** on a long math problem. If someone changes a number on line 3, every line after it must be redone. Prompt caching is like the teacher **keeping your scratch paper for 5 minutes** in case you hand in the same problem again. It saves time but doesn't make you smarter.

### Gaps
- I did not find LM Studio's own documentation describing how its chat UI or server reuses KV cache between turns. Its llama.cpp engine behavior (`cache_prompt` default true) is documented upstream. LM Studio-specific settings (e.g. KV cache quantization toggles) were not checked.
- OpenRouter's prompt-caching pass-through rules for Zed users were not fetched.

---

## Q5. Prompt processing (prefill) vs. generation (decode) speed, especially on older GPUs via Vulkan

### Takeaway
Every turn has two phases:
- **Prefill** reads the whole prompt in parallel. It is compute-bound and fast per token. llama-bench reports it as "pp".
- **Decode** writes the reply one token at a time. It is limited by memory bandwidth, because the weights must be streamed from VRAM for every new token. llama-bench reports it as "tg".

On the RX 580 (Polaris, 256 GB/s, about 6 TFLOPS FP32, from 2017), the llama.cpp Vulkan scoreboard shows roughly **258 tokens/s prefill** and **39 tokens/s generation** for a 7B Q4_0 model. Long uncached histories therefore cause noticeable "thinking" pauses before the first word appears.

### Cited Findings
- Prefill: "a matrix-matrix operation that's highly parallelized… It effectively saturates GPU utilization." Decode: "the LLM generates output tokens autoregressively one at a time… This is like a matrix-vector operation that underutilizes the GPU compute ability… this is a memory-bound operation." — [NVIDIA: Inference Optimization](https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/)
- llama.cpp Vulkan scoreboard (Llama 2 7B Q4_0, command `llama-bench -m llama-2-7b.Q4_0.gguf -ngl 100 -fa 0,1`):

  | GPU | Mode | pp512 (t/s) | tg128 (t/s) | Commit |
  |---|---|---|---|---|
  | RX 580 | no flash attention | 258.03 | 39.32 | de4c07f |
  | RX 570 | — | 226.11 | 37.44 | — |
  | RX 480 | — | 248.66 | 34.71 | — |
  | RX 7900 XTX (comparison) | no flash attention | 3,726.99 | 182.63 | — |

  The RX 7900 XTX is about 14× faster at prefill but only about 4.6× faster at generation. An RX 470 rerun posted Jul 9, 2026 (build 9934) matched the scoreboard numbers. — [llama.cpp discussion #10879: Performance of llama.cpp with Vulkan](https://github.com/ggml-org/llama.cpp/discussions/10879)
- Conflicting data point: a commenter in another llama.cpp discussion reports about 990 t/s pp512 on an RX 580 with Vulkan (unspecified model and quant; f16 KV ≈ 940 pp512 / 37.1 tg128). This could reflect newer builds or a smaller model. Unverified. — [llama.cpp discussion #23109](https://github.com/ggml-org/llama.cpp/discussions/23109) (search summary only)
- RX 580 8 GB specs:
  - 256-bit bus
  - 256 GB/s memory bandwidth
  - 5,792–6,175 GFLOPS FP32
  - GCN 4th gen, Polaris 20
  - launched April 18, 2017
  - — [Wikipedia: Radeon 500 series](https://en.wikipedia.org/wiki/Radeon_500_series)

### Inferences
- **Rough wait times (my arithmetic from the scoreboard; real numbers vary with model size, quant, context length and build):**
  - A fresh 4,000-token history prefilled at ~250 t/s takes about 16 s before the first reply token.
  - With a cache hit, only the new message (maybe 50 tokens) needs prefill, which takes well under a second.
  - A 300-token reply at ~39 t/s takes about 8 s.
  - This is why the first message after loading a model, after editing an old message, or after compaction feels slow, while normal follow-ups feel quick.
- **Why decode tracks bandwidth (rough upper bound):** a 7B Q4_0 file is about 3.6–3.8 GB, and each generated token reads roughly all of it. 256 GB/s ÷ ~3.7 GB ≈ 70 tokens/s at most; the measured ~39 t/s is a realistic fraction of that.
- **When the model doesn't fit in 8 GB VRAM:** if a model plus its KV cache exceeds 8 GB, LM Studio offloads some layers to the CPU and the 16 GB of system RAM. Decode then slows sharply, because system RAM bandwidth is far lower than VRAM. I have no sourced figure for this specific machine.
- **Analogy (my own):** prefill is like **speed-reading the whole script at once**, where many words are processed in parallel. Decode is like **writing the reply by hand, one word at a time**, where each word requires flipping through the whole "brain" (all the weights) again.

### Gaps
- No RX 580 Vulkan numbers at long contexts (e.g. pp at 8k–16k depth). Prefill and decode both slow as context grows, but I found no RX 580-specific data.
- No source checked for LM Studio's Vulkan runtime version vs. upstream llama.cpp. LM Studio bundles its own llama.cpp builds, so its numbers may differ from the scoreboard.
- No sourced CPU/RAM offload speeds for the Ryzen 5 2600 with 16 GB RAM.

---

## Q6. How do apps implement "memory" across chats? What does Odysseus's persistent memory do?

### Takeaway
"Memory" across chats is always **app-side notes that get pasted back into the prompt**. The model's weights never change. The patterns:
- **Odysseus:** saves short text facts in a `memory.json` file. Each turn it picks up to ~8 "relevant" ones by simple word overlap and inserts them into the context.
- **Claude Code:** loads CLAUDE.md files and the first part of an auto-written MEMORY.md at the start of every session.
- **Anthropic's API:** offers a memory tool pattern in which the model reads and writes files that the app stores.

### Cited Findings
**Odysseus (verified in `src/memory.py`)**
- Memories are stored in `memory.json` in the app's data directory: `self.memory_file = os.path.join(data_dir, "memory.json")`. Writes go to `memory.json.tmp` and are then atomically replaced. A legacy `memory.txt` is migrated. — [Odysseus src/memory.py](https://raw.githubusercontent.com/pewdiepie-archdaemon/odysseus/main/src/memory.py)
- Each entry is a small dict: `id`, `text`, `timestamp`, `source`, `category` (default "fact"), `uses`, plus optional `owner`. — same source
- Retrieval (`get_relevant_memories`) uses **Jaccard word overlap**, `len(query_tokens & memory_tokens) / len(query_tokens | memory_tokens)`, on lowercased, whitespace-split words. **No embeddings.** Keyword lists classify the query as identity, contact, preference, task or fact and apply boosts (e.g. contact ×1.4, preference ×1.3). The defaults are threshold `0.05` and `max_items = 8`. — same source
- `increment_uses` is "Called after a memory has actually been injected into a chat's context". This confirms that memories are used by injecting their text into the context. — same source
- Per DeepWiki's AI code summary (not directly verified), the following happens in `routes/chat_helpers.py`:
  - Memories are injected via `chat_processor.build_context_preface` while the chat context is built, controlled by a `use_memory` flag.
  - New memories are extracted by an LLM call in a background task (`run_post_response_tasks`) "every 4th message pair".
  - There is a fallback `extract_memory_from_chat` "when LLM fails" (this docstring is verified in memory.py).
  - — [DeepWiki: Odysseus file paths](https://deepwiki.com/search/give-exact-file-paths-eg-srcpy_f2d73568-db67-4c18-9a69-ab88d7151d3d)
- The Odysseus README lists "memory" as a Chat + Agents feature alongside "local/API models, tools, MCP, files, shell, skills". — [Odysseus GitHub README](https://github.com/pewdiepie-archdaemon/odysseus)

**Claude Code**
- Claude Code has access to "Your CLAUDE.md. A markdown file where you store project-specific instructions, conventions, and context that Claude should know every session". It also has "Auto memory. Learnings Claude saves automatically as you work, like your preferences. The first 200 lines or 25KB of MEMORY.md, whichever comes first, load at the start of each session." — [Claude Code: How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works)
- "Claude can persist learnings across sessions using auto memory, and you can add your own persistent instructions in CLAUDE.md." — same source

**Anthropic API**
- Anthropic recommends designing "state artifacts so that context recovery is fast when a new session starts" and points to "the memory tool's multisession pattern". — [Anthropic: Context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows)

### Inferences
- In every case the loop is the same:
  1. The app (or the model, through a tool) writes a note to a file or database.
  2. On a later turn, the app selects notes and pastes them into the system prompt or messages.
  3. The model reads them like any other text.
  
  Memory therefore costs context tokens. It can be wrong or stale, and the user can usually view, edit or delete it as a file. That proves it is not in the weights.
- Odysseus's word-overlap retrieval has a consequence: a memory like "User's dog is named Biscuit" may not be pulled in for the question "what's my pet called?", because the words don't overlap, unless a keyword boost catches it. This makes a nice student experiment that shows memory is text retrieval, not understanding. I have not tested it.
- The learner can verify memory is just text: open Odysseus's `memory.json` or Claude Code's CLAUDE.md/MEMORY.md, edit a line, and watch the model's behavior change in the next chat. If memory lived in the weights, editing a text file would do nothing.
- Analogy (my own, consistent with Karpathy's Memento framing): like the main character of *Memento* writing notes and tattoos to read each morning. The notes are the memory; his brain (the weights) never changes.

### Gaps
- I did not directly read Odysseus's `routes/chat_helpers.py` to confirm how often memories are extracted, which model extracts them, or the exact prompt wording used when injecting memories.
- No sources fetched on Zed or Codex cross-chat memory features. OpenAI ChatGPT memory and Codex AGENTS.md were not researched.
