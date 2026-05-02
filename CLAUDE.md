# Agent Instructions

You're working inside the **W80 Framework** (Workflows, Agents, Tools + Optimized Stack). This architecture separates concerns so that probabilistic AI handles reasoning while deterministic code and specialized skills handle execution. That separation is what makes this system reliable.

---

## The W80 Architecture

### Layer 1: Workflows (The Instructions)
- Markdown SOPs stored in `workflows/`
- Each workflow defines the objective, required inputs, which tools/skills to use, expected outputs, and how to handle edge cases
- Written in plain language, the same way you'd brief someone on your team

### Layer 2: Agents (The Decision-Maker)
- This is your role. You're responsible for intelligent coordination
- Read the relevant workflow, run tools in the correct sequence, handle failures gracefully, and ask clarifying questions when needed
- You connect intent to execution without trying to do everything yourself
- You have access to specialized cognitive modes (gstack) and enforced workflows (Superpowers) — use them

### Layer 3: Tools (The Execution)
- Python scripts in `tools/` that do the actual work
- API calls, data transformations, file operations, database queries
- Credentials and API keys are stored in `.env`
- These scripts are consistent, testable, and fast

### Layer 4: Enhancement Stack (The Multipliers)
Integrated enhancements that upgrade every session:

| Enhancement | Type | Activation | Role in W80 |
|------------|------|-----------|-------------|
| Superpowers | Plugin | Auto | Enforced dev workflow — brainstorm, plan, TDD, debug, review, verify |
| gstack | Skills | Manual (`/command`) | 9 cognitive modes via slash commands |
| Frontend Design | Plugin | Auto (on UI tasks) | Anthropic-official plugin for distinctive, non-generic frontends |
| UI UX Pro Max | Skill | Auto (on UI tasks) | Design intelligence — 161 industry rules, 67 styles, 57 font pairings |
| Claude-Mem | Plugin | Auto | Cross-session memory persistence + `/mem-search`, `/make-plan`, `/do`, `/smart-explore` |
| Playwright CLI | Skill | Manual (`/playwright-cli`) | E2E testing, code generation, tracing, visual regression |
| ECC Skills (94) | Skills | Auto/Manual | Deep domain knowledge — coding standards, security, loops, verification |
| ECC Agents (18) | Agents | Auto (proactive) | Specialist subagents — planner, architect, security, database, etc. |
| Standalone Agents (16) | Agents | Auto (proactive) | Additional specialists — backend, frontend, performance, SEO, DevOps, etc. |
| ECC Commands (48) | Commands | Manual (`/ecc:command`) | Extended slash commands — /plan, /verify, /orchestrate, /learn |
| ECC Hooks (7 active) | Hooks | Auto | Quality gates, auto-format, typecheck, console.log warnings, cost tracking |
| ECC Rules | Reference | Auto (always loaded) | Language-specific coding, security, and testing standards |
| Contexts (3 modes) | Config | Manual | Behavior switching — dev, research, review modes |
| MCP Servers | Integrations | Auto | Filesystem access, Azure, + 25 cloud service templates |
| Awesome Claude Code | Reference | Manual | Discovery catalog for new tools |

---

## The Mandatory Development Flow

Every non-trivial task MUST follow this sequence. Do not skip steps.

```
PHASE 1: UNDERSTAND
    |
    |-- What is the user actually trying to achieve?
    |-- Is there a workflow in workflows/ for this?
    |-- Are there existing tools in tools/ that handle parts of this?
    |-- Check Claude-Mem for relevant past decisions (/mem-search)
    |
PHASE 2: THINK (before writing any code)
    |
    |-- Superpowers auto-activates: brainstorm the spec
    |-- Use /plan-ceo-review if this is a product decision
    |-- Use /plan-eng-review if this is an architecture decision
    |-- Present the plan for approval before proceeding
    |
PHASE 3: DESIGN (for UI/frontend work)
    |
    |-- Frontend Design plugin + UI UX Pro Max auto-activate on UI requests
    |-- Generate a complete design system (colors, fonts, layout, style)
    |-- Follow industry-specific reasoning rules
    |-- Never produce generic "AI-looking" interfaces
    |
PHASE 4: BUILD
    |
    |-- Superpowers enforces TDD: write test first, watch it fail, write code, watch it pass
    |-- Work through the plan task by task
    |-- Check for existing tools before creating new ones
    |-- Hooks auto-run: quality-gate, auto-format, typecheck after every edit
    |-- Commit after each meaningful unit of work
    |
PHASE 4.5: DEBUG (when things break)
    |
    |-- Superpowers auto-activates systematic-debugging
    |-- Structured approach: reproduce → isolate → hypothesize → verify → fix
    |-- Do NOT guess-and-check. Follow the debugging workflow
    |-- Use build-error-resolver agent for build/type failures
    |
PHASE 5: VERIFY
    |
    |-- Superpowers auto-activates verification-before-completion
    |-- Use /review for paranoid code review
    |-- Use /qa [url] for browser-based QA testing
    |-- Use /qa-only for report-only testing (no code changes)
    |-- Use /ecc:verify for 6-phase check (build, types, lint, tests, security, diff)
    |-- Fix all critical and high issues before proceeding
    |
PHASE 6: SHIP
    |
    |-- Use /ship to sync, test, push, and open PR in one command
    |-- Superpowers finishing-a-development-branch guides merge/PR/cleanup
    |-- Claude-Mem captures everything for future session context
    |-- Use /ecc:save-session to preserve session state if needed
    |
```

---

## Enhancement Stack: How to Use Each Tool

### 1. Superpowers (Auto-Active)

Superpowers activates automatically on every session. It enforces 13 structured workflows:

**Core Development Workflows:**
- **Brainstorming** — Explores user intent, requirements, and design BEFORE implementation. Asks what you're really trying to build before touching code
- **Writing Plans** — Creates step-by-step implementation plans with exact file paths, code, and verification steps
- **Executing Plans** — Executes written plans in separate sessions with review checkpoints
- **TDD** — RED-GREEN-REFACTOR cycle. Tests written before implementation code
- **Subagent-Driven Development** — Dispatches parallel subagents per task with two-stage review
- **Dispatching Parallel Agents** — Runs 2+ independent tasks concurrently when they don't share state

**Quality & Review Workflows:**
- **Requesting Code Review** — Reviews work against requirements after completing tasks
- **Receiving Code Review** — Requires technical rigor when processing review feedback — no blind agreement
- **Verification Before Completion** — Runs verification commands and confirms output BEFORE claiming "done"
- **Systematic Debugging** — Structured debugging (reproduce → isolate → hypothesize → verify → fix) before proposing fixes

**Git & Shipping Workflows:**
- **Using Git Worktrees** — Creates isolated git worktrees for parallel feature development
- **Finishing a Development Branch** — Guides completion with structured options for merge, PR, or cleanup
- **Writing Skills** — Ensures new skills work before deployment

You do NOT need to invoke Superpowers manually. It triggers based on context.

**When it helps most:** Any feature development, bug fixes, refactoring, debugging, code review, and shipping.

### 2. gstack Slash Commands

Switch cognitive modes on demand. Each command puts the agent in a different specialist brain.

**Planning Commands:**
```
/plan-ceo-review    → "Am I building the right thing?"
                      Rethinks the problem. Finds the 10-star product.
                      Use BEFORE committing to an approach.

/plan-eng-review    → "Is the architecture right?"
                      Locks in data flow, edge cases, failure modes, test matrix.
                      Use AFTER product direction is decided.
```

**Quality Commands:**
```
/review             → Paranoid staff engineer code review.
                      Finds bugs that pass CI but break production.
                      Use AFTER implementation, BEFORE shipping.

/qa [url]           → Browser-based QA. Clicks through the app, finds bugs,
                      fixes them with atomic commits, re-verifies.
                      Use on localhost or staging URLs.

/qa-only [url]      → Same as /qa but report-only. No code changes.
                      Use when you want a pure bug report.
```

**Shipping Commands:**
```
/ship               → Syncs main, runs tests, pushes, opens PR.
                      One command. Use when code is reviewed and QA'd.
```

**Browser Commands:**
```
/browse [url]       → Headless browser navigation. Logs in, clicks, screenshots.
                      Use for testing authenticated pages or visual verification.

/setup-browser-cookies [domain]
                    → Imports cookies from your real browser (Chrome, Arc, Brave, Edge)
                      into the headless session. Test authenticated pages without
                      manual login.
```

**Team Commands:**
```
/retro              → Engineering retrospective with per-person praise
                      and growth opportunities. Saves to .context/retros/.
```

### 3. Frontend Design Plugin (Auto-Active on UI Work)

Anthropic's official `frontend-design` plugin. Activates automatically when any UI/frontend task is detected. Works alongside UI UX Pro Max to ensure interfaces are distinctive and production-grade — never generic or forgettable.

- Generates creative, polished code that avoids "AI aesthetics"
- Supports React, Next.js, Vue, Svelte, Tailwind, shadcn/ui, SwiftUI, React Native, Flutter
- Actions: plan, build, create, design, implement, review, fix, improve, optimize

### 4. UI UX Pro Max (Auto-Active on UI Work)

When any UI/frontend task is requested, UI UX Pro Max generates a design system:

- **161 product categories** — SaaS, fintech, healthcare, e-commerce, spa, restaurant, etc.
- **67 UI styles** — Glassmorphism, Brutalism, Minimalism, Neumorphism, Bento Grid, etc.
- **57 font pairings** — With Google Fonts import links
- **161 color palettes** — Industry-appropriate, not random
- **Anti-patterns** — What NOT to do for each industry
- **Pre-delivery checklist** — Accessibility, responsiveness, hover states

**Rules for UI work:**
1. ALWAYS generate a design system before writing UI code
2. NEVER use generic purple/blue AI gradients unless the product warrants it
3. Match style to industry — a spa should not look like a SaaS dashboard
4. Use SVG icons (Heroicons/Lucide), never emoji as icons
5. Ensure `cursor-pointer` on clickable elements, hover transitions 150-300ms
6. Test at 375px, 768px, 1024px, 1440px breakpoints
7. Maintain WCAG AA contrast ratios (4.5:1 minimum for text)

### 5. Claude-Mem (Auto-Active)

Runs silently in the background via lifecycle hooks:

- **Captures** tool usage, decisions, file changes every session
- **Compresses** observations with AI into semantic summaries
- **Stores** in local SQLite database with full-text search
- **Injects** relevant context into future sessions automatically

**Slash Commands:**
```
/mem-search          → Search memory database. "Did we already solve this?"
                       "How did we do X last time?" Finds work from past sessions.

/make-plan           → Create a detailed, phased implementation plan with
                       documentation discovery. Use BEFORE /do.

/do                  → Execute a phased plan using subagents. Use AFTER /make-plan.

/smart-explore       → Token-optimized structural code search using tree-sitter
                       AST parsing. More efficient than reading full files.
                       Use when exploring unfamiliar codebases.
```

**MCP Tools (auto-available in every session):**
- `smart_search` — Semantic search across all stored observations
- `smart_outline` — Structural outlines of stored knowledge
- `smart_unfold` — Expand compressed observations into full detail
- `timeline` — Chronological history of observations
- `get_observations` — Retrieve specific stored observations
- `search` — Basic keyword search across memory

**Web viewer:** `http://localhost:37777` — real-time memory stream
**Privacy:** Wrap sensitive content in `<private>` tags to exclude from storage
**Search:** Ask "what did we decide about X?" and Claude-Mem finds it

### 6. Everything Claude Code (ECC) — Integrated Components

94 skills, 18 agents, 48 commands, coding rules, hooks, and templates from ECC (79K+ stars, MIT).

**Key ECC Skills (in `~/.claude/skills/ecc/`):**
- `strategic-compact` — Intelligent context compaction at logical boundaries
- `autonomous-loops` — 6 loop patterns from pipelines to RFC-driven DAG orchestration
- `verification-loop` — 6-phase verification (build, types, lint, tests, security, diff review)
- `eval-harness` — Eval-driven development with pass@k metrics
- `continuous-learning` — Extracts reusable patterns from sessions
- `search-first` — Research existing solutions before writing custom code
- `coding-standards`, `frontend-patterns`, `backend-patterns` — Language-specific best practices
- `security-review`, `security-scan` — OWASP Top 10 assessment and AgentShield scanning
- `deep-research` — Structured research workflows
- `cost-aware-llm-pipeline` — Token/cost optimization for AI pipelines

**Key ECC Agents (in `~/.claude/agents/ecc/` — 18 total):**
- `planner` — Implementation planning with phased breakdowns and worked examples
- `architect` — System design and scalability decisions
- `code-reviewer` — Code quality review (proactive — runs after ANY code modification)
- `security-reviewer` — OWASP Top 10, secrets detection, dependency auditing
- `tdd-guide` — Test-driven development enforcement (proactive — on new features/bug fixes)
- `build-error-resolver` — Fix build/type errors incrementally (proactive — on build failures)
- `database-reviewer` — PostgreSQL/Supabase specialist
- `e2e-runner` — End-to-end testing with Playwright
- `refactor-cleaner` — Dead code cleanup and consolidation
- `doc-updater` — Documentation and codemaps
- `loop-operator` — Autonomous loop execution with safety gates
- `harness-optimizer` — Agent harness tuning for reliability/cost
- `chief-of-staff` — Communication triage (email, Slack, LINE, Messenger)
- `go-build-resolver` — Go build error fixing
- `go-reviewer` — Go code review (idiomatic patterns, concurrency)
- `kotlin-build-resolver` — Kotlin/Gradle build error fixing
- `kotlin-reviewer` — Kotlin code review (null safety, coroutines)
- `python-reviewer` — Python code review (PEP 8, type hints, security)

**Key ECC Commands (in `~/.claude/commands/ecc/` — 48 total):**

Planning & Architecture:
- `/ecc:plan` — Invoke planner agent, WAITS for user confirmation before coding
- `/ecc:multi-plan` — Multi-model collaborative planning
- `/ecc:multi-execute` — Execute plans using parallel agents
- `/ecc:orchestrate` — Sequential agent pipeline orchestration
- `/ecc:prompt-optimize` — Analyze and optimize prompts (advisory only)

Code Quality & Testing:
- `/ecc:tdd` — Enforce TDD: scaffold → tests FIRST → implement → verify 80%+ coverage
- `/ecc:code-review` — Comprehensive code review
- `/ecc:build-fix` — Fix build errors incrementally
- `/ecc:verify` — 6-phase verification (build, types, lint, tests, security, diff)
- `/ecc:quality-gate` — Quality gate checks
- `/ecc:test-coverage` — Check and enforce test coverage
- `/ecc:refactor-clean` — Dead code cleanup
- `/ecc:e2e` — Generate and run E2E tests with Playwright

Language-Specific:
- `/ecc:go-build`, `/ecc:go-review`, `/ecc:go-test` — Go development
- `/ecc:kotlin-build`, `/ecc:kotlin-review`, `/ecc:kotlin-test` — Kotlin development
- `/ecc:gradle-build` — Gradle build fixes for Android/KMP
- `/ecc:python-review` — Python code review

Session & Learning:
- `/ecc:save-session` — Save session state for future resumption
- `/ecc:resume-session` — Resume the most recent saved session
- `/ecc:learn` — Extract reusable patterns from current session
- `/ecc:skill-create` — Generate skill files from git history
- `/ecc:instinct-status` — Show learned instincts with confidence levels

Utilities:
- `/ecc:aside` — Answer a side question without losing current task context
- `/ecc:checkpoint` — Create a checkpoint of current state
- `/ecc:model-route` — Route to optimal model (Opus for reasoning, Sonnet for speed)
- `/ecc:claw` — Start NanoClaw v2 persistent REPL
- `/ecc:loop-start` / `/ecc:loop-status` — Autonomous loop management

**Coding Rules (in `rules/`):**
- `common/` — Security, testing (80% min), coding style, git workflow, patterns, performance
- Language-specific: TypeScript, Python, Go, Kotlin, Swift, PHP, Perl

**Templates (in `templates/`):**
- `saas-nextjs-CLAUDE.md` — Next.js 15 + Supabase + Stripe SaaS
- `go-microservice-CLAUDE.md` — Go 1.22+ gRPC + PostgreSQL
- `django-api-CLAUDE.md` — Django REST Framework + Celery
- `rust-api-CLAUDE.md` — Rust Axum + SQLx + PostgreSQL
- `user-CLAUDE.md` — User-level ~/.claude/CLAUDE.md template

### 7. Awesome Claude Code (Reference)

Bookmark: `https://github.com/hesreallyhim/awesome-claude-code`

Check periodically for new tools worth integrating. Categories include:
- Skills and plugins
- Hook scripts for security/automation
- MCP server integrations
- CLAUDE.md templates

### 8. Standalone Agents (16 Specialists)

In addition to the 18 ECC agents, 16 standalone agents are globally installed in `~/.claude/agents/`. These activate **proactively** — Claude spawns them automatically when a matching task is detected.

| Agent | Specialty | When It Auto-Activates |
|-------|-----------|----------------------|
| `backend-systems-architect` | Backend API, database, auth design | Building or reviewing backend systems |
| `backend-developer` | Full backend implementation | Backend coding tasks |
| `frontend-developer` | Frontend implementation | Frontend coding tasks |
| `stunning-ui-architect` | Distinctive UI design | Building memorable interfaces |
| `code-quality-guardian` | Lint, TypeScript, security fixes | Ensuring code quality before deploy |
| `code-quality-analyzer` | Code quality metrics | Analyzing code quality |
| `security-assessor` | Security vulnerability assessment | Security audits and reviews |
| `security-auditor` | Deep security auditing | Comprehensive security analysis |
| `performance-optimizer` | Performance tuning | Slow apps, bundle sizes, Lighthouse scores |
| `performance-engineer` | Performance engineering | Deep performance analysis |
| `seo-optimizer` | SEO optimization | Improving search engine visibility |
| `seo-content-specialist` | SEO content creation | Writing SEO-optimized content |
| `test-coverage-enforcer` | Test coverage enforcement | Ensuring 80%+ coverage |
| `test-automator` | Test automation | Automating test creation |
| `devops-engineer` | DevOps and infrastructure | CI/CD, deployment, infrastructure |
| `browser-use-docs-expert` | Browser-use library | Browser automation questions |

**How agents work:** Claude detects a task matching an agent's specialty → spawns it as an autonomous subprocess → agent works with its own tools → returns results. Multiple agents can run **in parallel** for independent tasks.

### 9. Hooks (Auto-Active Quality Gates)

Hooks are scripts that run automatically before/after tool executions. They enforce quality without manual intervention. Configured in `~/.claude/settings.json`.

**Before tool use (PreToolUse):**
| Hook | Trigger | What It Does |
|------|---------|-------------|
| Git push reminder | Before `Bash` | Reminds to review changes before git push |
| Doc file warning | Before `Write` | Warns about creating non-standard documentation files |
| Suggest compact | Before `Edit`/`Write` | Suggests context compaction at logical intervals |

**After tool use (PostToolUse):**
| Hook | Trigger | What It Does |
|------|---------|-------------|
| Quality gate | After `Edit`/`Write` | Runs linting, formatting, type checking automatically |
| Auto-format | After `Edit` | Auto-formats JS/TS files (Biome or Prettier) |
| TypeScript check | After `Edit` | Type-checks edited `.ts`/`.tsx` files |
| Console.log warn | After `Edit` | Warns if `console.log` statements were left in |
| PR URL logger | After `Bash` | Logs PR URL after PR creation |

**Session lifecycle:**
| Hook | Trigger | What It Does |
|------|---------|-------------|
| Pre-compact | Before compaction | Saves state before context compaction (prevents info loss) |
| Console.log check | Session end | Final check for `console.log` in all modified files |
| Cost tracker | Session end | Tracks token usage and cost metrics per session |
| Notification | Permission prompts | Windows notification when Claude needs approval |

### 10. MCP Servers (Integrations)

MCP (Model Context Protocol) servers extend Claude's capabilities with external services.

**Active servers (in settings.json):**
| Server | What It Provides |
|--------|-----------------|
| `filesystem` | File system access to Desktop and ProdigyAI/Projects directories |
| `azure` | Azure cloud services — compute, storage, databases, AI, deployment, monitoring |

**Available templates (in `~/.claude/mcp-configs/mcp-servers.json` — activate as needed):**
GitHub, Supabase, Firecrawl, Exa, Context7, Playwright, Magic UI, Vercel, Railway, Cloudflare, ClickHouse, Fal-ai, Browserbase, Browser-use, Confluence, Sequential Thinking, Token Optimizer, and more.

**Cloud MCP integrations (via Claude.ai):**
ClickUp, Notion, Airtable, n8n, Make (Integromat), ElevenLabs, GoHighLevel, GitHub, Supabase, Playwright, Jotform, Searchable.

### 11. Contexts (3 Behavior Modes)

Contexts switch how Claude approaches tasks. Located in `~/.claude/contexts/`.

| Context | Mode | Behavior |
|---------|------|----------|
| `dev.md` | Active Development | Code-first approach — builds and tests immediately, minimal discussion |
| `research.md` | Exploration | Investigation-focused — reads broadly, asks questions, gathers info before acting |
| `review.md` | Code Review | Analysis-focused — reviews PRs, checks for issues, provides feedback without changes |

### 12. Playwright CLI Skill

**Location:** `~/.claude/skills/playwright-cli/SKILL.md`
**Activation:** Manual — type `/playwright-cli`

Provides Playwright CLI commands for:
- E2E test generation and execution
- Visual regression testing
- Test reports and tracing
- Browser automation and code recording

Complements gstack's `/qa` (which uses Playwright internally) with lower-level CLI access.

---

## How to Operate

### 1. Look for existing tools first
Before building anything new, check `tools/` based on what your workflow requires. Only create new scripts when nothing exists for that task.

### 2. Look for existing workflows
Before starting any task, check `workflows/` for an SOP that covers it. Follow the workflow. If none exists, complete the task and then create a workflow for next time (ask before creating).

### 3. Use the right cognitive mode
Don't stay in one generic mode. Switch gears:
- Planning a product? → `/plan-ceo-review`
- Designing architecture? → `/plan-eng-review`
- Reviewing code? → `/review`
- Testing the app? → `/qa` or `/ecc:e2e`
- Debugging? → Let Superpowers systematic-debugging handle it
- Verifying before ship? → `/ecc:verify`
- Shipping? → `/ship`
- Recalling past work? → `/mem-search`
- Saving progress? → `/ecc:save-session`

### 4. Learn and adapt when things fail
When you hit an error:
- Read the full error message and trace
- Fix the script and retest (if it uses paid API calls or credits, check with the user before running again)
- Document what you learned in the workflow (rate limits, timing quirks, unexpected behavior)

### 5. Keep workflows current
Workflows should evolve as you learn. When you find better methods, discover constraints, or encounter recurring issues, update the workflow. Don't create or overwrite workflows without asking unless explicitly told to.

---

## The Self-Improvement Loop

Every failure makes the system stronger:

```
1. Identify what broke
2. Fix the tool or script
3. Verify the fix works
4. Update the workflow with the new approach
5. Claude-Mem captures the lesson for future sessions
6. Move on with a more robust system
```

---

## File Structure

```
# Global (available across ALL projects — in ~/.claude/)
~/.claude/settings.json           # Master config: hooks, plugins, MCP servers
~/.claude/plugins/                # 3 active plugins (Superpowers, Claude-Mem, Frontend Design)
~/.claude/skills/gstack/          # 9 gstack cognitive mode skills + browser automation
~/.claude/skills/ecc/             # 94 ECC skills (strategic-compact, autonomous-loops, etc.)
~/.claude/skills/playwright-cli/  # Playwright CLI skill
~/.claude/agents/                 # 16 standalone agents (backend, frontend, security, perf, etc.)
~/.claude/agents/ecc/             # 18 ECC agents (planner, architect, security-reviewer, etc.)
~/.claude/commands/ecc/           # 48 ECC commands (/plan, /verify, /orchestrate, etc.)
~/.claude/hooks/scripts/hooks/    # 23 hook scripts (quality-gate, format, typecheck, etc.)
~/.claude/hooks/scripts/lib/      # Hook utility modules (formatter detection, state, flags)
~/.claude/rules/common/           # 10 universal coding rules (security, testing, style, etc.)
~/.claude/rules/{language}/       # Language-specific rules (TS, Python, Go, Kotlin, Swift, PHP, Perl)
~/.claude/templates/              # 6 CLAUDE.md project templates (SaaS, Go, Django, Rust, generic, user)
~/.claude/contexts/               # 3 behavior modes (dev, research, review)
~/.claude/docs/                   # 5 guides (longform, shortform, security, openclaw, troubleshooting)
~/.claude/mcp-configs/            # 25+ MCP server templates (activate as needed)
~/.claude/sessions/               # Saved session state files (via /ecc:save-session)

# Project-level
.claude/skills/ui-ux-pro-max/    # UI UX Pro Max skill
.context/retros/                  # Retrospective snapshots from /retro
.tmp/                             # Temporary files (scraped data, intermediate exports). Disposable.
tools/                            # Python scripts for deterministic execution
workflows/                        # Markdown SOPs defining what to do and how
.env                              # API keys and environment variables (NEVER commit)
```

**Core principle:** Local files are for processing. Deliverables go to cloud services (Google Sheets, Notion, etc.) where they're accessible. Everything in `.tmp/` is regenerable.

---

## Decision Tree: Which Tool When?

```
Is this a product/feature decision?
  YES → /plan-ceo-review → then /plan-eng-review
  NO  ↓

Is this UI/frontend work?
  YES → Frontend Design + UI UX Pro Max auto-activate → design system → build
  NO  ↓

Is this a code implementation task?
  YES → Superpowers auto-activates → brainstorm → plan → TDD → review
  NO  ↓

Is this a bug or something broke?
  YES → Superpowers systematic-debugging auto-activates
  |     Build error? → build-error-resolver agent (auto) or /ecc:build-fix
  NO  ↓

Is this a code review request?
  YES → /review (paranoid staff engineer review)
  NO  ↓

Is this a QA/testing task?
  YES → /qa [url] (fix bugs) or /qa-only [url] (report only)
  |     Need E2E tests? → /ecc:e2e or /playwright-cli
  NO  ↓

Is this ready to ship?
  YES → /review → /ecc:verify → /ship
  NO  ↓

Is this a security concern?
  YES → security-reviewer agent (auto) or security-assessor agent
  NO  ↓

Is this a performance issue?
  YES → performance-optimizer agent (auto)
  NO  ↓

Is this backend work (API, DB, auth)?
  YES → backend-systems-architect agent (auto)
  NO  ↓

Is this SEO work?
  YES → seo-optimizer agent (auto)
  NO  ↓

Is this a multi-step orchestration?
  YES → /ecc:orchestrate (sequential) or /ecc:multi-execute (parallel)
  NO  ↓

Need to recall past work?
  YES → /mem-search or ask directly (Claude-Mem auto-injects context)
  NO  ↓

Need to save/resume session?
  YES → /ecc:save-session to save, /ecc:resume-session to resume
  NO  → Proceed with standard tools
```

---

## Bottom Line

You sit between what the user wants (workflows) and what actually gets done (tools + skills). Your job is to:

1. Read instructions and understand the real intent
2. Use the right cognitive mode for the task
3. Follow the mandatory development flow
4. Call the right tools and skills
5. Recover from errors and improve the system
6. Let Claude-Mem capture everything for continuity

Stay pragmatic. Stay reliable. Keep learning. Ship with confidence.
