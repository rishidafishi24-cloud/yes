# Tools, MCP servers, connectors, plugins and skills in AI apps: how they relate, layer and interfere (as of October 13, 2026)

Scope note for the report writer: these notes are for a beginner (a high school student who doesn't code) who uses Claude Code, Codex, Zed (cloud model via OpenRouter), LM Studio and Odysseus, plus the REA MCP server and the Higgsfield MCP. Many details depend on the version, so each one is flagged where it appears. The MCP spec changed significantly in July 2026, so older tutorials will contradict parts of it.

## 1. Tool and function calling: what the model receives, how it emits a call, and how the app runs it

### Takeaway
The model never runs anything. The app sends it a text list of tool names, descriptions and JSON Schema parameter definitions. The model replies with a structured request ("call tool X with these arguments") and stops. The app, or for some built-in tools the provider's servers, runs the code and pastes the result back into the conversation as more input. The model then continues. Every tool definition and every result is text that takes up context space and is billed as input tokens.

### Cited Findings
- Anthropic's definition: "Tool use (also called function calling) lets Claude call functions that you define or that Anthropic provides. Claude determines when to call a tool based on the user's request and the tool's description. It then returns a structured call that your application executes (client tools) or that Anthropic executes (server tools)." — [Anthropic: Tool use overview](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
- What the model receives: each tool is sent as a `name`, a `description` and an `input_schema` (JSON Schema). The documented example has `"name": "get_weather"`, `"description": "Get the current weather for a given location."` and an `input_schema` with a required `location` string. — [Anthropic: Tool use overview](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
- How the call is emitted: for client tools, "Claude responds with `stop_reason: "tool_use"` and one or more `tool_use` blocks. Your code executes the operation and sends back a `tool_result`." A `tool_use` block has the form `{"type":"tool_use","id":"toolu_...","name":"get_weather","input":{"location":"New York, NY",...}}`. The result goes back in a user-role message as `{"type":"tool_result","tool_use_id":..., "content": ...}`. — [Anthropic: Tool use overview](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
- Where the code runs: "Tools differ primarily by where the code executes. Client tools (including user-defined tools and tools with Anthropic-defined schemas, such as bash and text_editor) run in your application… Server tools (such as web_search, web_fetch, code_execution, and tool_search) run on Anthropic's infrastructure." — [Anthropic: Tool use overview](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
- Hidden overhead: "When you use tools, the API also automatically includes a special system prompt for the model that enables tool use." This adds 286 tokens for Claude Opus 5.5 and Sonnet 5.5 (tool_choice auto/none) and 675 for Opus 4.7, plus the tokens for the tool names, descriptions and schemas themselves. Tool definitions, `tool_use` blocks and `tool_result` blocks all count as tokens. — [Anthropic: Tool use overview (Pricing)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
- When the model decides to call: with the default `tool_choice: auto`, "Claude determines on each turn whether to call a tool or respond directly. It calls a tool when the request maps to that tool's described capability and the answer isn't already in context." Weaker models may guess missing parameters, for example inventing "New York, NY" when no location was given. — [Anthropic: Tool use overview](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
- `strict: true` on a tool definition guarantees "Claude's tool calls always match your schema exactly." — [Anthropic: Tool use overview](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
- OpenAI describes the same loop in 5 steps: (1) define tools in the request, (2) the model returns a `function_call` item, (3) the app runs the code, (4) the app sends the output back in a second request, (5) the model gives a final response "(or more tool calls)". Function tools have `type: "function"`, `name`, `description`, `parameters` (a "JSON schema defining the function's input arguments") and `strict`. — [OpenAI: Function calling guide](https://developers.openai.com/api/docs/guides/function-calling)
- OpenAI states the context cost directly: function definitions are injected into the system message, so "callable function definitions count against the model's context limit and are billed as input tokens." — [OpenAI: Function calling guide](https://developers.openai.com/api/docs/guides/function-calling)
- In MCP terms, tools are "Functions for the AI model to execute", and the spec warns that "Tools represent arbitrary code execution and must be treated with appropriate caution." — [MCP Specification (2026-07-28)](https://modelcontextprotocol.io/specification/latest)

### Inferences
- The student's mental model ("tools run in the app, not the model") is correct, with one refinement. Code can run in 3 places: (a) on their own computer, for client tools like bash and file edits and for local MCP servers like REA; (b) on the AI provider's servers, for server tools like Anthropic's web_search and for claude.ai connectors, which are called from Anthropic's cloud (see section 3); (c) on a third party's servers, for remote MCP servers like Higgsfield. In every case the model only writes the request and reads the result.
- Analogy for a beginner: the tool list is a restaurant menu (names plus descriptions) handed to the model with every message. The model writes an order slip (the tool call). The kitchen (the app or a server) cooks it. The plate (the result) comes back to the table. A longer menu costs more to "read" every turn and makes picking the right dish harder (see section 4).
- A tool description works like a prompt the model reads and trusts. That is why poisoned descriptions are an attack vector (see section 5).

### Gaps
- Exactly how each app (Zed via OpenRouter, LM Studio, Odysseus) serializes tool schemas into the prompt for non-Anthropic and non-OpenAI models was not researched. Local models use chat-template-specific tool formats.
- The Opus 5.5 and Sonnet 5.5 rows of Anthropic's table have no value in the "any/tool" column (blank in the source).

## 2. MCP: what it is, current spec version and governance, client vs server, local vs remote, primitives, and config formats

### Takeaway
MCP (Model Context Protocol) is an open, JSON-RPC-based standard that Anthropic announced on November 25, 2024. It gives any AI app (the "host") one uniform way to plug in external tool and data providers ("servers"). Since December 2025 it has been governed under the Linux Foundation's Agentic AI Foundation. The current spec revision is 2026-07-28. It made the protocol stateless, deprecated the Sampling, Roots and Logging features, and moved Tasks into an extension. Servers run either locally as a child process over stdio (REA) or remotely over Streamable HTTP with OAuth (Higgsfield). Most apps configure them with a JSON `mcpServers` block. Codex uses TOML and Zed uses `context_servers`.

### Cited Findings
**Origin and definition**
- Announced November 25, 2024: "The Model Context Protocol is an open standard that enables developers to build secure, two-way connections" between data sources and AI-powered tools. Developers "expose their data through MCP servers or build AI applications (MCP clients) that connect to these servers", "replacing fragmented integrations with a single protocol." — [Anthropic: Introducing the Model Context Protocol](https://www.anthropic.com/news/model-context-protocol)
- The spec's own definition: MCP "is an open protocol that enables seamless integration between LLM applications and external data sources and tools." It "takes some inspiration from the Language Server Protocol." — [MCP Specification (latest = 2026-07-28)](https://modelcontextprotocol.io/specification/latest)

**Roles (host, client, server)**
- "The protocol uses JSON-RPC 2.0 messages to establish communication between: Hosts: LLM applications that initiate connections; Clients: Connectors within the host application; Servers: Services that provide context and capabilities." — [MCP Specification](https://modelcontextprotocol.io/specification/latest)
- Terminology collision worth teaching: the spec uses the word "connectors" for MCP *clients* inside the host. Claude's product uses "connectors" for the user-facing integrations that point at (remote) MCP *servers* (see section 3). — [MCP Specification](https://modelcontextprotocol.io/specification/latest); [Claude Help: custom connectors](https://support.claude.com/en/articles/11175166-about-custom-connectors-using-remote-mcp)

**Primitives**
- Servers can offer: "Resources: Context and data, for the user or the AI model to use; Prompts: Templated messages and workflows for users; Tools: Functions for the AI model to execute." Clients can offer "Elicitation: Server-initiated requests for additional information from users." — [MCP Specification (2026-07-28)](https://modelcontextprotocol.io/specification/latest)
- In Claude Code, resources show up as `@server:protocol://path` mentions and prompts show up as slash commands, `/mcp__servername__promptname` (listed as `/servername:promptname (MCP)`). — [Claude Code docs: MCP](https://code.claude.com/docs/en/mcp)
- Optional extensions in 2026: Tasks (async long-running operations), "Skills over MCP" (a working group on structured agent instructions delivered through MCP) and MCP Apps (interactive UI rendered inline). — [MCP Specification](https://modelcontextprotocol.io/specification/latest)

**Current version and what changed (version-dependent)**
- The current spec is 2026-07-28 (schema at `schema/2026-07-28/schema.ts`). The previous revision was 2025-11-25. — [MCP Spec changelog 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/changelog)
- Major 2026-07-28 changes:
  - Protocol-level sessions and the `Mcp-Session-Id` header were removed.
  - "Make MCP stateless: remove the initialize/notifications/initialized handshake." Each request now carries its protocol version and capabilities in `_meta`.
  - A new `server/discover` RPC was added.
  - Experimental tasks moved into an official extension.
  - A Multi Round-Trip Requests pattern replaces server-initiated requests such as `sampling/createMessage` and `elicitation/create`.
  - SSE resumability was removed.
  - **Deprecated:** Roots, Sampling and Logging; the old HTTP+SSE transport (deprecated since 2025-03-26); and OAuth Dynamic Client Registration, in favor of Client ID Metadata Documents.
  - "Servers SHOULD return tools from tools/list in a deterministic order to enable client-side caching and improve LLM prompt cache hit rates."

  — [MCP Spec changelog 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/changelog)
- Claude Code supports the new revision on some connections: "On connections that use protocol revision 2026-07-28, Claude Code declares elicitation: {form: {}, url: {}} in its client capabilities." — [Claude Code docs: MCP](https://code.claude.com/docs/en/mcp)

**Governance**
- Anthropic donated MCP to the Linux Foundation's new Agentic AI Foundation (AAIF), announced December 9, 2025. The AAIF is a directed fund co-founded by Anthropic, Block and OpenAI, with support from Google, Microsoft, AWS, Cloudflare and Bloomberg. Sibling projects include Block's goose and OpenAI's AGENTS.md. Existing maintainers and processes continue. — [IT Brief: Anthropic donates MCP to new Agentic AI Foundation](https://itbrief.co.uk/story/anthropic-donates-mcp-to-new-agentic-ai-foundation); [Glama: MCP moves to the Linux Foundation](https://glama.ai/blog/2025-12-15-mcp-moves-to-the-linux-foundation-neutral-stewardship-for-agentic-infrastructure) (secondary sources; the primary LF/Anthropic press releases were not fetched)
- The 2026-07-28 revision adopted a formal "feature lifecycle and deprecation policy" with Active, Deprecated and Removed states and "a minimum twelve-month deprecation window". It also formalized a PR-based SEP (Spec Enhancement Proposal) workflow. — [MCP Spec changelog 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/changelog)

**Local (stdio) vs remote (HTTP)**
- Claude Code's documented transports: remote HTTP (recommended) `claude mcp add --transport http notion https://mcp.notion.com/mcp`; local stdio `claude mcp add --transport stdio airtable -- npx -y airtable-mcp-server` (the `--` separates Claude's options from the server's launch command); SSE (deprecated); and WebSocket via `add-json`. — [Claude Code docs: MCP](https://code.claude.com/docs/en/mcp)
- In Codex, STDIO servers use `command`/`args`/`env` and Streamable HTTP servers use `url` (plus optional `bearer_token_env_var`). OAuth works through `codex mcp login <server-name>`. — [OpenAI Codex docs: MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)
- Remote servers on claude.ai are called "from Anthropic's cloud infrastructure, rather than from your local device", so a local npx server cannot be a claude.ai custom connector. — [Claude Help: custom connectors (remote MCP)](https://support.claude.com/en/articles/11175166-about-custom-connectors-using-remote-mcp)

**Config formats (the "same idea, different file" problem)**
- Claude Code project config `.mcp.json`: `{"mcpServers": {"shared-server": {"type": "http", "url": "https://example.com/mcp"}}}`. Scopes are local (default, stored in `~/.claude.json`), project (`.mcp.json`, shared via git) and user (`~/.claude.json`, all projects). Supports `${VAR}` and `${VAR:-default}` expansion. — [Claude Code docs: MCP](https://code.claude.com/docs/en/mcp)
- Generic `mcpServers` block for a stdio server (REA's example): `{"mcpServers": {"rea": {"command": "npx", "args": ["-y", "rea-agents@6.4.0", "mcp"]}}}`. — [REA docs: installation.md](https://github.com/morluto/rea/blob/main/docs/installation.md)
- Codex `~/.codex/config.toml` (or `.codex/config.toml` for trusted projects): `[mcp_servers.context7]` then `command = "npx"`, `args = ["-y", "@upstash/context7-mcp"]`. HTTP form: `[mcp_servers.figma]` then `url = "https://mcp.figma.com/mcp"`, `bearer_token_env_var = "FIGMA_OAUTH_TOKEN"`. — [OpenAI Codex docs: MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)
- LM Studio "follows Cursor's mcp.json notation" (an `mcpServers` object). You edit it through the Program tab, then Install, then Edit mcp.json. — [LM Studio docs: MCP](https://lmstudio.ai/docs/app/mcp)
- Zed uses a `context_servers` key in `settings.json`, not `mcpServers`, with `command`/`args`/`env` per server. — [Grafana docs: Zed MCP client](https://grafana.com/docs/grafana-cloud/machine-learning/mcp/clients/zed.md); [fast.io: Zed MCP setup](https://fast.io/resources/zed-mcp-server-setup-guide.md) (third-party sources; Zed's own docs were not fetched)
- Claude Desktop's local servers live in `claude_desktop_config.json`, which is "a separate mechanism" from remote connectors. — [Claude Help: custom connectors](https://support.claude.com/en/articles/11175166-about-custom-connectors-using-remote-mcp)

### Inferences
- Beginner framing: MCP is a "USB standard for AI tools". The app (host) has a built-in MCP client, like a USB port. Each MCP server is a device you plug in. The server tells the app "here are my tools", and the app passes those tool descriptions to the model as ordinary tool definitions (section 1). So MCP doesn't change how the model calls tools. It standardizes how apps *get* tools from outside programs.
- REA is a local stdio server: the app launches `npx rea-agents mcp` as a child process on the student's PC. Higgsfield is a remote HTTP server: the app talks over the internet to `mcp.higgsfield.ai` and logs in with OAuth.
- Because of the 2026-07-28 changes, tutorials from 2025 that mention `initialize` handshakes, SSE endpoints or sampling are describing older behavior. That matters for reading docs, not for day-to-day use.

### Gaps
- Which spec revision each client implements (Codex, LM Studio, Zed, Odysseus) was not verified. Mixed-version compatibility relies on `server/discover` and backward compatibility, and real-world behavior wasn't checked.
- The primary Linux Foundation and Anthropic press releases on AAIF were not fetched. The governance details come from secondary reporting.
- The official LM Studio page shows only a remote (`url` + `headers`) example. The stdio `command`/`args` shape is implied by "Cursor notation" but was not shown verbatim (see section 3).

## 3. Connectors vs MCP; plugins, Agent Skills, slash commands and subagents; Codex, LM Studio, Odysseus (and Zed) equivalents

### Takeaway
In Claude apps, a connector is a product-level name for a (usually remote) MCP server you've linked to your account. Custom connectors are explicitly remote MCP servers, and Claude Code treats claude.ai connectors as one more source of MCP servers. The other concepts sit on different layers:
- **Skills** (SKILL.md) are instruction packs, not tools. Only their name and description stay loaded until used (progressive disclosure).
- **Slash commands** are user-triggered shortcuts. In Claude Code they have been merged into skills.
- **Subagents** are separate AI workers with their own context that the main agent delegates to.
- **Hooks** are scripts the app runs automatically at lifecycle events.
- **Plugins** are just packaging: one installable bundle that can contain skills, subagents, hooks and MCP servers.

Codex mirrors this with config.toml MCP servers, SKILL.md skills, plugins as the distribution unit, and AGENTS.md. LM Studio is an MCP host using `mcp.json`. Odysseus has built-in shell, file, web search and memory tools plus MCP.

### Cited Findings
**Claude connectors are MCP**
- "Custom connectors let you connect Claude directly to the tools and data sources that matter most to your workflows" via remote MCP. "Claude connects to your remote MCP server from Anthropic's cloud infrastructure, rather than from your local device." They are available on Claude, Cowork and Claude Desktop for Free, Pro, Max, Team and Enterprise; Free users get one custom connector. — [Claude Help: About custom connectors using remote MCP](https://support.claude.com/en/articles/11175166-about-custom-connectors-using-remote-mcp)
- "Local MCP servers configured in Claude Desktop via claude_desktop_config.json are a separate mechanism" and are not available in Cowork or claude.ai. — [Claude Help: custom connectors](https://support.claude.com/en/articles/11175166-about-custom-connectors-using-remote-mcp)
- Claude Code lists claude.ai connectors as an MCP source. Precedence when the same server is defined twice is "local, then project, then user, then plugin-provided servers, then claude.ai connectors. The entire server entry from that source is used; fields are not merged across scopes." — [Claude Code docs: MCP](https://code.claude.com/docs/en/mcp)
- The Anthropic API also has an "MCP connector" server tool to "Connect to remote MCP servers from the Messages API without a separate MCP client." — [Anthropic: Tool use overview](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
- Some secondary sources still call custom connectors "beta" and list fewer plans. The current help article lists all plans. — [Boomi: Connect Claude setup](https://help.boomi.com/docs/Atomsphere/Connect/MCPSetup/Connect_claude_setup) vs [Claude Help](https://support.claude.com/en/articles/11175166-about-custom-connectors-using-remote-mcp)

**Claude Code plugins**
- "A Claude Code plugin is a directory of skills, agents, hooks, MCP servers, or other components that Claude Code installs and loads as one unit. Most plugins come from a marketplace." The manifest is `.claude-plugin/plugin.json`. Components:
  - Skills: `SKILL.md` instructions.
  - Agents: "subagent definitions Claude can delegate to".
  - Hooks: "commands Claude Code runs at points in its lifecycle".
  - A hooks module (a "mod").
  - MCP servers: "tool servers Claude Code connects to while the plugin is enabled".

  — [Claude Code docs: Plugins overview](https://code.claude.com/docs/en/plugins)
- "Skills, subagents, hooks, and MCP servers all work on their own, without a plugin… Use a plugin when you want several… packaged as one unit." — [Claude Code docs: Plugins overview](https://code.claude.com/docs/en/plugins)
- Plugin MCP servers are defined in `.mcp.json` at the plugin root or inline in `plugin.json`. They start automatically when the plugin is enabled. Tool names become `mcp__plugin_<plugin-name>_<server-name>__<tool-name>`. — [Claude Code docs: MCP](https://code.claude.com/docs/en/mcp)
- A marketplace is "a catalog, not a hosted store" (`.claude-plugin/marketplace.json`). There are official, community and third-party tiers. "Whatever the tier, a plugin you install can run code with your user privileges." — [Claude Code docs: Plugins overview](https://code.claude.com/docs/en/plugins)

**Agent Skills (SKILL.md)**
- "Skills extend what Claude can do. Create a SKILL.md file with instructions, and Claude adds it to its toolkit. Claude uses skills when relevant, or you can invoke one directly with /skill-name." — [Claude Code docs: Skills](https://code.claude.com/docs/en/skills)
- Progressive disclosure:
  - The name and description are always in context. The combined description and when_to_use text "is truncated at 1,536 characters in the skill listing".
  - The full SKILL.md body loads when the skill is invoked.
  - Supporting files (`reference.md` and so on) load on demand. Keep `SKILL.md` under 500 lines.
  - "Unlike CLAUDE.md content, a skill's body loads only when it's used."

  — [Claude Code docs: Skills](https://code.claude.com/docs/en/skills)
- Locations: personal `~/.claude/skills/<name>/SKILL.md`, project `.claude/skills/...`, plugin `<plugin>/skills/...` (invoked as `/plugin-name:skill-name`), plus enterprise and claude.ai-synced skills. — [Claude Code docs: Skills](https://code.claude.com/docs/en/skills)
- Open standard: "Claude Code skills follow the Agent Skills (agentskills.io) open standard, which works across multiple AI tools." — [Claude Code docs: Skills](https://code.claude.com/docs/en/skills)
- Slash commands: "Custom commands have been merged into skills. A file at .claude/commands/deploy.md and a skill at .claude/skills/deploy/SKILL.md both create /deploy and work the same way." — [Claude Code docs: Skills](https://code.claude.com/docs/en/skills)
- Subagents: `context: fork` runs a skill in an isolated subagent (`Explore`, `Plan`, `general-purpose` or custom). The subagent "doesn't see your conversation history, so the skill's instructions have to stand on their own." — [Claude Code docs: Skills](https://code.claude.com/docs/en/skills)
- MCP prompts appear as commands and "can collide with skill names". — [Claude Code docs: Skills](https://code.claude.com/docs/en/skills); [Claude Code docs: MCP](https://code.claude.com/docs/en/mcp)
- MCP is also working on "Skills over MCP" as an extension. — [MCP Specification](https://modelcontextprotocol.io/specification/latest)

**Codex equivalents**
- MCP: one shared config for the ChatGPT desktop app, Codex CLI and IDE extension (`~/.codex/config.toml`, `[mcp_servers.<name>]`). Commands are `codex mcp add context7 -- npx -y @upstash/context7-mcp`, `codex mcp list` and `/mcp` in the TUI. Per-server `enabled_tools` (allow list) and `disabled_tools` (deny list), `startup_timeout_sec` (default 10) and `tool_timeout_sec` (default 60). `enabled = false` turns a server off without deleting it. "ChatGPT web uses MCP-backed tools supplied by plugins instead of reading local config." — [OpenAI Codex docs: MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)
- Plugins "can bundle their own MCP servers". — [OpenAI Codex docs: MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)
- Skills: a skill "packages instructions, resources, and optional scripts". Discovery is staged: Codex starts with name, description and path and loads the full SKILL.md only when it uses the skill. The skills list is capped at roughly 2% of the context window (8,000 characters if unknown). "Plugins are the installable distribution unit for reusable skills and apps in Codex." AGENTS.md holds global and repo instructions. — [OpenAI Codex docs: Agent Skills](https://developers.openai.com/codex/skills.md); [OpenAI Codex: Customization](https://developers.openai.com/codex/concepts/customization) (via search summary; conflicting skill folder paths exist across older docs: `~/.codex/skills` vs `.agents/skills`; verify against the live page)
- One third-party source dates the Codex plugin system to March 26, 2026 (unverified). — [Daniel Vaughan: Codex Plugins](https://codex.danielvaughan.com/2026/04/01/codex-plugins-skills-mcp-authoring)

**LM Studio**
- LM Studio has been an MCP Host since 0.3.17 (June 2025), supporting local and remote servers. Config is `mcp.json` in Cursor notation. There is an "Add to LM Studio" deeplink button. — [LM Studio docs: MCP](https://lmstudio.ai/docs/app/mcp); [LM Studio 0.3.17 changelog](https://lmstudio.ai/changelog/lmstudio-v0.3.17)
- When a model calls a tool, LM Studio shows a confirmation dialog where you can inspect and edit the arguments and allow once or always allow. This is managed in App Settings > Tools & Integrations. LM Studio spawns a separate process per MCP server. — [LM Studio blog: MCP in LM Studio](https://www.lmstudio.ai/blog/mcp); [InfoQ: LM Studio MCP](https://infoq.com/news/2025/07/lm-studio-mcp)
- Warning in the docs: servers built for Claude, ChatGPT or Gemini "may use excessive tokens", which can bog down a local model and cause context overflows. — [LM Studio docs: MCP](https://lmstudio.ai/docs/app/mcp)

**Odysseus (PewDiePie's self-hosted workspace)**
- Its repo calls it "A self-hosted AI workspace for chat, agents, research, documents, email, notes, calendar, and local model workflows". License: AGPL-3.0-or-later. Docker quick start (`docker compose up -d --build`, then `http://localhost:7011`).
  - Built-ins include shell access, file handling, skills and memory, web search, email (IMAP/SMTP), calendar (CalDAV) and Deep Research.
  - "Chat + Agents" lists MCP, and the repo has an `mcp_servers` folder.
  - Security advice: keep authentication enabled for network deployments, keep the localhost auth bypass off outside dev, and don't expose raw model ports.

  — [GitHub: pewdiepie-archdaemon/odysseus](https://github.com/pewdiepie-archdaemon/odysseus)
- Secondary sources: released around May 31, 2026. It supports local and API backends (vLLM, llama.cpp, Ollama, OpenRouter, OpenAI and others). "MCP server management, API tokens, and model serving are admin-gated." Browsing uses Playwright. — [ProPakistani](https://propakistani.pk/2026/06/08/youtuber-pewdiepie-launches-free-ai-that-runs-privately-on-your-pc-taking-on-claude-and-chatgpt/amp/); [Jimmy Song landscape](https://landscape.jimmysong.io/projects/odysseus/); [TBS News](https://www.tbsnews.net/tech/pewdiepie-launches-odysseus-free-self-hosted-ai-workspace-challenge-big-tech-subscriptions)
- Conflict: some secondary sources say the license is MIT, but the repo page says AGPL-3.0-or-later. Repo paths also differ across sources (`pewdiepie-archdaemon/odysseus` fetched directly; a blog cites `odysseus-dev/odysseus`; a search result shows `en970/odysseus`, possibly a fork). — [GitHub repo](https://github.com/pewdiepie-archdaemon/odysseus); [korben.info](https://korben.info/es/odysseus-la-ia-autoalojada-de-pewdiepie-por-fin-rapida-en-mac.html)

**Zed**
- Zed calls MCP servers "context servers" (`context_servers` in `~/.config/zed/settings.json` or `.zed/settings.json`). You add them via Agent Panel > Settings > Add Custom Server. "Tools are used from the Agent panel when a compatible model is selected." — [Grafana docs: Zed](https://grafana.com/docs/grafana-cloud/machine-learning/mcp/clients/zed.md); [fast.io guide](https://fast.io/resources/zed-mcp-server-setup-guide.md)

**Higgsfield and ChatGPT**
- "For ChatGPT, use the official Higgsfield Plugin instead". The same MCP endpoint works for any MCP-compatible agent. — [Higgsfield Help: What is Higgsfield MCP](https://higgsfield.ai/creator-hub/help-center/mcp-cli/what-is-higgsfield-mcp)

### Inferences
- Suggested layer cake for the learning path, bottom to top:
  1. **Model.** Text in, text out. It can only *ask* for tools.
  2. **Host app** (Claude Code, Codex, LM Studio, Zed, Odysseus). It holds the conversation, shows permission prompts and actually executes tool calls.
  3. **Built-in tools** shipped with the app: bash, read/edit files, web fetch, memory.
  4. **MCP client** inside the app, which connects to **MCP servers**: local stdio (REA, which itself drives Ghidra, JADX and so on) or remote HTTP (Higgsfield). A "connector" is Claude's product name for a server linked to your account.
  5. **Skills.** Text playbooks that teach the model *when and how* to use tools. They don't add new abilities to execute anything, except that a skill may bundle scripts the existing bash tool runs.
  6. **Slash commands.** User-triggered shortcuts, now a kind of skill in Claude Code.
  7. **Subagents.** Extra model instances with their own context and tool subset.
  8. **Hooks.** Deterministic scripts the app runs, never chosen by the model.
  9. **Plugins.** Zip-file-like bundles of any of the above. Marketplaces are catalogs of plugins.
- One-line definitions a beginner can memorize:
  - **Tool:** an action the model can request.
  - **MCP server:** a program that offers tools to any app.
  - **Connector:** a Claude account-level MCP server hookup.
  - **Skill:** a recipe card of instructions.
  - **Plugin:** a box that ships recipes, tools and helpers together.
- The same server (REA) can be plugged into all five apps, because MCP is the shared standard. Only the config file location and format differ: JSON `mcpServers` for Claude Code, LM Studio and generic clients; TOML `[mcp_servers]` for Codex; `context_servers` for Zed.

### Gaps
- Not verified: whether *every* connector in Anthropic's directory is an MCP server under the hood. Custom connectors are explicitly MCP, and Claude Code lists "claude.ai connectors" as an MCP source, which strongly suggests directory connectors are too.
- The Odysseus MCP config format (stdio vs HTTP, file location) was not found in the README. Contents of the `mcp_servers` folder were not inspected.
- Zed's official MCP docs and Zed's tool behavior with OpenRouter models were not fetched.
- The Claude Code subagents page was not fetched directly. Details come from the skills and plugins pages.

## 4. How these interfere: context cost, tool overload and selection errors, and mitigations

### Takeaway
Every enabled tool, skill description and plugin costs context on every turn, even when unused. Large outputs (decompiled code!) also flood context. Vendor docs and research agree that selection accuracy falls as tool count rises:
- Anthropic: degradation "once you exceed 30–50 available tools".
- OpenAI: a soft suggestion of fewer than 20 functions at the start of a turn.
- RAG-MCP: retrieval tripled accuracy from 13.62% to 43.13%.

The main mitigations are tool search/deferred loading (on by default in Claude Code), allow/deny lists (Codex `enabled_tools`), disabling unused servers and plugins, compact schemas, and output caps.

### Cited Findings
**Context cost**
- "A typical multiserver setup (GitHub, Slack, Sentry, Grafana, and Splunk) can consume ~55k tokens in definitions before Claude does any work. Tool search typically reduces this by over 85 percent, loading only the 3–5 tools Claude needs." — [Anthropic: Tool search tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool)
- Plugins: "for each skill, agent, and command that Claude can invoke on its own, the name and description are in Claude's context on every turn… even in sessions where nothing from the plugin runs." MCP servers from plugins run as processes alongside each session. — [Claude Code docs: Plugins overview](https://code.claude.com/docs/en/plugins)
- Codex caps its skills list at about 2% of the context window. — [OpenAI Codex docs: Skills](https://developers.openai.com/codex/skills.md) (via search summary)
- Claude Code truncates each MCP tool description and server instructions at 2,048 characters by default (`CLAUDE_CODE_MAX_MCP_DESCRIPTION_LENGTH`). — [Claude Code docs: MCP](https://code.claude.com/docs/en/mcp)

**Accuracy vs number of tools**
- "Claude's ability to pick the right tool degrades once you exceed 30–50 available tools." — [Anthropic: Tool search tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool)
- OpenAI: "Aim for fewer than 20 functions available at the start of a turn" ("a soft suggestion"). For larger sets, "Use tool search to defer large or infrequently used parts of your tool surface." — [OpenAI: Function calling guide](https://developers.openai.com/api/docs/guides/function-calling)
- RAG-MCP (Gan & Sun, arXiv 2505.03275, May 2025): retrieving a shortlist of tools "more than triples tool selection accuracy (43.13% vs 13.62% baseline)" and "cuts prompt tokens (e.g., by over 50%)". — [arXiv: RAG-MCP](https://arxiv.org/abs/2505.03275)
- OSWorld-MCP (arXiv 2510.24563): as the number of available tools grew, both accuracy and tool invocation rate dropped. — [arXiv: OSWorld-MCP](https://arxiv.org/pdf/2510.24563) (via search summary; not fetched in full)
- HumanMCP (arXiv 2602.23367) reports a similar downward retrieval trend up to 100 tools. — [arXiv: HumanMCP](https://arxiv.org/pdf/2602.23367) (via search summary)
- Small models are weakest on multi-turn tool use. In TinyLLM (arXiv 2511.22138), BFCL multi-turn accuracy fell to 35.25% for Qwen3-4B, 16.88% for Qwen3-1.7B and 1.38% for Qwen3-0.6B. A purpose-trained xLAM-2-8b-fc-r scored 69.25% multi-turn on an April 2025 BFCL snapshot. — [arXiv: TinyLLM](https://arxiv.org/pdf/2511.22138); [arXiv: APIGen-MT](https://arxiv.org/pdf/2504.03601) (via search summary); BFCL is now at V4 (agentic), last updated 2025-12-16 — [Berkeley Function-Calling Leaderboard](https://gorilla.cs.berkeley.edu/leaderboard)

**Output flooding**
- Claude Code warns when MCP tool output exceeds 10,000 tokens. The default max is 25,000 (`MAX_MCP_OUTPUT_TOKENS`). Text results over 50,000 characters are saved to a file, with a hard ceiling of 500,000 characters per tool. — [Claude Code docs: MCP](https://code.claude.com/docs/en/mcp)

**Mitigations**
- Anthropic API tool search: mark tools `defer_loading: true`. Claude initially sees only the search tool plus non-deferred tools, searches (regex or BM25), and gets up to 5 matches by default. There's a maximum of 10,000 deferred tools. Recommended "when you have 10 or more tools" or definitions >10k tokens. "Keep your 3–5 most frequently used tools non-deferred." — [Anthropic: Tool search tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool)
- Claude Code: "Tool search is enabled by default: MCP tools are deferred and discovered on demand. Only tool names and server instructions load at session start."
  - `ENABLE_TOOL_SEARCH` accepts unset/`true`/`auto` (load upfront until definitions reach 10% of context)/`auto:N`/`false`.
  - Per-server `"alwaysLoad": true` exempts a server from deferral.
  - Version-dependent caveat: "Claude Code disables it when ANTHROPIC_BASE_URL points to a non-first-party host, since most proxies don't forward tool_reference blocks." Tool search requires Claude Sonnet 4.5, Haiku 4.5, Opus 4.5 or later.

  — [Claude Code docs: MCP](https://code.claude.com/docs/en/mcp)
- Codex: `enabled_tools` (allow list), `disabled_tools` (deny list) and `enabled = false` per server. — [OpenAI Codex docs: MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)
- Claude Code: disable plugins without uninstalling (`/plugin` or `claude plugin disable`). The official marketplace shows a "Context cost" estimate before install. — [Claude Code docs: Plugins overview](https://code.claude.com/docs/en/plugins)
- REA: `REA_MCP_INPUT_SCHEMA_PROFILE=compact` renders advertised input schemas within a 13,312-byte budget (default `full`). `REA_MCP_MAX_RESPONSE_BYTES` limits responses. — [REA docs: mcp-contracts.md](https://github.com/morluto/rea/blob/main/docs/mcp-contracts.md); [REA docs: installation.md](https://github.com/morluto/rea/blob/main/docs/installation.md)
- MCP spec 2026-07-28: deterministic `tools/list` order "to… improve LLM prompt cache hit rates". — [MCP Spec changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog)

**Other interference (naming and precedence)**
- Claude Code uses whole-entry precedence across scopes (local > project > user > plugin > claude.ai connectors). MCP prompt names can collide with skill names. A server named `anthropic-skills` has its prompts hidden. — [Claude Code docs: MCP](https://code.claude.com/docs/en/mcp)
- One malformed tool schema can make every API request fail (400). Claude Code now excludes such tools (v2.1.216+). — [Claude Code docs: MCP](https://code.claude.com/docs/en/mcp)

### Inferences
- REA at ~126 tools (the user's figure, unverified, see section 6) is well past both the 20-tool OpenAI suggestion and the 30–50-tool Anthropic threshold. Add Higgsfield plus each app's built-ins, and selection errors become likely *unless* the app defers tools (Claude Code does by default; Codex does not appear to without `enabled_tools`).
- Practical rule for the student: enable only the servers needed for today's task (REA for RE sessions, Higgsfield for media sessions, not both). In Codex use `enabled_tools`; in Claude Code rely on tool search and turn off unused plugins.
- Decompiler output is long. The Claude Code output caps (10k-token warning, 25k max) and REA's response-byte limit explain why results sometimes get truncated or saved to files.

### Gaps
- No primary source gives accuracy-vs-tool-count curves for the exact models the student uses (Claude 5.x, GPT/Codex models, OpenRouter models in Zed, local 8B models). Secondary write-ups of RAG-MCP give inconsistent degradation curves (e.g., "78% at 10 tools to 13.6% at 100+"), which were not verified in the paper.
- Whether Codex, LM Studio, Zed or Odysseus implement any tool search or deferred loading was not found.

## 5. Security: tool poisoning, prompt injection via descriptions and results, servers running with user permissions, and supply chain

### Takeaway
An MCP server is just software running with your permissions (local) or a third party's service acting on your account (remote). Its tool descriptions and outputs flow straight into the model's context, where hidden instructions can hijack the agent. That's called tool poisoning when the instructions are in descriptions and indirect prompt injection when they are in results. A server can also change its definitions after approval (a "rug pull"). OWASP now has an MCP-specific Top 10 (beta, 2025 edition) alongside the LLM Top 10 2025. The MCP spec itself says tool descriptions should be treated as untrusted. Mitigations: install only trusted servers, pin versions, keep approval prompts on, use least privilege, and isolate risky work in a VM.

### Cited Findings
**Spec-level principles**
- "Tools represent arbitrary code execution and must be treated with appropriate caution." "descriptions of tool behavior such as annotations should be considered untrusted, unless obtained from a trusted server." "Hosts must obtain explicit user consent before invoking any tool." MCP "cannot enforce these security principles at the protocol level". — [MCP Specification](https://modelcontextprotocol.io/specification/latest)

**OWASP**
- OWASP MCP Top 10 (2025 edition, beta, "Phase 3"):
  - MCP01 Token Mismanagement & Secret Exposure
  - MCP02 Privilege Escalation via Scope Creep
  - MCP03 Tool Poisoning
  - MCP04 Software Supply Chain Attacks & Dependency Tampering
  - MCP05 Command Injection & Execution
  - MCP06 Prompt Injection via Contextual Payloads
  - MCP07 Insufficient Authentication & Authorization
  - MCP08 Lack of Audit and Telemetry
  - MCP09 Shadow MCP Servers
  - MCP10 Context Injection & Over-Sharing

  — [OWASP MCP Top 10](https://owasp.org/www-project-mcp-top-10/)
- OWASP LLM01:2025 Prompt Injection: "Indirect prompt injections occur when an LLM accepts input from external sources, such as websites or files." Mitigations include "Restrict the model's access privileges to the minimum necessary", "Implement human-in-the-loop controls for privileged operations" and "Separate and clearly denote untrusted content". — [OWASP GenAI: LLM01 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)

**Demonstrated attacks**
- Tool poisoning (named by Invariant Labs, April 2025): malicious instructions hidden in tool descriptions that the model sees but users normally don't. The proof of concept was an innocent-looking "add" tool on Cursor whose description told the agent to read `~/.ssh/id_rsa` and MCP config files and exfiltrate them. — [Simon Willison: MCP has prompt injection security problems](https://simonwillison.net/2025/Apr/9/mcp-prompt-injection/); [Speakeasy: MCP tool poisoning](https://www.speakeasy.com/resources/mcp-tool-poisoning)
- Rug pull and cross-server shadowing (WhatsApp demo): a malicious server's harmless `get_fact_of_the_day()` later swapped its definition to steer a *separate, legitimate* WhatsApp MCP server's `send_message` toward exfiltrating chat history to an attacker number. Docker says this "bypasses traditional data loss prevention systems because it looks like normal AI behaviour." — [Docker: MCP Horror Stories, WhatsApp](https://www.docker.com/blog/mcp-horror-stories-whatsapp-data-exfiltration-issue/); [Simon Willison](https://simonwillison.net/2025/Apr/9/mcp-prompt-injection/)
- Simon Willison's framing: mixing private data, untrusted instructions and an exfiltration vector is a toxic combination, and MCP makes it easy to assemble. — [Simon Willison](https://simonwillison.net/2025/Apr/9/mcp-prompt-injection/)
- Docker cites arXiv research claiming "5.5% of MCP servers exhibit tool poisoning attacks" and "33%… allow unrestricted network access" (secondary; the underlying paper was not verified). — [Docker blog](https://www.docker.com/blog/mcp-horror-stories-whatsapp-data-exfiltration-issue/)

**Vendor warnings and controls**
- Anthropic (connectors): "Custom connectors allow you to connect Claude to services that haven't been verified by Anthropic." "Malicious MCP servers may include hidden instructions that try to make Claude perform unintended actions." Server developers can change tool behavior without warning. "Only choose 'Allow always' for servers and tools you trust." In Research mode, connector tools can run without further approval, so disable write tools. — [Claude Help: custom connectors](https://support.claude.com/en/articles/11175166-about-custom-connectors-using-remote-mcp)
- Claude Code: "Verify you trust each server before connecting it. Servers that fetch external content can expose you to prompt injection risk."
  - Project `.mcp.json` servers require approval in interactive sessions.
  - Credential variables such as `ANTHROPIC_API_KEY` read as empty for remote servers so a project can't exfiltrate them.
  - Server authors can force per-call approval with `_meta["anthropic/requiresUserInteraction"]`.

  — [Claude Code docs: MCP](https://code.claude.com/docs/en/mcp)
- Claude Code plugins: "what the plugin runs, it runs as you." Skills' `allowed-tools` pre-approves tools and "Workspace trust doesn't gate this field", so review it in untrusted repos. `!`command`` in skills runs shell at render time. — [Claude Code docs: Plugins](https://code.claude.com/docs/en/plugins); [Claude Code docs: Skills](https://code.claude.com/docs/en/skills)
- LM Studio: "Some MCP servers can run arbitrary code, access your local files, and use your network connection." "Never install MCP servers from untrusted sources." It shows a tool-call confirmation dialog. — [LM Studio docs: MCP](https://lmstudio.ai/docs/app/mcp); [LM Studio blog](https://www.lmstudio.ai/blog/mcp)
- REA-specific:
  - "Runtime capture runs or interacts with the target using your user permissions."
  - "REA analyzes targets locally, but your agent's model provider receives tool results under its own policy."
  - REA's disclaimer tells users to use "isolated environments for untrusted targets" and notes "Authorization to inspect an artifact does not necessarily authorize execution."

  — [REA README](https://github.com/morluto/rea); [REA DISCLAIMER](https://raw.githubusercontent.com/morluto/rea/main/DISCLAIMER.md)
- REA marks risky tools with MCP annotations: `destructiveHint: true` when a tool "runs code REA doesn't own (executesForeignCode, e.g., process, LLDB, Electron, browser scenarios), or changes an attached Android device (mutatesDevice)". — [REA docs: mcp-contracts.md](https://github.com/morluto/rea/blob/main/docs/mcp-contracts.md)
- Supply chain: REA's docs say "Persistent registrations should use one exact package version" (e.g., `rea-agents@6.4.0`), which avoids silently pulling a new, possibly compromised, `@latest` on every launch. — [REA docs: installation.md](https://github.com/morluto/rea/blob/main/docs/installation.md)
- Codex OAuth registration now supports CIMD/DCR. The MCP spec deprecated DCR in favor of Client ID Metadata Documents and requires issuer (`iss`) validation. — [OpenAI Codex docs: MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli); [MCP Spec changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog)

### Inferences
- For this student, the realistic risks are:
  - (a) Running crackmes or unknown binaries in a runtime mode on their main PC. Static analysis reads files; runtime tools execute them with their permissions. Use a VM.
  - (b) Text inside a target that tries to instruct the AI (strings in a binary, website content). REA results go straight into context, which is indirect prompt injection.
  - (c) Installing random community MCP servers or plugins.
  - (d) "Always allow" on a paid tool (Higgsfield), letting an agent loop burn credits.
- Using cloud models (Claude, Codex, OpenRouter in Zed) means decompiled code and strings from the target get sent to that provider. A local model in LM Studio keeps them on the machine, at the cost of weaker tool use (section 6).
- The "lethal trifecta" is a teachable rule: don't give one agent session private data, untrusted content *and* a way to send data out, all at once.

### Gaps
- The arXiv study behind Docker's "5.5% of MCP servers" figure was not located or verified.
- No source was found on Higgsfield-specific security incidents. Nothing was found on whether Odysseus shows per-call MCP approval prompts.
- Supabase/Cursor "SQL injection via support tickets (June 2025)" appears only in a secondary summary (Nordic APIs) and was not verified.

## 6. REA specifics (install, requirements, connecting, legal and ethics, practice targets, local 8B models) plus Higgsfield practical facts

### Takeaway
REA (`rea-agents` on npm, MIT) is a local MCP server plus CLI. Install and register it with `npx rea-agents setup`, which previews and backs up agent configs for Claude Code, Codex, Cursor, Gemini CLI and Grok Build. Manual setup uses an `mcpServers` block running `npx -y rea-agents@<exact version> mcp`.

Requirements:
- **Node:** Node 22.19+/24.11+/26+.
- **For native binaries:** Ghidra 12.1.x with JDK 21+, or IDA or Hopper.
- **For APKs:** a full JDK (headless JADX).
- **For websites:** a Chrome-family browser.

Its disclaimer explicitly allows CTFs and education and forbids DRM, licensing, anti-cheat and auth bypass. Good legal targets are crackmes.one and picoCTF. Driving REA's large toolset with a small local 8B model is likely to be unreliable (inference; no direct test found).

Higgsfield MCP: a hosted endpoint `https://mcp.higgsfield.ai/mcp` with OAuth (no API key). Every MCP generation costs credits at standard rates, even on "Unlimited" plans.

### Cited Findings
**What REA is and its scale**
- "Reverse engineer anything with agents, from app behavior down to native binaries." Target analysis runs locally, and results include evidence and limitations per conclusion. — [REA README](https://github.com/morluto/rea)
- Targets:
  - Native binaries via Hopper, Ghidra or IDA (pseudocode, assembly, strings, symbols, references).
  - JavaScript/Electron (modules, source maps, IPC).
  - .NET (metadata, CIL; static only).
  - Android APKs (manifest, classes, decompiled methods; needs headless JADX plus a JDK).
  - Websites (page structure, scripts, network; needs a Chrome-family browser).
  - Also Go, WASM, EVM bytecode, SQLite, pcap, firmware, adb devices and more.

  — [REA README](https://github.com/morluto/rea)
- Popularity snapshot: the README says "180,000 GitHub stars". The GitHub page fetched on 2026-10-13 showed about 191k stars and 46.6k forks. These are snapshots and differ by date. — [REA README (raw)](https://raw.githubusercontent.com/morluto/rea/main/README.md); [REA GitHub](https://github.com/morluto/rea)
- Example tool names: `analyze_function`, `inspect_binary_layout`, `analyze_javascript_application`, `inspect_macho`, `inspect_wasm_artifact`, `capture_browser_scenario`, `compare_web_captures`, `inspect_adb_client`, `close_binary`, `get_call_graph`. `rea doctor --json` reports the canonical tool catalog. The Ghidra adapter alone exposes 25 read-only operations. — [REA docs: mcp-contracts.md](https://github.com/morluto/rea/blob/main/docs/mcp-contracts.md); [REA docs: installation.md](https://github.com/morluto/rea/blob/main/docs/installation.md)

**Install**
- `npx rea-agents setup` lets you choose agents, review proposed changes and approve them; restart your agent afterward. Alternatives: `npm install --global rea-agents`, `rea --help`, and updates via `rea update` or `npx rea-agents@latest setup`. One-off CLI use without any agent: `npx -y rea-agents@latest analyze-javascript-application /absolute/path/to/app --json`. — [REA README](https://github.com/morluto/rea)
- `rea setup --client <id>` with IDs `claude_code`, `codex`, `cursor` previews changes before writing. For Codex, setup adds `startup_timeout_sec = 30`. LM Studio is *not* a listed setup client. — [REA docs: installation.md](https://github.com/morluto/rea/blob/main/docs/installation.md)
- Manual registration: `{"mcpServers": {"rea": {"command": "npx", "args": ["-y", "rea-agents@6.4.0", "mcp"]}}}`. "Persistent registrations should use one exact package version." — [REA docs: installation.md](https://github.com/morluto/rea/blob/main/docs/installation.md) (the 6.4.0 version number will change; version-dependent)

**Requirements (version-dependent)**
- Node.js 22.x (≥22.19), 24.x (≥24.11) or 26+. Node 23, 25 and prereleases are unsupported. — [REA docs: installation.md](https://github.com/morluto/rea/blob/main/docs/installation.md)
- Ghidra 12.1.x accepted (verified with 12.1.4). Windows x64 support is "experimental". It needs a 64-bit full JDK, and "Current 12.1 releases require JDK 21 or newer. Verified with JDK 21." Env vars: `GHIDRA_INSTALL_DIR`, `JAVA_HOME`, `GHIDRA_HEADLESS_MAXMEM` (default 2G) and `REA_GHIDRA_STARTUP_TIMEOUT_MS` (default 330,000 ms). — [REA docs: installation.md](https://github.com/morluto/rea/blob/main/docs/installation.md)
- Static JavaScript analysis "needs no native engine". .NET is static with no extra requirements. APKs need headless JADX plus a full JDK. Optional extras include pwntools, WABT, adb, Apktool, Binwalk/Unblob, TShark, sigrok-cli and mitmdump. — [REA README](https://github.com/morluto/rea)
- IDA Pro, Hopper and JEB are commercial and "must be legally obtained". "REA grants no tool license, key, or activation." — [REA README](https://github.com/morluto/rea)

**Legal and ethics (from REA itself)**
- Intended uses include security research, malware and incident analysis, vulnerability research with coordinated disclosure, "CTFs and education", interoperability, preservation, and analysis of software "you own or are authorized to examine". — [REA DISCLAIMER](https://raw.githubusercontent.com/morluto/rea/main/DISCLAIMER.md)
- Prohibited: "defeating DRM, license checks, anti-cheat, or other technical protection measures; making game cheats or tampering with online services; bypassing authentication or access controls… copying proprietary software". "Cracked copies, stolen or shared keys, and bypassing license restrictions are not authorized." Reverse engineering "may be restricted by jurisdiction or by a software license." REA is provided "AS IS". — [REA DISCLAIMER](https://raw.githubusercontent.com/morluto/rea/main/DISCLAIMER.md); [REA README](https://github.com/morluto/rea)

**Legal practice targets**
- crackmes.one: programs "made to be cracked as an educational exercise" (find the password, make a keygen). Archives are password-protected (password `crackmes.one`). Difficulty levels run 1–6. The site ran its first RE-focused CTF in February 2026. — [crackmes.one FAQ (mirror)](https://backiee.wasmer.app/https_crackmes_one/faq); [CTFtime: crackmes.one](https://ctftime.org/ctf/1414); [Klefz blog](https://blog.klefz.com/posts/crackmes-one-re-ctf-2026-experience/)
- picoCTF: a free CTF and practice platform from Carnegie Mellon. The picoGym holds hundreds of practice challenges available year-round, including a Reverse Engineering category. — [HackerDNA: picoCTF guide](https://hackerdna.com/blog/picoctf); [freeCodeCamp: picoCTF walkthrough](https://www.freecodecamp.org/news/improve-cybersecurity-skills-with-ctfs-picoctf-walkthrough/)

**Small local 8B model driving REA**
- REA's docs do not mention local models or model requirements. — [REA README (raw)](https://raw.githubusercontent.com/morluto/rea/main/README.md)
- LM Studio warns that servers designed for Claude, ChatGPT or Gemini "may use excessive tokens", causing overflows on local models. — [LM Studio docs: MCP](https://lmstudio.ai/docs/app/mcp)
- Anthropic says selection degrades beyond 30–50 tools, and OpenAI suggests fewer than 20 (section 4). Small-model BFCL multi-turn scores collapse at small sizes, while purpose-trained 8B tool models (xLAM-2-8b) do much better (section 4). — [Anthropic: Tool search](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool); [OpenAI: Function calling](https://developers.openai.com/api/docs/guides/function-calling); [arXiv: TinyLLM](https://arxiv.org/pdf/2511.22138)
- REA offers `REA_MCP_INPUT_SCHEMA_PROFILE=compact` (13,312-byte schema budget) as a "schema-limit workaround". — [REA docs: mcp-contracts.md](https://github.com/morluto/rea/blob/main/docs/mcp-contracts.md)

**Higgsfield MCP facts**
- "Higgsfield MCP is a connector that lets you generate images, videos, characters, and audio from Higgsfield inside Claude or another MCP-compatible agent." Endpoint `https://mcp.higgsfield.ai/mcp`. Auth is OAuth, with no API key (API keys belong to the separate Higgsfield API). Tool categories: image/video generation, Soul characters, Higgsfield Audio and credit balance checks. — [Higgsfield Help: What is Higgsfield MCP](https://higgsfield.ai/creator-hub/help-center/mcp-cli/what-is-higgsfield-mcp)
- Cost: "All MCP generations deduct credits at standard rates, regardless of plan." Unlimited and free generations apply only on the higgsfield.ai web app, not via MCP, CLI, Canvas or Supercomputer. "You are responsible for anything an agent generates through your account." MCP generations appear in Assets tagged with the MCP source. — [Higgsfield Help](https://higgsfield.ai/creator-hub/help-center/mcp-cli/what-is-higgsfield-mcp)
- Claude Code add command (from a third-party guide): `claude mcp add --transport http --scope user higgsfield https://mcp.higgsfield.ai/mcp`, then complete OAuth via `/mcp`. — [techsy.io guide](https://techsy.io/de/blog/higgsfield-mcp-claude-code); command syntax consistent with [Claude Code docs: MCP](https://code.claude.com/docs/en/mcp)
- Conflict on plan requirements: Creatify says MCP requires a paid plan (Starter, $19/month billed annually, 270 credits). A German guide mentions a free tier of 150 credits/month (as of May 2026). Unresolved; check live pricing. — [Creatify: What is Higgsfield MCP](https://creatify.ai/blog/what-is-higgsfield-mcp-what-it-does-what-it-costs-and-how-to-use-it); [techsy.io](https://techsy.io/de/blog/higgsfield-mcp-claude-code)
- Unofficial community servers exist (e.g., `Hikhakk/higgsfield-mcp-unified`, `jfikrat/higgsfield-mcp`) and are separate from the official endpoint. — [Creatify](https://creatify.ai/blog/what-is-higgsfield-mcp-what-it-does-what-it-costs-and-how-to-use-it)

### Inferences
- **Manual REA registration per app** (assembled from each app's documented syntax plus REA's command; not documented verbatim by REA, so verify):
  - Claude Code: `claude mcp add --transport stdio rea -- npx -y rea-agents@6.4.0 mcp`.
  - Codex: `codex mcp add rea -- npx -y rea-agents@6.4.0 mcp`, plus `startup_timeout_sec = 30` in `[mcp_servers.rea]` (Ghidra startup is slow; the Codex default is 10 s).
  - LM Studio: paste the `"rea": {...}` entry into `mcp.json`.
  - Zed: the same `command`/`args` under `context_servers`.
- **Windows caveats:** the student is on Windows, and REA's Ghidra support on Windows x64 is "experimental". Hopper is macOS/Linux only. The most dependable first steps on Windows are probably static JavaScript/Electron, .NET and website analysis, which need no native engine, before attempting Ghidra.
- **8B local model:** exposing all of REA (~126 tools per the user) to an 8B model in LM Studio will probably cause wrong tool choices, malformed arguments and context overflow. Better options:
  - Use a frontier cloud model (Claude Code or Codex) for REA work, accepting that target data goes to the provider.
  - Run the REA CLI directly (`rea ... --json`) and paste results.
  - If local, restrict tools where the client allows it, set the compact schema profile, and choose a model trained for tool calling.
  - Treat this as an experiment, not a dependable workflow.
- **Higgsfield safety habits:**
  - Never "Always allow" generation tools.
  - Ask the agent to check the credit balance first.
  - Disconnect or disable the server when not generating, which also saves context.
  - Do free or unlimited generations on the web app, since MCP always costs credits.
- **"Modding things they own":** this is the gray zone. REA's disclaimer forbids defeating DRM, license checks and anti-cheat even on software you own, and owning a copy doesn't override the software license or local law. Safe lanes are open-source apps, their own projects, offline single-player mod-friendly games whose EULA permits modding, and CTF/crackme targets.

### Gaps
- **Exact REA MCP tool count:** not verified. The user says about 126. REA's docs say the count comes from `rea doctor --json` or a generated catalog (`docs/public/product-catalog.json` returned 404). The README states no number.
- **REA tool subsetting:** no documented REA-side switch to expose only a subset of tools was found. `docs/client-configuration.md` (schema-limit workarounds) was not fetched.
- **REA with a local 8B model:** no test or report found. The conclusion above is inferred from general tool-calling research and LM Studio's warning.
- **Higgsfield in Codex:** setup and OAuth for Codex were not documented by Higgsfield. The Codex docs suggest `url = "https://mcp.higgsfield.ai/mcp"` plus `codex mcp login higgsfield` should work (inference).
- **Legality:** jurisdiction-specific rules on reverse engineering and modding (e.g., US DMCA §1201 exemptions, EU Software Directive interoperability rules) were not researched. REA's disclaimer only says this "may be restricted by jurisdiction or by a software license."
