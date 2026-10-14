# Question log

Every question asked so far, with the owner's answer. **Check this before writing new questions. Never repeat one.**
Results: ✓ right, ✗ wrong, ? not sure, ~ partly right. Rounds marked *biased* had the right answer as the longest option, so they don't count as proof.

## Local Claude Code session, 2026-10-13 to 14

### Placement (biased)
| Q | Answer | Result |
|---|---|---|
| What a language model does when replying | Predicting next words ("but I treat it like thinking") | ✓ |
| Why a bot forgets your name after 50 messages | Ran out of room | ✓ |
| How a local model knows its name and app | "Tell it, or give it a tool to check" | ✓ |
| Why AI is confidently wrong | Sounds right, isn't checked | ✓ |
| Best prompt for a small model | Specific with an example | ✓ |
| What a system prompt is | Hidden standing instructions | ✓ |
| Which layer decides the tools (LM Studio + Odysseus) | Odysseus | ✓ |
| What decides whether a model runs well | VRAM | ✓ |
| What happens on a web search tool call | "Uses the tool to get context; better behind permission" | ~ |
| What MCP is | "Not sure, don't know plugin vs. repo vs. MCP" | ? |
| 20 steps at 95% each | About 35% | ✓ |

### Lesson checks (biased)
| Q | Answer | Result |
|---|---|---|
| "Sure, let me search..." before a query is given | "Words trigger actions; good for worker agents" | ✓ |
| Stop made-up facts about notes | Put the notes in front of it | ✓ |
| 500 + 2,000 + 6,000 tokens in an 8k window | Over the limit, no room | ✓ |
| A rule from message 1 is ignored by message 40 | Put it in the system prompt | ✓ |
| Rules only vs. rules plus examples | Rules plus examples | ✓ |
| Pasted article contains instructions | Mixed up instructions and data (hadn't heard of it) | ~ |
| Prompt in place, still searches on "can you" | "Better to just remove the tool" | ~ |
| Stop dangerous terminal commands | Bash off or approval required | ✓ |

### Assessment rounds A to C (biased)
| Q | Answer | Result |
|---|---|---|
| Same model behaves differently in LM Studio vs. Odysseus | Different layers ("can't LM Studio add context too?") | ✓ |
| Zed and VS Code vs. Claude Code | "Same thing? This is what confuses me" | ? |
| What a GitHub repo is | "Tools to software projects" | ~ |
| Plugin vs. MCP vs. skill | Not sure | ? |
| Which coding agents they've used | Claude Code, Codex, editor AI | n/a |
| Chatbot vs. agent | "The agent is coded to use the model better" | ~ |
| Local model in a coding agent | "Zed was cooking" (it used a cloud model through OpenRouter) | n/a |
| Local setup state | Works okay; worried the abliterated model could be "evil" | n/a |

### Rounds 1 to 9 (biased)
| Q | Answer | Result |
|---|---|---|
| OpenRouter | One gateway, many models | ✓ |
| Rename across 40 files plus tests | VS Code or Claude Code/Codex "with tools like Playwright" | ~ |
| One calendar for Odysseus and Claude Code | "Claude Code connects to Google, whatever that is" | ? |
| clone + npm install | Not sure | ? |
| Connectors vs. MCP | "Don't know how tools, connectors, MCP and plugins relate" | ? |
| Playwright | Controls a browser | ✓ |
| What git does | Not sure | ? |
| Undo an agent's changes | git revert | ✓ |
| API key | Password for programs | ✓ |
| RAG | Not sure | ? |
| Fine-tuning vs. system prompt | "Know they differ, not how" | ~ |
| localhost vs. deploy | Only you vs. everyone | ✓ |
| A3B | Not sure | ? |
| `<\|im_end\|>` leaking | Not enough VRAM | ✗ |
| Subagent | Separate context for a side task | ✓ |
| Forgetting in long agent sessions | Compaction, and a memory file helps | ✓ |
| Biggest pre-launch risk | Exposed secrets | ✓ |
| Frontend vs. backend | Browser vs. server | ✓ |
| "Make my app better" | Random, broad changes | ✓ |
| Most useful non-coder skill | Test it and find the flaw | ✓ |
| Random MCP server security | "Still don't know how tools, connectors, MCP and prompts interact" | ? |
| Reasoning-model cost | Hidden thinking tokens | ✓ |
| .env + .gitignore | "Encrypt it" | ✗ |
| Reliable JSON output | "Don't know what JSON is" | ? |
| API | Programs talking | ✓ |
| localhost:1234 | A port | ✓ |
| Terminal | Text commands | ✓ |
| API pricing | Per token, in and out | ✓ |
| Open weights | Not sure | ? |
| Embeddings | Not sure | ? |
| Fair prompt comparison | "Test, test, test, compare multiple runs" | ~ |
| Images in LM Studio | Only with a vision model | ✓ |
| Morning email automation | Scheduled automation | ✓ |
| Free website hosting | A hosting service | ✓ |
| RLHF | Picked the longest option (noticed the pattern) | ? |
| Knowledge cutoff | Not sure | ? |

### Round 10 onward (fair options)
| Q | Answer | Result |
|---|---|---|
| 10k document in an 8k window | "Compressed into memory" | ✗ |
| What the model receives for a web-search tool | "Some tools search, some click, some beat bot checks" | ? |
| Q4_K_M vs. Q8_0 | Not sure | ? |
| School schedule hallucination fix | Put the real schedule in context | ✓ |
| System prompt | Instructions sent every message | ✓ |
| 8B fast but 14B crawls | "Aren't 'too weak' and 'doesn't fit' the same?" | ✗ |
| Chatbot vs. agent | Loop with tools ("which gives it memory") | ✓ |
| Small-model sorting | A few sorted examples | ✓ |
| What temperature changes | Randomness of picks | ✓ |
| What abliteration changed | Removed refusals | ✓ |
| Hidden "delete files" on a web page | "Sounds like a virus" | ✗ |
| Token | A chunk of text | ✓ |
| Frontend/backend (re-check) | Browser vs. server | ✓ |
| Subagent (re-check) | Side task, own context | ✓ |
| Leaked API key | Others use it as you | ✓ |
| Morning task (re-check) | Trigger or schedule | ✓ |
| Where Zed's OpenRouter model ran | A provider's servers | ✓ |
| How image generators work | Pixel by pixel | ✗ |
| How prompt caching works | Model memory | ✗ |
| Leaderboard caution | May not match your tasks | ✓ |
| AI detectors | Unreliable | ✓ |
| Local voice assistant | Three steps chained | ✓ |
| How small models get capable | Hedged between distillation and compression (DeepSeek interest) | ? |
| Free-tier privacy | Possibly stored and used | ✓ |
| NVIDIA/CUDA vs. the RX 580 | "I'm cooked" | ~ |
| LM Studio vs. Ollama | Both runners; Ollama also does cloud | ✓ |
| .safetensors vs. GGUF | Not sure | ? |
| When local beats cloud | Private, simple, repeated | ✓ |
| AI copyright | Unsettled, varies by country | ✓ |
| AI statistic with a link | Compare to other sources | ✓ |
| Non-commercial license | Use it, but not to make money | ✓ |
| Context engineering | Not sure | ? |

### Weak-side rounds W1 to W3 (fair options)
| Q | Answer | Result |
|---|---|---|
| Which is the model | Qwen3 8B | ✓ |
| Where the chat lives between messages | In the model's weights | ✗ |
| What weights are | Learned numbers | ✓ |
| What a package is | Reusable code by others | ✓ |
| Do weights change while chatting | No, fixed | ✓ |
| Odysseus vs. LM Studio jobs | LM Studio runs, Odysseus orchestrates | ✓ |
| Memory across chats | Saved notes added back | ✓ |
| package.json | Compressed project | ✗ |
| What LM Studio receives on message 10 | Not sure | ? |
| Where tool code runs | In the app, after the model asks | ✓ |
| 500 notes in an 8k context | Search for related ones | ✓ |
| What an MCP server is | "Something the model can't do itself; Higgsfield, so paid tools?" | ~ |

## Yo cloud chat, 2026-10-13 to 14
The full questions and answers are in `2026-10-14-yo-session-transcript.md` (user turns 38 and 46 to 55). Results are in `ai-from-the-ground-up-progress.md`. Topics asked there: git/GitHub, decompiling vs. embedding, quantization sizes, A3B, provider weights, RLHF, skill vs. MCP, memory, agent compounding (35%), 16B at Q2 vs. 9B at Q4, the app fulfilling requests, context shortening, pinning, LoRA, embeddings as space, diffusion, the lethal trifecta, and the system prompt / RAG / fine-tune cost order.

## Tutor cycle 1: AI layering and tools (2026-10-14, re-gauge at the owner's request, fair options)
| Q | Answer | Result |
|---|---|---|
| L1 What LM Studio receives on message 10 | Only message 10 | ✗ (3rd miss on statelessness) |
| L2 Zed AI panel vs. Claude Code | Assistant vs. agent | ✓ |
| L3 Connector vs. MCP | A connector is a remote MCP server | ✓ |
| L4 40-tool MCP server in LM Studio | 40 text descriptions in the package | ✓ |
| M1 What a plugin is | A bundle ("but how do the layers work together?") | ✓ |
| M2 Upload with an official API available | Use the API | ✓ |
| M3 Injected "delete the project folder" | Delete off or gated | ✓ |
| M4 Odysseus at 85% context | Older half summarized | ✓ |
| N1 Order of skill + tool events | Not sure | ? |
| N2 Skill vs. system prompt conflict | Nothing guarantees it | ✓ |
| N3 Local to OpenRouter: which layers change | Model and provider | ✓ |
| N4 Same REA server, different results in different apps | "Repos are built for Claude Code" | ~ |

### Cycle 1 re-test #1 (2026-10-14)
| Q | Answer | Result |
|---|---|---|
| R1 System prompt changed mid-chat: does the model see it? | "No, it kept the old one" | ✗ |
| R2 Switch to a cloud model mid-chat: does it see earlier messages? | "Only a summary" | ✗ |
| R3 Claude Code needs an unseen file | "It just starts searching everywhere if given permission" | ~ (the app does the searching) |
| R4 Which layer saves chat history | "Cache and app" (wants to learn changing weights too) | ~ (app yes, cache no) |

### Cycle 1 re-test #2 (2026-10-14)
| Q | Answer | Result |
|---|---|---|
| Q1 Delete the "favorite color" message in Odysseus, then ask | "It still knows" (reason given: the model remembered) | ✗ reason. Question flawed: Odysseus memory could re-insert it |
| Q2 Claude Code + Opus: which part has zero memory | Opus, the model | ✓ |
| Q3 Janitor lorebook dragon info goes where | Into the package ("how hard is cache engineering?") | ✓ |
| F1 Plain LM Studio: delete the name message, then ask | "It knows: the cache kept it" | ✗ then disproved live (see below) |
| F2 Odysseus knows the color in a new chat | The app's memory file | ✓ |

**Live experiment (2026-10-14):** on qwen3.5-9b-abliterated through LM Studio's server. Request A (name included, 47 tokens) answered "Your name is Alex." Request B, sent right after with the cache warm and the name deleted (25 tokens), answered "I don't know your name." Proves the cache is not memory.

## Tutor cycle 2: context overflow (2026-10-14)
| Q | Answer | Result |
|---|---|---|
| G1 Long Odysseus chat past its context: who decides what gets shortened | The app's rules | ✓ |
| G2 LM Studio "truncate middle": what the model still sees | "trunacate whonucate" (didn't know the word) | ? vocabulary: truncate = cut off |
| G3 Risk of Odysseus summarizing the older half | Details lost or changed | ✓ |

## Restart lesson 1: Claude Code basics (2026-10-14)
| Q | Answer | Result |
|---|---|---|
| C1 What part of Claude Code ran the LM Studio name experiment | "Don't even know what this context is" | ? (never noticed the tool-call boxes) |
| C2 What changed after /model Sonnet to Opus | "Opus is better reasoning" | ~ |
| C3 Where an "answer first" rule belongs | In CLAUDE.md | ✓ |
| D1 What the small labeled boxes in the chat are | "Tips from the app" | ✗ then live demo of a tool call |
| D2 What stayed the same after switching models | App, chat and notes | ✓ |
