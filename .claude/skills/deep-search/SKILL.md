---
name: deep-search
description: Find accurate, current, sourced answers about AI tools, apps, models, repos, MCP servers and news. Use when the owner asks what something is, how it works, what it can or can't do, or what's new, and the answer must be checked rather than recalled.
---

# Deep search

Answer one question with checked facts. Every important claim gets a source or an honest tag.

## 1. Pick the right tool first
| Question type | Try first | Backup |
|---|---|---|
| "What is X", news, recent releases, prices | `WebSearch` | Exa (`mcp__exa__web_search_exa`) |
| "How does repo X work inside" | DeepWiki (`mcp__deepwiki__ask_wiki_question`, repo as `owner/name`) | `WebFetch` the repo's README on github.com |
| Library, SDK or CLI docs and syntax | context7 (`resolve-library-id`, then `query-docs`) | `WebFetch` the official docs page |
| Claude Code itself | `WebFetch` on `https://code.claude.com/docs/en/...` | `WebSearch` |
| A file in this project | `Read`, `Grep`, `Glob` | none needed |

**YouTube transcripts:** `yt-dlp` 2026.8.19 is installed at `C:\Users\god\.local\bin\yt-dlp.exe` (not on PATH, so use the full path). It needs a shell, which the `search-agent` does not have, so the main chat runs it, then the agent reads the saved file:
`yt-dlp --skip-download --write-auto-subs --write-subs --sub-langs "en.*" --sub-format vtt -o "%(id)s" "<url>"`
Tested 2026-10-14 on one video: works with no login. Use the plain `.en.vtt` file, not `en-orig` (it has word-timing clutter). Expect occasional `429 Too Many Requests` on extra language variants; the main English file still arrives.

**Instagram transcripts:** not working. yt-dlp needs a login for Instagram and has no transcript feature. A public reel is untested. Never use the owner's cookies or account. Say "I can't read this" instead of guessing what a video says.

## 2. Search
- Run the first tool. Open the best 1 to 3 pages with `WebFetch` when the search snippet isn't enough.
- If a tool fails, is rate-limited or returns nothing useful, move to the backup and **say which tool failed and why**.
- For "can X do Y" questions, look for both the out-of-the-box answer and the with-add-ons answer.
- Prefer official docs and the repo itself over blog posts. Note the date of anything time-sensitive.

## 3. Check before answering
- Do two sources agree? If they disagree, report both.
- What did I leave out? What would an expert disagree with?

## 4. Report (short)
1. **Answer** in 1 to 3 plain sentences.
2. **Facts**, each tagged:
   - **[Checked]** + link: I opened a source that says this
   - **[Memory]**: from training, might be old or wrong
   - **[Guess]**: opinion or inference
3. **Tools used**: which tool, in what order, and what worked or failed. (The experiment agent uses this.)
4. **Could be wrong about:** one line.
5. **Sources:** links to pages actually opened.

If nothing reliable was found, say "I don't know" and what to try next.
