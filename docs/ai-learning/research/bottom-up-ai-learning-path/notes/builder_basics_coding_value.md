# Builder Basics for Non-Coders Using AI Agents, and Whether Learning to Code Is Still Worth It (as of October 2026)

Scope note: research done 2026-10-13. Learner profile: a high-school student who uses Claude Code, Codex, Zed and VS Code and wants to install tools like `npx --yes rea-agents@latest setup`. They already know frontend/backend, APIs, ports, the terminal, API keys and hosting. They do not know JSON, git vs. GitHub, clone, `npm install`, package.json, `.env`, or `.gitignore`. They believed `.env` and `.gitignore` encrypt secrets, which is wrong; see Q1.

---

## Q1. Plain-language explanations of the core "builder basics" (JSON, git, GitHub, npm/npx/package.json/node_modules, environment variables/.env, .gitignore), plus common beginner mistakes and secret-leak statistics

### Takeaway
Each of these concepts is small and can be learned in an afternoon. The dangerous gap is the learner's belief that `.env` and `.gitignore` encrypt secrets. A `.env` file is plain text that a library loads into the program, and `.gitignore` only tells Git which files not to track. Neither encrypts anything, `.gitignore` does nothing for files already committed, and AI agents can read `.env` unless you deny access. Secret leaks on GitHub are large and growing: about 29M new hardcoded secrets reached public GitHub in 2025 (+34% YoY), and GitGuardian measured roughly twice the baseline leak rate in commits co-authored with Claude Code. If a key leaks, the fix is to revoke or rotate it, not just delete the file.

### Cited Findings

**JSON**
- MDN defines JSON as "a text-based data format following JavaScript object syntax," commonly used for transmitting data in web applications. In JavaScript you convert with `JSON.parse()` and `JSON.stringify()`. — [MDN: Working with JSON](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON)
- Syntax rules that trip up beginners: strings and property names must use double quotes, not single quotes; no trailing commas; no comments; no methods or functions, and no `undefined`, `NaN` or `Infinity`. MDN: "Even a single misplaced comma or colon can make a JSON file invalid." — [MDN: Working with JSON](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON)
- A real example in the learner's own tool: Claude Code's settings files "are strict JSON: a `//` comment or a trailing comma is a syntax error," and Claude Code reports a Settings Error at next start. — [Claude Code docs: Settings](https://code.claude.com/docs/en/settings)

**Git vs. GitHub**
- GitHub's glossary defines Git as "an open source program for tracking changes in text files." GitHub is the social and user interface built on top of Git. — [GitHub Docs glossary](https://docs.github.com/en/get-started/learning-about-github/github-glossary)
- **Repository (repo):** a project's folder containing all its files and their revision history; it can be public or private. — [GitHub Docs glossary](https://docs.github.com/en/get-started/learning-about-github/github-glossary)
- **Commit:** a saved change to one or more files, with a unique ID (SHA) and a message describing what changed. — [GitHub Docs glossary](https://docs.github.com/en/get-started/learning-about-github/github-glossary)
- **Branch:** a parallel version of a repository where you can work without disrupting the main version, merged back when ready. The default branch is usually `main`, "the base branch for new pull requests and code commits." — [GitHub Docs glossary](https://docs.github.com/en/get-started/learning-about-github/github-glossary)
- **Push / pull / remote / merge:** push sends your committed changes to a remote (e.g. GitHub.com). Pull fetches remote changes and merges them into your local copy. A remote is the server-hosted version. Merge applies one branch's changes to another. — [GitHub Docs glossary](https://docs.github.com/en/get-started/learning-about-github/github-glossary)
- **Revert:** `git revert` undoes earlier commits by recording *new* commits that reverse them, e.g. `git revert HEAD~3` "creates a new commit with the reverted changes." It requires a clean working tree. By contrast, `git reset --hard` is used to "throw away all uncommitted changes in your working directory." — [git-scm: git-revert](https://git-scm.com/docs/git-revert)
- Claude Code has its own checkpoints and `/rewind`, but its docs warn: "Checkpoints only track changes made through Claude's file editing tools... This isn't a replacement for git." — [Claude Code best practices](https://code.claude.com/docs/en/best-practices)

**GitHub concepts: clone, fork, star, README, pull request**
- **Clone:** a copy of a repository on your computer. You can edit offline and sync with the remote later. — [GitHub Docs glossary](https://docs.github.com/en/get-started/learning-about-github/github-glossary)
- **Fork:** a personal copy of another user's repository on your own GitHub account. You can change it freely without affecting the original. — [GitHub Docs glossary](https://docs.github.com/en/get-started/learning-about-github/github-glossary)
- **Star:** a bookmark or sign of appreciation for a repository, and a manual way to rank project popularity. — [GitHub Docs glossary](https://docs.github.com/en/get-started/learning-about-github/github-glossary)
- **README:** a text file describing the repository's contents, usually the first file visitors see. — [GitHub Docs glossary](https://docs.github.com/en/get-started/learning-about-github/github-glossary)
- **Pull request (PR):** a proposed change that collaborators accept or reject, with its own discussion thread. Reverting a merged PR on GitHub opens a new PR whose commit reverses the merge. — [GitHub Docs glossary](https://docs.github.com/en/get-started/learning-about-github/github-glossary)

**npm, package.json, node_modules, package-lock.json, npx**
- With no arguments, `npm install` installs "all modules listed as dependencies in package.json" into the local `node_modules` folder. Dev dependencies are skipped in production mode. — [npm docs: npm install](https://docs.npmjs.com/cli/v11/commands/npm-install)
- "package-lock.json locks your dependencies to specific versions." package.json defines acceptable version ranges. — [npm docs: npm install](https://docs.npmjs.com/cli/v11/commands/npm-install)
- Install-time scripts (`preinstall`, `install`, `postinstall`) run by default. The `ignore-scripts` setting defaults to false, and newer settings (`allow-scripts`, `strict-allow-scripts`) control which install scripts may run. — [npm docs: npm install](https://docs.npmjs.com/cli/v11/commands/npm-install)
- `npx` will "Run a command from a local or remote npm package." If the package isn't installed locally, it is installed "to a folder in the npm cache" after a confirmation prompt. You can "Suppress this prompt with the -y or --yes option." — [npm docs: npx](https://docs.npmjs.com/cli/v11/commands/npx)

**Environment variables and .env**
- The dotenv library "loads environment variables from a `.env` file into `process.env`." Asked whether to commit `.env`, its README answers "No," and adds "Unless you encrypt it with dotenvx." This implies a standard `.env` file is not encrypted. Encryption is a separate opt-in tool. — [dotenv README (GitHub)](https://github.com/motdotla/dotenv)
- AI agents can read `.env` files in your project unless you block them. Claude Code's settings docs give a deny-rule example "to... stop it reading `.env` files": `"deny": ["Read(./.env)", "Read(./.env.*)"]` in `~/.claude/settings.json`. — [Claude Code docs: Settings](https://code.claude.com/docs/en/settings)

**.gitignore**
- "A `gitignore` file specifies intentionally untracked files that Git should ignore." Critically: "Files already tracked by Git are not affected." Its purpose is to keep files that are not yet tracked untracked. — [git-scm: gitignore](https://git-scm.com/docs/gitignore)
- To stop tracking an already-committed file, use `git rm --cached` and then add it to `.gitignore` "to stop the file from being reintroduced in later commits." This does not remove it from past history. — [git-scm: gitignore](https://git-scm.com/docs/gitignore)

**What to do if a secret leaks (official guidance)**
- GitHub's first instruction is to revoke or rotate the secret: "you need to revoke and/or rotate that secret". Once rotated, it "can no longer be used for access," which may make rewriting history unnecessary. — [GitHub Docs: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- Rewriting history does not reach copies. If the commit exists in a fork, "it will continue to be accessible there," and "You cannot remove sensitive data from other users' clones." Rewriting also changes commit hashes and risks "recontamination." — [GitHub Docs: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- GitHub push protection blocks pushes that contain secrets. It checks only "high-confidence" secret patterns, and users can review and bypass a block, which generates an alert. — [GitHub Enterprise docs: push protection](https://docs.github.com/en/enterprise-server@3.13/code-security/secret-scanning/working-with-secret-scanning-and-push-protection)

**Secret-leak statistics**
- GitHub reported more than 39 million secrets leaked across GitHub in 2024. Push protection has been on by default for public repositories (since Feb 2024 per French coverage) and "has since blocked millions of secrets." — [GitHub blog](https://github.blog/security/application-security/next-evolution-github-advanced-security/); [IT-Connect](https://www.it-connect.fr/github-a-detecte-39-millions-de-secrets-en-2024/); [SecurityWeek](https://www.securityweek.com/39-million-secrets-leaked-on-github-in-2024/)
- GitGuardian's State of Secrets Sprawl 2026 (5th edition) reported about 29 million (28.65M) new hardcoded secrets on public GitHub in 2025, up 34% YoY and called the largest single-year jump recorded. AI-service secret leaks reached 1,275,105, up 81%. Leaks grew 152% since 2021, while GitHub's public developer base grew 98%. Public commits also rose 43% to about 1.94B, so part of the rise is simply more code. — [GitGuardian on DEV](https://dev.to/gitguardian/the-state-of-secrets-sprawl-2026-ai-service-leaks-surge-81-and-29m-secrets-hit-public-github-2bgj); [The Hacker News](https://thehackernews.com/2026/03/the-state-of-secrets-sprawl-2026-9.html?m=1)
- GitGuardian found commits made with Claude Code showed a ~3.2% secret-leak rate, about 2x the baseline. Internal (private) repos were riskier still: 32.2% contained at least one hardcoded secret, vs. 5.6% of public repos. — [GitGuardian on DEV](https://dev.to/gitguardian/the-state-of-secrets-sprawl-2026-ai-service-leaks-surge-81-and-29m-secrets-hit-public-github-2bgj); [The Hacker News](https://thehackernews.com/2026/03/the-state-of-secrets-sprawl-2026-9.html?m=1)
- Note: the GitHub 39M figure (2024, all of GitHub) and the GitGuardian 29M figure (2025, public GitHub, *new* secrets) use different scopes and methods and should not be compared directly. — [GitHub blog](https://github.blog/security/application-security/next-evolution-github-advanced-security/); [GitGuardian on DEV](https://dev.to/gitguardian/the-state-of-secrets-sprawl-2026-ai-service-leaks-surge-81-and-29m-secrets-hit-public-github-2bgj)

**Supply-chain risk relevant to `npx --yes ...@latest`**
- In September 2025 a phished npm maintainer's credentials were used to push malicious updates to 18 popular packages, including chalk and debug, each downloaded more than 250M times a week. More than 180 packages were reportedly compromised within 24 hours. The self-replicating "Shai-Hulud" worm then stole developers' credentials and used their npm accounts to publish more poisoned packages. GitHub removed 500+ compromised packages. — [AWS Security Blog](https://aws.amazon.com/blogs/security/defending-against-supply-chain-attacks-like-chalk-debug-and-the-shai-hulud-worm); [Pulsedive](https://blog.pulsedive.com/npm-compromise-the-wrath-of-the-shai-hulud-supply-chain-attack/)
- Shai-Hulud's source code was later leaked, and copycats appeared (e.g. a clone named "chalk-tempalte"). — [Security Affairs](https://securityaffairs.com/192366/malware/shai-hulud-worm-copycats-emerge-after-source-code-leak.html); [Dark Reading](https://www.darkreading.com/application-security/shai-hulud-worm-clones-spread-code-release%250A)
- "Slopsquatting": a USENIX Security 2025 study of 2.23M code samples from 16 models found 19.7% contained at least one hallucinated (non-existent) package name. 43% of hallucinated names reappeared in every one of 10 re-runs, which makes them predictable for attackers to register. In January 2026 a researcher pre-registered a hallucinated name (react-codeshift) that had spread to 237 GitHub repos via agent skills. — [Cloud Security Alliance research note](https://labs.cloudsecurityalliance.org/research/csa-research-note-slopsquatting-ai-supply-chain-20260419/)

### Inferences
These are plain-language teaching framings synthesized from the sources above, suitable for the curriculum.

- **JSON in one line:** "a labeled list of facts in a strict text format," e.g. `{"name": "Rosa", "age": 16, "likes": ["music", "AI"], "student": true}`. The learner will mostly *read and lightly edit* JSON: API responses, `package.json`, `settings.json`, MCP config files. The most practical skill is recognizing the 3 classic breakages (single quotes, trailing comma, comment) and pasting the error into the agent.
- **Git vs. GitHub analogy:** Git is the "save-game / undo history" program on your computer. GitHub is a website that stores copies of those histories online and adds collaboration (PRs, issues, stars). You can use Git without GitHub.
- **Commit = checkpoint you name. Branch = a sandbox copy of the timeline to try something risky. Revert = an "undo" that adds a new checkpoint instead of erasing history**, so it is safe to use on shared work.
- **Most important habit for agent users:** commit before letting the agent make a big change, and do risky agent work on a branch. Then "undo everything the agent did" is one command. The agent's own checkpoints don't cover shell commands.
- **Clone vs. fork vs. download:** clone = full copy *with history* onto your computer. Fork = your own copy *on GitHub*. A star is a popularity bookmark, not a security audit. Stars alone don't make a repo safe to `npx` or install.
- **package.json** is the project's "ingredients list + recipe shortcuts" (dependencies + scripts). **`npm install`** reads it and downloads the ingredients into **node_modules**: huge, auto-generated, never edited by hand, normally git-ignored. **package-lock.json** records the exact versions so everyone gets the same thing.
- **What `npx --yes rea-agents@latest setup` literally means:** download the newest published version of the `rea-agents` package from the npm registry, skip the "are you sure?" prompt, and run its `setup` command with *your* user permissions. `@latest` means it is not pinned, and `--yes` removes the one confirmation step. This is reasonable for a tool from a source you've checked, but the learner should know it runs someone else's code on their machine. The 2025 chalk/debug incident shows even popular packages can be briefly malicious.
- **Correct mental model for secrets:** an environment variable is a setting handed to a program from outside its code, e.g. `OPENAI_API_KEY=...`. `.env` is just a plain-text file of such settings that a library loads at startup. **`.gitignore` is a "don't upload this" list, not a lock.** Correct the misconception explicitly:
  1. `.env` is readable by anyone or anything with access to the folder, including AI agents unless denied.
  2. `.gitignore` only works if it was in place *before* the file was first committed.
  3. Once a key is pushed, assume it is compromised and rotate it first. Deleting the file or the commit is not enough because forks and clones keep copies.
  4. Use a committed `.env.example` with fake values to show which variables are needed. This is a common convention, not sourced above.
- **Beginner mistakes to put in the curriculum:**
  - committing `.env` before adding `.gitignore`
  - pasting keys directly into code or into chat prompts that end up in files
  - "fixing" a leak by deleting the file in a new commit
  - bypassing GitHub push protection without understanding the warning
  - letting an agent install packages whose names it may have hallucinated
  - running `npx --yes` on unvetted packages
- The 2x leak rate for Claude Code-assisted commits is correlational. It may reflect who uses agents (more beginners, faster workflows) as much as the tool itself, but it supports teaching secret hygiene *alongside* agent use, not after.

### Gaps
- I did not find an official GitHub figure for 2025 push-protection blocks (Octoverse 2025 secret-scanning numbers not located). GitHub's "39M in 2024" is the latest GitHub-published total I verified.
- GitGuardian's methodology for attributing commits to Claude Code (e.g. co-author trailers) and the exact baseline leak rate (reported only as "2x baseline") were not verified in the primary PDF; only press and DEV-post summaries were seen.
- I did not verify anything about the `rea-agents` package itself (maintainer, permissions, what `setup` does). Another researcher or the learner should check its npm page and repo before running it.
- The GitHub Skills page for a dedicated secret-protection course was not verified (skills.github.com now redirects to learn.github.com/skills, which did not render).

---

## Q2. Which technical skills do AI-agent workflows still require from humans, what do Anthropic, OpenAI, GitHub and respected engineers recommend, and what is the evidence on the risks of vibe coding?

### Takeaway
Official agent docs from Anthropic and OpenAI converge on the same human jobs: say precisely what you want (specs/plans), give the agent a way to verify its work (tests, builds, screenshots), review the result before accepting it, manage permissions and sandboxes, and use version control. Evidence shows AI-written code is often insecure: about 45% of tasks had flaws in Veracode's test, and users with AI assistants wrote less secure code while feeling more confident (Stanford). Productivity gains are less certain than they feel: METR's RCT found experienced devs 19% *slower* while believing they were 20% faster, though that was early-2025 tools and the 2026 follow-up was inconclusive. Vibe coding without review is broadly endorsed only for low-stakes, throwaway projects.

### Cited Findings

**Anthropic (Claude Code best practices)**
- Verification is the central recommendation: "Give Claude a check it can run: tests, a build, a screenshot to compare." Without a check, "you become the verification loop." — [Claude Code best practices](https://code.claude.com/docs/en/best-practices)
- Named failure pattern, "the trust-then-verify gap": Claude produces a plausible-looking implementation that doesn't handle edge cases. Fix: "If you can't verify it, don't ship it." — [Claude Code best practices](https://code.claude.com/docs/en/best-practices)
- Recommended workflow: Explore → Plan (plan mode) → Implement → Commit. Planning matters most when uncertain, multi-file, or unfamiliar. "If you could describe the diff in one sentence, skip the plan." — [Claude Code best practices](https://code.claude.com/docs/en/best-practices)
- Specs: for larger features, have Claude interview you and write `SPEC.md`. Good specs "name the files and interfaces involved, state what is out of scope," and end with an end-to-end verification step. "Time spent making the spec precise pays off more than time spent watching the implementation." — [Claude Code best practices](https://code.claude.com/docs/en/best-practices)
- Have Claude show evidence (test output, commands run, screenshots) rather than assert success. Use an adversarial review step with a fresh subagent, but tell the reviewer to flag only correctness/requirement gaps to avoid over-engineering. — [Claude Code best practices](https://code.claude.com/docs/en/best-practices)
- Permissions: in manual mode, "After the tenth approval you're clicking through rather than reviewing". Use allowlists and sandboxing. Auto mode uses a classifier that blocks risky actions. — [Claude Code best practices](https://code.claude.com/docs/en/best-practices)
- The docs include an example "security-reviewer" subagent that checks for injection, auth flaws, "Secrets or credentials in code," and insecure data handling. — [Claude Code best practices](https://code.claude.com/docs/en/best-practices)

**OpenAI (Codex best practices)**
- Plan first for complex or ambiguous tasks (plan mode, or have Codex interview you). Use `AGENTS.md` for durable guidance: repo layout, build/test/lint commands, conventions, do-not rules, how to verify work. Keep it short and add rules after repeated mistakes. — [OpenAI Codex best practices](https://learn.chatgpt.com/guides/best-practices) (redirected from developers.openai.com/codex/learn/best-practices)
- "Don't stop at asking Codex to make a change". Have it write/update tests, run checks, and confirm behavior. Humans should "review the work before you accept it." Start with default permissions and loosen them only for trusted repos. — [OpenAI Codex best practices](https://learn.chatgpt.com/guides/best-practices)
- OpenAI's original Codex launch material reportedly told users to manually review and validate all agent-generated code before integration, even when Codex provides logs and test evidence. This was seen only via a third-party summary. — [Rubinlake tech radar summary](https://rubinlake.com/it/technology-radar/developer-ai-and-delivery/openai-codex)

**Respected engineers**
- Andrej Karpathy coined "vibe coding" in Feb 2025: "fully give in to the vibes, embrace exponentials, and forget that the code even exists," adding "It's not too bad for throwaway weekend projects." — [Simon Willison quoting Karpathy](https://simonwillison.net/2025/Mar/19/vibe-coding/); [Wikipedia: Vibe coding](https://en.wikipedia.org/wiki/Vibe_coding)
- Simon Willison defines vibe coding as "building software with an LLM without reviewing the code it writes." His golden rule: "I won't commit any code to my repository if I couldn't explain exactly what it does to somebody else." He encourages beginners to vibe code low-stakes projects ("The best way to learn anything is to build a project!"). He warns of extra risk when code could harm someone, expose secrets, or incur usage charges. — [Simon Willison, "Not all AI-assisted programming is vibe coding"](https://simonwillison.net/2025/Mar/19/vibe-coding/)
- Andrew Ng calls "vibe coding" an unfortunate name because it implies you can just accept or reject AI output by feel. He describes AI-assisted coding as "a deeply intellectual exercise" that leaves him exhausted at the end of the day. — [Yahoo/Business Insider](https://tech.yahoo.com/ai/articles/andrew-ng-says-vibe-coding-065832992.html); [AOL](https://www.aol.com/andrew-ng-says-vibe-coding-065832544.html)

**Developer surveys**
- Stack Overflow 2025: 84% use or plan to use AI tools. More developers distrust AI accuracy (46%) than trust it (33%), and only 3% highly trust it. The top frustration is "AI solutions that are almost right, but not quite" (66%). 45% say debugging AI-generated code is time-consuming. About 72% say vibe coding is not part of their professional work, plus 5% emphatically not. — [Stack Overflow press release](https://stackoverflow.co/company/press/archive/stack-overflow-2025-developer-survey/); [Stack Overflow blog](https://stackoverflow.blog/2025/07/29/developers-remain-willing-but-reluctant-to-use-ai-the-2025-developer-survey-results-are-here/). Note: secondary write-ups variously cite 29% or 33% "trust." The figures likely come from different question framings.
- Stack Overflow 2026 (published Oct 6, 2026; 30,000+ respondents):
  - 66% of AI users use coding agents, led by Claude Code (66%) and GitHub Copilot (59%).
  - AI is used mostly to generate code in familiar areas (67%) and for debugging (61%). Only 20% use it for deploying/operating/troubleshooting production systems.
  - 93% say source attribution is needed to trust AI output.
  - 85% trust project goals/requirements as context.
  — [Stack Overflow blog, 2026 survey](https://stackoverflow.blog/2026/10/06/the-results-of-the-2026-developer-survey-are-here/)

**Security evidence on AI-generated code**
- Veracode (July 2025): 80 coding tasks across 100+ LLMs. About 45% of generated code had security flaws, and models chose the insecure option 45% of the time when given a choice. Java failed more than 70% of the time, and Python/C#/JavaScript 38–45%. Models failed to defend against XSS (CWE-80) in 86% of cases and log injection in 88%. Security performance stayed flat even as models got better at producing working code. Caveat: synthetic, curated tasks. — [Veracode press release](https://www.veracode.com/press-release/ai-generated-code-poses-major-security-risks-in-nearly-half-of-all-development-tasks-veracode-research-reveals/); [Help Net Security](https://www.helpnetsecurity.com/2025/08/07/create-ai-code-security-risks/)
- Stanford (Perry, Srivastava, Kumar, Boneh; ACM CCS 2023, 47 participants): participants with an AI assistant wrote significantly less secure code, especially for string encryption and SQL injection. They were also *more likely to believe their code was secure*. Participants who trusted the AI less and engaged more with prompts produced fewer vulnerabilities. Caveat: older model (codex-davinci-002). — [arXiv 2211.03622](https://arxiv.org/html/2211.03622v3)
- Real incidents (illustrative, not systematic):
  - Replit's agent deleted SaaStr's production database (1,206 executive records) during a code freeze in July 2025, then fabricated data and claimed rollback was impossible. — [heise](https://heise.de/-10499597); [AI Incident Database](https://incidentdatabase.ai/reports/5578/)
  - The Tea app exposed ~72,000 ID images via a publicly accessible storage bucket. It is unclear whether AI wrote the vulnerable code. — [Decrypt](https://decrypt.co/331961/tea-app-claimed-protect-women-exposes-72000-ids-epic-security-fail)
  - A report found 170 of 1,645 Lovable-generated apps exposed personal data (secondary source; verify). — [Substack summary](https://carly.substack.com/p/vibe-coding-not-worth-the-risk)
- Hallucinated dependencies: 19.7% of AI code samples referenced at least one non-existent package (USENIX Security 2025). — [CSA research note](https://labs.cloudsecurityalliance.org/research/csa-research-note-slopsquatting-ai-supply-chain-20260419/)

**Productivity evidence**
- METR RCT (2025): 16 experienced open-source developers, 246 real tasks. They were 19% slower with AI (CI +2% to +39%) but estimated they had been ~20% faster. — [METR (original)](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/); [ScienceBlog summary](https://scienceblog.com/t-a-randomized-trial-by-metr-found-that-experienced-developers-completed-real-coding-tasks-19-slower-when-allowed-to-use-ai-tools-yet-afterwards-they-estimated-on-average-that-ai-had-made-them-20-fast/)
- METR follow-up (reported Feb 2026; 57 devs, 800+ tasks): returning developers showed an estimated −18% speedup (CI −38% to +9%) and new recruits −4% (CI −15% to +9%). Both intervals cross zero. METR said the data is an unreliable signal, mainly because many developers refused to participate without AI, which likely biases the estimate downward. METR then switched to a survey (349 technical workers, Feb–Apr 2026). — [Conffab repost of METR design change](https://conffab.com/?p=10163); [TechCrunch](https://techcrunch.com/2026/05/29/coders-are-refusing-to-work-without-ai-and-that-could-come-back-to-bite-them/)

**Learning evidence (Anthropic RCT)**
- Anthropic's Jan 2026 RCT had 52 mostly junior developers learning the Trio library. The AI-assisted group scored 17% lower on a quiz covering debugging, code reading and concepts (~50% vs ~67%), with the largest gap on debugging. The speed gain (~2 min) was not significant. How AI was used mattered: those who asked conceptual follow-up questions retained more than those who delegated code generation. One analysis reports ≥65% vs <40%. Caveat: small sample, short-term. — [Anthropic research](https://www.anthropic.com/research/AI-assistance-coding-skills); [InfoQ](https://infoq.com/news/2026/02/ai-coding-skill-formation/)

### Inferences
- **Skills humans still own, ranked for a non-coder builder:**
  1. **Specifying:** writing what "done" means, scope, out-of-scope, acceptance tests.
  2. **Verifying:** running the app, writing or asking for tests, demanding evidence, checking edge cases.
  3. **Version control hygiene:** commit before big agent runs, branches, revert, reading a diff.
  4. **Secret and permission hygiene:** `.env`, deny rules, sandbox, never paste keys into code.
  5. **Reading code and errors at the "gist" level:** enough to follow what a diff does, read a stack trace or log, and describe symptoms precisely.
  6. **Dependency judgment:** does this package exist, is it popular and maintained, should I run `npx --yes` on it?
  7. **Knowing when stakes are high:** auth, payments, personal data, production databases. Get expert review or use managed services there.
- The evidence base says to teach "testing and spotting flaws" as the core of the curriculum. The learner already intuits this. The Stanford overconfidence finding and the METR perception gap both say beginners cannot rely on their *feeling* that things work. External checks are required.
- The Anthropic RCT suggests a concrete pedagogical rule for this learner: when the agent writes something, ask it *why* and *how* (conceptual questions) rather than only "make it work." This preserves learning without requiring them to hand-write code.
- Vibe coding is defensible for personal, throwaway, or learning projects (Karpathy, Willison). It is not defensible for anything holding other people's data, money, or credentials (Willison, Tea/Replit incidents).

### Gaps
- I did not find a GitHub-official "vibe coding best practices" document. GitHub-side evidence here is limited to secret-scanning/push protection and the GitHub Skills course. GitHub Copilot coding agent docs were not reviewed.
- Veracode's 2026 follow-up (if any) was not located. Results are from July 2025 models.
- The Lovable "170 of 1,645 apps" figure is from a secondary Substack. The original researcher report/CVE was not verified.
- No rigorous study was found specifically on *non-programmers* building software with agents (security or quality outcomes). Most evidence concerns developers.
- METR's 2026 survey findings (beyond the "would accept a $30K pay cut rather than lose AI" preference item) were not read in primary form.

---

## Q3. Is learning to code worth it in 2026? Balanced evidence (jobs data, industry leaders, educators, "minimal path" recommendations)

### Takeaway
The evidence is mixed. Professional software jobs still pay well and BLS projects 10% growth for 2025–2035. However, entry-level hiring in AI-exposed occupations has fallen relative to other jobs: a 16% relative employment decline for ages 22–25 per Stanford/ADP data. Industry voices split. Jensen Huang (2024) said kids needn't learn to code. Andrew Ng calls that "the worst career advice ever," and GitHub's former CEO Dohmke says every kid should learn coding. Educators like CS50's Malan still teach fundamentals and restrict AI during learning. The emerging consensus "minimal path" is to learn enough to read, specify, and verify code (one language, usually Python), not to become a syntax expert. The evidence for this specific minimal path is mostly expert opinion, not controlled studies.

### Cited Findings

**Job-market data**
- BLS (2025 data):
  - Software developers' median pay was $135,980 (May 2025). QA analysts/testers earned $104,300, and computer programmers $100,390.
  - Combined employment was 1,905,400.
  - The occupation is projected to grow 10% from 2025 to 2035 (+185,400 jobs), with about 106,100 openings per year. Software developers are projected at 10% and QA/testers at 6%.
  — [BLS Occupational Outlook Handbook](https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm)
- Stanford Digital Economy Lab ("Canaries in the Coal Mine," Brynjolfsson, Chandar, Chen): ADP payroll data on millions of workers (Jan 2021–Sep 2025) shows workers aged 22–25 in the most AI-exposed occupations, including software development, saw a 16% relative employment decline controlling for firm-level shocks. Experienced workers in the same occupations were stable or growing (35–49-year-olds up over 8% in raw figures). A Feb 2026 follow-up note says interest rates do not explain the disproportionate entry-level decline. Caveats: correlational, working paper, relative not absolute. An earlier draft's 13% figure still circulates. — [Stanford DEL note, Feb 9 2026](https://digitaleconomy.stanford.edu/news/canaries-interest-rates-and-timinga-more-on-recent-drivers-of-employment-changes-for-young-workers); [Big Think](https://bigthink.com/business/are-young-workers-canaries-in-the-ai-coal-mine/)
- Stack Overflow 2026: the share working in an "organization of one" rose from 4% to 10%. 52% of respondents are still learning new coding skills, and 79% want to build AI skills when learning something new. — [Stack Overflow blog, 2026 survey](https://stackoverflow.blog/2026/10/06/the-results-of-the-2026-developer-survey-are-here/)
- METR's 2026 survey found a developer earning $150K would rather accept a $30K pay cut than return to coding without AI. This is a hypothetical preference measure. — [TechCrunch](https://techcrunch.com/2026/05/29/coders-are-refusing-to-work-without-ai-and-that-could-come-back-to-bite-them/)

**Industry leaders**
- Jensen Huang (Nvidia), World Government Summit, Feb 2024: argued programming is no longer a vital skill. It is technology's job to make it so "nobody has to program," and humans can focus on domains like biology, education, manufacturing, farming. — [Tom's Hardware](https://www.tomshardware.com/tech-industry/artificial-intelligence/jensen-huang-advises-against-learning-to-code-leave-it-up-to-ai)
- Andrew Ng called advice to skip coding because of AI "the worst career advice ever given." He says everyone should learn at least one programming language, though not "the old way." Understanding computers helps people prompt clearly and spot errors. At AI Fund even the CFO and receptionist code. — [OfficeChai](https://officechai.com/ai/not-learning-to-code-because-of-ai-is-the-worst-career-advice-ever-andrew-ng/); [Yahoo/BI](https://tech.yahoo.com/ai/articles/google-brain-founder-andrew-ng-142624045.html); [Analytics Vidhya](https://www.analyticsvidhya.com/blog/2025/03/andrew-ng-on-why-coding-is-essential/)
- Thomas Dohmke (then GitHub CEO, April 2025): "every kid, every child, should learn coding," taught alongside core subjects. He sees AI as lowering the barrier rather than eliminating the need. — [Business Insider NL](https://www.businessinsider.nl/you-should-still-learn-to-code-says-the-ceo-of-github-and-you-should-start-as-early-as-possible); [Slashdot](https://developers.slashdot.org/story/25/04/15/1853254/you-should-still-learn-to-code-says-github-ceo)
- Karpathy's 2023 claim that "the hottest new programming language is English" is the intellectual root of the "you don't need to learn syntax" position. — [Wikipedia: Vibe coding](https://en.wikipedia.org/wiki/Vibe_coding)

**Educators**
- David Malan (Harvard CS50) still recommends learning C in 2026. He intentionally "nerfs" students' editors/LLMs to build fundamentals and argues for learning programming slowly. — [freeCodeCamp podcast #197](https://www.freecodecamp.org/news/harvard-cs50-prof-david-j-malan-on-why-you-should-learn-programming-slowly-podcast-197/)
- CS50 bans third-party AI like ChatGPT/Copilot for coursework because they "tend to be too helpful." It provides its own CS50 duck with pedagogical guardrails that won't hand over homework answers. — [The Register (2024)](https://www.theregister.com/2024/01/27/ai_coding_automatic/)
- Anthropic's own RCT found that delegating code to AI while learning reduced understanding, especially debugging. Using AI for conceptual questions preserved learning. — [Anthropic research](https://www.anthropic.com/research/AI-assistance-coding-skills)

**"Minimal path" recommendations found**
- Ng: at least one programming language. "One of the most important skills of the future is the ability to tell a computer exactly what you want it to do". Syntax matters less. — [Analytics Vidhya](https://www.analyticsvidhya.com/blog/2025/03/andrew-ng-on-why-coding-is-essential/)
- Willison: be able to explain any code before committing it, and vibe code freely on low-stakes projects as a way to learn. — [Simon Willison](https://simonwillison.net/2025/Mar/19/vibe-coding/)
- Anthropic and OpenAI agent docs implicitly assume the user can read a plan, a diff, test output and error messages, and can define verification criteria. — [Claude Code best practices](https://code.claude.com/docs/en/best-practices); [OpenAI Codex best practices](https://learn.chatgpt.com/guides/best-practices)

### Inferences
- **For this learner (wants to build, not become a SWE):** the evidence supports "learn to *read* code and *verify* software" over "learn to *write* code from scratch." A defensible minimal path:
  1. The builder basics (Q1).
  2. A light pass through one language (Python via CS50P, or the JavaScript they already encounter), aimed at reading: variables, functions, conditionals, loops, data structures/JSON, errors/stack traces.
  3. Testing and debugging habits.
  4. Security and secret hygiene.

  This matches Ng's "one language" minimum and Willison's "explain before commit" rule without requiring CS-degree depth.
- The job-market data mainly affects people seeking *entry-level SWE jobs*. For a student who wants to *build their own things* (or join the rising "organization of one" cohort), the relevant question is whether understanding code makes them a better builder. The security, METR and Anthropic-RCT evidence all suggest that understanding helps you catch "almost right" output.
- Huang's position is best read as a long-run prediction about interfaces, not evidence that current agents are reliable without supervision. Current official agent docs all still require human verification.
- If the student later wants a CS career, the entry-level squeeze argues for deeper fundamentals plus visible projects, not less coding.

### Gaps
- Secondary sources claim Indeed data shows software-dev postings up ~18% YoY but ~24% below Feb 2020, and only ~4.5% of postings entry-level in Q1 2026. I could not verify these against Indeed Hiring Lab directly, so treat them as unverified.
- A claim that a Stanford "August 2026 update" puts the gap at ~19% appeared in a search summary but was not verified. The verified figure is 16% (Nov 2025 revision, cited in Feb 2026 note).
- The figures "7.0% unemployment for recent CS grads (NY Fed)" and "65% drop in Big Tech new-grad hiring (SignalFire)" appeared only in secondary summaries. Not verified.
- BLS page did not show a 2025–2035 projection for "computer programmers" specifically. Historically that occupation has been projected to decline, but this was not verified here.
- No longitudinal evidence exists on whether non-coders who build only via agents hit a ceiling. This is a genuine evidence gap; opinions dominate.
- I did not find a statement from Malan directly answering "should non-CS people still learn to code" in 2026. A podcast segment titled "Should we really learn CS still?" exists, but I didn't read its content.

---

## Q4. Good free beginner resources for these basics

### Takeaway
Free, high-quality resources exist for every item in the builder-basics curriculum. Favor official, short, hands-on resources (GitHub Skills, MDN, git-scm, npm docs, the agent vendors' own best-practice pages) for the basics. Add CS50P or CS50x if and when the learner wants to read code fluently.

### Cited Findings
- **GitHub Skills, "Introduction to GitHub":** hands-on course in your own copy of a template repo. Covers repositories, branches, commits and pull requests by creating a profile README. "This exercise takes less than one hour to complete." MIT-licensed public repo. — [GitHub Skills: Introduction to GitHub](https://github.com/skills/introduction-to-github). Note: skills.github.com now redirects to [GitHub Learn](https://learn.github.com/skills); the full catalog did not render for verification.
- **GitHub Docs glossary:** concise official definitions of repo, commit, branch, clone, fork, star, README, PR, push/pull. — [GitHub Docs glossary](https://docs.github.com/en/get-started/learning-about-github/github-glossary)
- **GitHub Docs, "Removing sensitive data from a repository":** what to do after leaking a secret (rotate first). — [GitHub Docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- **git-scm reference docs:** `.gitignore` and `git revert`. The free Pro Git book is also on git-scm.com. — [gitignore](https://git-scm.com/docs/gitignore); [git-revert](https://git-scm.com/docs/git-revert); [Pro Git book](https://git-scm.com/book)
- **MDN "Working with JSON":** beginner-friendly JSON tutorial with syntax rules. — [MDN](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON)
- **npm docs:** `npx` and `npm install` reference pages. — [npx](https://docs.npmjs.com/cli/v11/commands/npx); [npm install](https://docs.npmjs.com/cli/v11/commands/npm-install)
- **dotenv README:** what `.env` is and why not to commit it. — [dotenv](https://github.com/motdotla/dotenv)
- **Harvard CS50 (CS50x 2026):** free as OpenCourseWare. Starts in C, then Python, SQL, HTML/CSS/JS, ending with a final project. Related free courses: "CS50 Python" (CS50P) and "CS50 AI." — [CS50x 2026](https://cs50.harvard.edu/x/)
- **Anthropic Academy:** free self-paced courses on Skilljar with certificates, including Claude Code 101 and Claude Code in Action. Sources disagree on prerequisites; one lists terminal and Git basics. — [Tutorials Dojo guide](https://tutorialsdojo.com/claude-skills-unlocked-a-practical-guide-to-anthropic-academys-21-free-courses/); [Pasquale Pillitteri](https://pasqualepillitteri.it/en/news/371/anthropic-academy-free-courses-claude)
- **Claude Code best practices** (verification, plan mode, specs, CLAUDE.md, permissions) and **Claude Code settings** (strict-JSON settings, `.env` deny rules). — [Best practices](https://code.claude.com/docs/en/best-practices); [Settings](https://code.claude.com/docs/en/settings)
- **OpenAI Codex best practices** (plan mode, AGENTS.md, tests, review before accepting, permissions). — [OpenAI Codex best practices](https://learn.chatgpt.com/guides/best-practices)
- **Simon Willison's essay** on responsible AI-assisted programming vs. vibe coding. A good short read for the "when is it OK not to review" judgment. — [simonwillison.net](https://simonwillison.net/2025/Mar/19/vibe-coding/)

### Inferences
- **Suggested order for this learner** (each about 30–90 minutes):
  1. MDN JSON + editing a real `settings.json`.
  2. GitHub Skills "Introduction to GitHub" (branches/commits/PRs in-browser).
  3. git-scm `.gitignore` + dotenv README + GitHub "Removing sensitive data" (fix the encryption misconception).
  4. npm docs on `npm install`/`npx` (then dissect `npx --yes rea-agents@latest setup` together).
  5. Claude Code and Codex best-practices pages (plan → implement → verify → commit).
  6. Willison's essay.
  7. Optionally CS50P for "read-level" Python.
- CS50x starts in C and is a substantial course. For a learner who "doesn't want to code much," CS50P or selected CS50x weeks are likely a better fit than the full course.

### Gaps
- freeCodeCamp's current curriculum (e.g., a dedicated Git/JSON or "AI-assisted coding" track) was not verified in this session. Only its CS50 podcast page was seen.
- The full list of current GitHub Skills courses (e.g. secret scanning or Copilot courses) could not be verified because learn.github.com/skills did not render.
- Anthropic Academy course prerequisites and counts (17 vs 21 courses) conflict across secondary sources. The anthropic.skilljar.com catalog was not fetched directly.
- No specific "Codex for beginners" free course from OpenAI was identified beyond the best-practices docs.
