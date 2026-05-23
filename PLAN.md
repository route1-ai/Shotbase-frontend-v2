# Shotbase — Build & Launch Plan

_Last updated: 2026-05-20. Owner: Manish. Single source of truth for the next 4 weeks._

---

## 0. Legend

- 🤖 **Claude Code** — backend, API, SDKs, schema, infra-as-code, scripts
- 🎨 **Antigravity** — frontend UI work, dashboard redesign, landing tweaks
- 🔧 **Off-the-shelf tool** — buy/install, do not build
- ✋ **You only** — decisions, recordings, posts, customer calls

---

## 1. Strategic Frame

**Wedge.** Shotbase is positioned as **"the screenshot + visual-extraction API for AI agents — including the regulated ones."** Not indie-dev DX (ScreenshotOne owns it). Not enterprise reliability (Urlbox owns it). Not link previews (Microlink owns it). AI agents, with compliance-readiness baked in from day one.

**Leverage.** Three real edges, none permanent:
1. **Positioning freedom** — no existing customers to confuse by repositioning.
2. **Speed** — ship in 2 days what an incumbent ships in 6 weeks.
3. **Distribution arbitrage** — the canonical "screenshot API in LangChain / MCP / Vercel AI SDK / Claude Skills" slot is open right now and closes in ~12 months.

**Customer for the next 90 days.** AI agent builders. Startups shipping LLM-powered tools that need to capture/extract pages programmatically. Secondary: AI-tooling buyers in healthcare/legal/fintech (the compliance-ready angle).

**Tagline (replaces current "Screenshot any URL. One API call.").**
> _The screenshot API for AI agents. Render any URL, extract structured data, return both in one call._

---

## 2. Fixed Scope — 25 Items

Anything not on this list is in `someday.md`. Scope is closed until launch.

### 2.1 Wedge features (the differentiator)

| # | Item | Effort | Owner |
|---|---|---|---|
| W1 | `/extract` endpoint — URL + JSON schema → `{screenshot, extracted_data}` in one call | 3 d | 🤖 |
| W2 | `/markdown` endpoint — URL → page as markdown (readability.js + turndown) | 1 d | 🤖 |
| W3 | Polished MCP server — published to `mcp.so` registry + Anthropic Skills | 1 d | 🤖 |
| W4 | Idempotency keys + deterministic re-renders | 1 d | 🤖 |
| W5 | Vision-ready response shape (base64 + JSON in one payload) | 0.5 d | 🤖 |

### 2.2 Parity floor (table stakes — can't ship without)

| # | Item | Effort | Owner |
|---|---|---|---|
| P1 | PDF output | 0.5 d | 🤖 |
| P2 | Cookie/popup/banner removal (fork **ScreenshotOne's open-source rules**) | 1 d | 🤖 |
| P3 | Already shipped: PNG/JPEG/WebP, full-page, viewport, device emulation, wait/delay, custom JS, auth headers, API keys, billing | — | — |

### 2.3 Distribution wrappers (the actual GTM)

| # | Item | Effort | Owner |
|---|---|---|---|
| D1 | LangChain tool — `@shotbase/langchain` (npm) + `shotbase-langchain` (pypi) | 1 d | 🤖 |
| D2 | Vercel AI SDK provider package — `@shotbase/ai-sdk` | 0.5 d | 🤖 |
| D3 | Stagehand action / Browser Use plugin | 1 d | 🤖 |
| D4 | Claude Skill — submit to Anthropic Skills registry | 0.5 d | 🤖 |
| D5 | n8n community node | 1 d | 🤖 |
| D6 | Polished TS + Python SDKs (skip Go/Ruby/PHP for v1) | 1 d | 🤖 |

### 2.4 Compliance-ready (architected, not certified)

| # | Item | Effort | Owner |
|---|---|---|---|
| A1 | Verify + document encryption posture (TLS 1.3 in transit, AES-256 at rest) | 0.5 d | 🤖 |
| A2 | Audit log table — every API call appended, 90-day default retention | 0.5 d | 🤖 |
| A3 | `DELETE /api/account` — GDPR/CCPA right-to-erasure | 0.5 d | 🤖 |
| A4 | Configurable per-org screenshot retention (30/60/90/365) | 0.5 d | 🤖 |
| A5 | IP allowlist per API key | 0.5 d | 🤖 |
| A6 | PII redaction toggle on `/extract` | 1 d | 🤖 |
| A7 | Legal pages — Privacy / ToS / DPA / Subprocessors | 0.5 d | ✋ + Claude.ai chat for drafts |
| A8 | `/trust` page — encryption, subprocessors, compliance roadmap | 0.5 d | 🎨 |

### 2.5 Dashboard redesign (see §3 for full spec)

| # | Item | Effort | Owner |
|---|---|---|---|
| U1 | Unified `/dashboard/*` shell with persistent left sidebar + top bar | 1 d | 🎨 |
| U2 | Migrate `/account/{billing,profile,security,preferences}` → `/dashboard/settings/*` | 0.5 d | 🎨 |
| U3 | Per-section pages: Overview, Playground, API Keys, Logs, Webhooks, Usage, Settings, Trust | 2 d | 🎨 |
| U4 | Wire all pages to existing + new API endpoints; loading/empty/error states | 1 d | 🎨 + 🤖 |

### 2.6 Operations setup (3 hours total)

| # | Item | Effort | Owner |
|---|---|---|---|
| O1 | Sentry — error tracking, alerts to Slack/Discord | 30 min | 🔧 |
| O2 | Better Uptime — pings `/api/health` + 3 key endpoints every 5 min | 15 min | 🔧 |
| O3 | Vercel Agent — turn on for AI incident analysis | 5 min | 🔧 |
| O4 | Buffer or Typefully — cross-post LinkedIn ↔ Twitter | 30 min | 🔧 |
| O5 | Notion progress log — daily what-shipped table | 5 min/day | ✋ |
| O6 | Loops.so or Resend — waitlist + email capture wired to landing | 1 h | 🤖 |

### 2.7 Bug fixes already done in this session (commit + deploy)

| # | Item | Effort | Owner |
|---|---|---|---|
| B1 | Commit + push `proxy.ts` (Clerk redirect fix) + `app/api/webhooks/clerk/route.ts` (500 → 400/503) | 15 min | ✋ |
| B2 | Decide canonical pricing: `$29/$99/$399` (billing page) vs `$9/$19/$49` (live marketing) — kill the other | 30 min | ✋ |

### 2.8 Security & abuse prevention (table stakes for an API product)

These are not optional. An unmetered AI-extraction endpoint with no rate limit is one viral tweet away from a $10K bill.

| # | Item | Effort | Owner |
|---|---|---|---|
| S1 | **Rate limiting** on every API route — IP-based + API-key-based, Upstash Redis (already in stack). Exponential backoff on auth endpoints. Per-plan request budgets enforced server-side. | 1 d | 🤖 |
| S2 | **Security headers** — `Content-Security-Policy`, `Strict-Transport-Security` (HSTS preload), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`. Configure in `next.config.ts` `headers()`. | 0.5 d | 🤖 |
| S3 | **Spend alerts + hard caps** — set monthly hard caps and email alerts on every paid API: Vercel AI Gateway, Anthropic/OpenAI (whichever powers `/extract`), Railway, Vercel Functions, Supabase, Unkey. **Set BEFORE launch, not after.** | 1 h | 🔧 |
| S4 | **Zod input validation** on every API route — never trust client input. Validate type, length, format, range on both client and server. Reject malformed payloads with 400 before any DB/LLM call. | 1 d | 🤖 |
| S5 | **Bot protection on signup/login** — enable Clerk's built-in bot detection (Cloudflare Turnstile). Catches scripted account creation. | 30 min | 🔧 |
| S6 | **Cookie consent banner** — GDPR requires it for EU users. Use `react-cookie-consent` or Vercel's analytics-cookie template. Honor the choice (don't fire analytics if rejected). | 0.5 d | 🎨 |
| S7 | **Pre-launch security audit pass** — run the prompts in Appendix §11 against the codebase, log findings to `security-audit.md`, fix every High/Critical before launch. | 1 d | 🤖 |
| S8 | **Secret audit** — install `gitleaks` and run on full history; verify frontend bundle has no leaked keys (`pnpm build && grep -r "sk-\|API_KEY\|SECRET\|TOKEN" .next/static/`); confirm `.env*` are all gitignored; sanitize secrets from logs/error messages. | 0.5 d | 🤖 |

**Scope total: 33 items + 6 ops setup + 2 immediate fixes. Solo-buildable in 4 weeks.**

---

## 3. Dashboard Redesign Spec

### 3.1 What's wrong with the current shell

- `/dashboard` has its own sidebar but uses JS-state tabs (`Overview / API Keys / Logs`) — not real routes. No deep links, no browser back, no shareable URLs.
- `/account/*` is a completely separate URL space with its own `layout.tsx`. Two disconnected shells.
- Users go `/dashboard` → click "Billing" → not there → must find `/account/billing` via the marketing nav.
- No persistent top bar, no command palette, no breadcrumbs.

### 3.2 Reference dashboards to study (open these tabs while designing)

| Tool | URL | Steal |
|---|---|---|
| Stripe | dashboard.stripe.com | Persistent left nav, top-bar workspace switcher, dense logs |
| Resend | resend.com (signed in) | Best-in-class developer dashboard: clean, focused, code-first |
| Vercel | vercel.com (signed in) | Top-bar org switcher, sidebar inside project, deep-linkable |
| Clerk | dashboard.clerk.com | Modern auth/usage dashboard with sectioned sidebar |
| Linear | linear.app | Sidebar collapsibility, keyboard shortcuts, settings UX |
| ScreenshotOne | screenshotone.com (sign up free) | Direct competitor — see their post-signin UX |
| Browserless | account.browserless.io | See how they handle API keys + sessions + usage |

**Action:** ✋ sign up for free accounts at ScreenshotOne and Browserless. Screenshot every page of their dashboards. Put screenshots in a Notion doc called "Dashboard Inspiration." 2 hours, one evening.

### 3.3 New IA — one shell at `/dashboard/*`

```
/dashboard                       → Overview
/dashboard/playground            → Interactive screenshot tool
/dashboard/keys                  → API key management
/dashboard/logs                  → Request log viewer
/dashboard/webhooks              → Webhook endpoints
/dashboard/usage                 → Usage & limits
/dashboard/settings              → (redirects to /dashboard/settings/profile)
/dashboard/settings/profile
/dashboard/settings/billing
/dashboard/settings/security
/dashboard/settings/preferences
/dashboard/settings/team         → (v2, link disabled in v1)
/dashboard/settings/notifications
/dashboard/trust                 → Trust Center (also public-linkable)
```

Delete `/account/*` after migration. Add `next.config` redirects from old paths.

### 3.4 Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [Logo  shotbase  v]   Search ⌘K       Status●   [User v]    │  ← TopBar (sticky, h=56)
├─────────────┬────────────────────────────────────────────────┤
│             │                                                 │
│  Overview   │                                                 │
│  Playground │                                                 │
│  API Keys   │              Page content                       │
│  Logs       │              (with breadcrumbs)                 │
│  Webhooks   │                                                 │
│  Usage      │                                                 │
│             │                                                 │
│  ───        │                                                 │
│  Docs ↗     │                                                 │
│  Trust ↗    │                                                 │
│             │                                                 │
│  Settings v │                                                 │
│             │                                                 │
└─────────────┴────────────────────────────────────────────────┘
   w=220                  remaining width
```

**Sidebar behavior:** collapsible to icon-only (w=56), state persists via localStorage. Active link highlighted with the existing `#00e87b` brand color.

**Top bar:**
- Left: workspace/org switcher (logo + name + chevron) — even if solo today, hook it up for future multi-org
- Center: `⌘K` global search (jump to any page, search logs)
- Right: status dot (green/yellow/red — wired to Better Uptime), user menu

### 3.5 Per-page spec

**Overview** (`/dashboard`)
- Empty state for first-time users: "You haven't made a request yet" with prominent curl snippet using their default API key
- Filled state: 4 metric cards (Requests this month / Quota % / Avg latency / Error rate)
- 30-day usage chart
- Last 20 requests table (collapsible row → full request/response JSON)
- Right-hand sticky panel: copy-paste-ready code samples (`curl` / `JS` / `Python` / `LangChain` / `MCP`)

**Playground** (`/dashboard/playground`)
- URL input + Options drawer (viewport, format, full-page, wait, popup-removal toggle, redact-pii, extract schema)
- Live preview (image + extracted JSON tabs)
- "Copy as curl" / "Copy as JS" buttons under preview
- "Save as template" → stores under Settings → Templates (v2)

**API Keys** (`/dashboard/keys`)
- Table: Name, Created, Last used, Scopes, IP allowlist (badge if set), Actions
- "Create key" → modal with name + scopes + optional IP allowlist
- Reveal-once banner after creation (one-time copy)

**Logs** (`/dashboard/logs`)
- Filters: date range, endpoint, status, API key, search by URL substring
- Table: Time, Endpoint, Status, Latency, Key, Region
- Row click → side drawer with full request + response + audit trail
- CSV export button

**Webhooks** (`/dashboard/webhooks`)
- List of configured webhook URLs (event types, signing secret reveal, last delivery status)
- "Add webhook" form
- Recent deliveries table with retry button

**Usage** (`/dashboard/usage`)
- Current plan card (with Upgrade CTA if not max tier)
- Quota progress bar
- Rate limit info
- Per-endpoint breakdown table
- Per-region breakdown chart

**Settings** (`/dashboard/settings/*`) — secondary sidebar inside settings pages:
- Profile / Billing / Security / Preferences / Notifications / Team (disabled in v1)

**Trust Center** (`/dashboard/trust` — also public)
- Encryption posture, subprocessors list, certifications roadmap, incident history, security contact

### 3.6 Component reuse

Use existing shadcn + Base UI components. Don't introduce a new component library. Keep the `#00e87b` brand green. Match the dark aesthetic from the current `/dashboard/page.tsx`.

### 3.7 Frontend ↔ backend wiring rules

- All data fetches go through one TanStack Query / SWR layer in `lib/api.ts` — no `fetch` calls scattered in components
- Every page handles three states explicitly: loading skeleton / empty state / error toast
- Mutations (create key, revoke, add webhook) use optimistic updates
- Errors from API surface as toast notifications via `sonner` (or existing toast lib)
- Loading skeletons match the final layout shape (no jarring CLS)

---

## 4. 4-Week Sprint Plan

Day-by-day. Each item shows owner.

### Week 1 — Foundation + wedge core (the hardest week)

| Day | Tasks |
|---|---|
| **1 (Mon)** | ✋ B1 commit/push bug fixes • ✋ B2 decide pricing • 🔧 O1 Sentry • 🔧 O2 Better Uptime • 🔧 O3 Vercel Agent • 🔧 **S3 spend caps/alerts (1 hr — do this BEFORE any other code)** • 🤖 O6 waitlist wiring • 🎨 rewrite landing hero to new tagline |
| **2 (Tue)** | 🎨 U1 + U2 build unified `/dashboard/*` shell + migrate account routes • 🤖 **S2 security headers in `next.config.ts`** (~30 min, slot in) |
| **3 (Wed)** | 🎨 U3 Overview + Playground pages • 🔧 **S5 Clerk bot protection** (toggle, 30 min) |
| **4 (Thu)** | 🤖 W2 `/markdown` endpoint + 🤖 W4 idempotency keys |
| **5 (Fri)** | 🤖 **S1 rate limiting** (Upstash Redis sliding window per route + per key) — **do this before `/extract` ships** |
| **6 (Sat)** | 🤖 W1 `/extract` start — schema validation + Vercel AI Gateway integration • 🤖 **S4 Zod validation on every new endpoint as we go** |
| **7 (Sun)** | ✋ rest / weekly review / write Week 1 LinkedIn recap |

### Week 2 — Polish + remaining wedge + compliance core

| Day | Tasks |
|---|---|
| **8 (Mon)** | 🤖 W1 `/extract` finish + tests (carries over from Sat) • 🤖 P1 PDF • 🤖 P2 cookie-banner integration • 🤖 W5 vision-ready response • 🎨 **S6 cookie consent banner** |
| **9 (Tue)** | 🤖 W3 MCP polish + publish |
| **10 (Wed)** | 🎨 U3 API Keys + Logs pages + 🎨 U4 wiring |
| **11 (Thu)** | 🎨 U3 Webhooks + Usage pages |
| **12 (Fri)** | 🤖 A1 encryption doc • 🤖 A2 audit log table • 🤖 A3 delete endpoint |
| **13 (Sat)** | 🤖 A4 retention config • 🤖 A5 IP allowlist |
| **14 (Sun)** | ✋ Week 2 LinkedIn recap + Veo 3 video script drafted |

### Week 3 — Distribution wrappers + SDKs + compliance polish

| Day | Tasks |
|---|---|
| **15 (Mon)** | 🤖 D6 TS SDK |
| **16 (Tue)** | 🤖 D6 Python SDK |
| **17 (Wed)** | 🤖 D1 LangChain tool (npm + pypi) |
| **18 (Thu)** | 🤖 D2 Vercel AI SDK provider + 🤖 D3 Stagehand / Browser Use plugin |
| **19 (Fri)** | 🤖 D4 Claude Skill submission + 🤖 D5 n8n node |
| **20 (Sat)** | 🤖 A6 PII redaction toggle + 🎨 A8 Trust page |
| **21 (Sun)** | ✋ A7 legal pages drafted via Claude.ai + Week 3 LinkedIn recap |

### Week 4 — Launch prep

| Day | Tasks |
|---|---|
| **22 (Mon)** | 🤖 **S7 security audit pass** — run prompts from Appendix §11, log to `security-audit.md`, fix every High/Critical • 🤖 **S8 secret audit** (gitleaks + frontend bundle scan) |
| **23 (Tue)** | ✋ Record Veo 3 demo (60s — agent uses Shotbase MCP to extract product prices from a page) • ✋ Product Hunt assets: gif, 5 screenshots, tagline copy, first comment drafted |
| **24 (Wed)** | ✋ Hacker News Show HN draft + 20 LinkedIn build-in-public backlog posts |
| **25 (Thu)** | ✋ Outreach: DM 30 LangChain/MCP power users you've engaged during build phase |
| **26 (Fri)** | ✋ Soft launch to waitlist — give them 48h head start |
| **27 (Sat)** | ✋ Fix anything they report |
| **28 (Sun)** | 🚀 **LAUNCH** (see §6 launch-day playbook) |

---

## 5. Tool Stack — One Tool Per Job

| Job | Tool | Why |
|---|---|---|
| Backend / API / SDK code | **Claude Code** (Max plan, unlimited) | MCP-native, plan mode for multi-file refactors |
| Multi-file refactors (e.g. dashboard migration) | **Claude Code Plan mode** | Don't switch to Cursor — it's the same thing |
| Frontend / dashboard / landing | **Antigravity** | You already use it; stay |
| LLM calls inside `/extract` | **Vercel AI Gateway** | Model-agnostic, swap providers via env var |
| Demo video | **Google Veo 3** | Already chosen |
| Video scripts + LinkedIn drafts | **Claude.ai chat** (web UI, not CLI) | Faster iteration |
| Cross-posting LinkedIn↔Twitter | **Buffer or Typefully** ($15/mo) | Don't build it |
| Error tracking | **Sentry** (free tier) | Industry standard |
| Uptime monitoring | **Better Uptime** (free tier) | Slack alerts |
| Incident AI analysis | **Vercel Agent** | Public beta, free |
| Waitlist + transactional email | **Loops.so or Resend** | Both have free tiers |
| Progress log | **Notion** | Manual, 2 min/day |
| Open-source code to fork | ScreenshotOne cookie rules, Mozilla readability.js, turndown, LangChain tool template | Save weeks |

**Do not add:** Cursor, v0.dev (Antigravity covers it), Vanta/Drata (no audit yet), Mention.com/Brand24 (defer until ≥100 mentions/week), any new SaaS tool not on this list.

---

## 6. GTM Playbook

### 6.1 Build phase (Weeks 1-3) — build in public

**LinkedIn (daily).** 30-second screen recording of what you shipped today. Native upload, not link. Pattern: "Day N building Shotbase: shipped [X]. Why it matters for AI agents: [Y]." 30 posts = 30 chances to attract attention.

**Twitter/X (weekly).** Thursday thread: "Building Shotbase, week N. Shipped: X. Broken: Y. Next: Z." Cross-post via Buffer.

**Reddit (comments only, no posts).** Become known in: `r/LangChain`, `r/LocalLLaMA`, `r/ChatGPTCoding`, `r/SaaS`, `r/IndieHackers`. Comment helpfully on screenshot/scraping questions. Drop Shotbase only when literally on-topic.

**Indie Hackers.** One milestone post per week. They have a built-in audience hungry for solo-founder stories.

**Discord servers.** Join LangChain Discord, the MCP working group, Vercel Discord, Anthropic Skills community. Help people. Become known *before* launch.

**Stack Overflow.** Answer questions about screenshot APIs / web automation. Put `shotbase.dev` in profile bio. **Do not post promotional content** — they ban for it.

### 6.2 Pre-launch (last 3 days of Week 4)

- Email waitlist 3x: T-3, T-1, T-0 (with the launch link)
- Soft launch to waitlist 48h early
- DM 30 power users from build-phase engagement

### 6.3 Launch day (Tuesday or Wednesday — never Mon/Fri)

| Time (ET) | Action |
|---|---|
| 12:01 AM PT (3:01 ET) | Product Hunt goes live — PH days start midnight PT |
| 8:00 AM | Show HN post |
| 9:00 AM | LinkedIn post with Veo 3 demo video |
| 10:00 AM | Twitter/X launch thread |
| 11:00 AM | Reddit posts — one per relevant sub, different angle each |
| All day | DM the 30 power users |
| 6:00 PM PT | LinkedIn follow-up with day-1 stats |

**Urgency hook on landing:** "First 100 AI-agent customers get $19/100K req lifetime — locked in for as long as you stay subscribed." Live counter. Real scarcity.

### 6.4 Post-launch week 1

- Two SEO comparison blog posts: "Shotbase vs ScreenshotOne" and "Shotbase vs Urlbox"
- Daily LinkedIn: customer questions / "today I learned" / first customer logo
- One Veo 3 video per week

---

## 7. Operating Cadence

### Daily (10-15 min total)
- ✋ Update Notion progress log (1 row: date, shipped, posted-to, blockers)
- ✋ Post LinkedIn build-in-public update (during Weeks 1-3 build phase)
- ✋ Read overnight Sentry + Better Uptime alerts; triage anything red

### Weekly (1 hour, Sunday)
- ✋ Review the week's plan vs actual; move slipped items
- ✋ Write LinkedIn weekly recap post (longer-form)
- ✋ Check waitlist count + run conversion math

### Every 2 weeks
- ✋ Re-read `someday.md` — is anything earning its way into scope? (Default: no.)

---

## 8. Decision Log

### ✅ YES — in scope
- AI-agents wedge positioning
- 33-item feature set (W1-W5, P1-P2, D1-D6, A1-A8, U1-U4, **S1-S8**)
- Dashboard unification at `/dashboard/*`
- Build-in-public on LinkedIn during Weeks 1-3
- Compliance-ready architecture (NOT certification)
- **Security & abuse prevention (S1-S8) — non-optional for an API product**
- Buffer/Typefully for cross-posting
- Sentry + Better Uptime + Vercel Agent for ops

### ⏸️ DEFERRED to someday.md (re-evaluate post-revenue)
- Video/MP4 capture (Urlbox owns it)
- Real-device matrix (Browshot owns it)
- HTML-to-image rendering (HCTI owns it)
- BYO-S3/GCS storage (build when a customer asks)
- Visual-diff monitoring (different wedge — v2)
- Go / Ruby / PHP / Java SDKs (TS + Python first)
- Multi-region rendering on customer demand
- Team management UI (single-user only in v1)
- SOC 2 Type I audit (starts when 1 paying enterprise customer asks)
- HIPAA BAAs with Vercel/Supabase/Clerk (starts when first healthcare prospect ≥$2K/mo)
- ISO 27001
- HITRUST

### ❌ NO — will not build
- Three separate GitHub repos (stay monorepo until ≥3 engineers)
- Internal admin dashboard / "feature failure detection system" (Sentry + Better Uptime + Vercel Agent = same outcome in 1 hour)
- Custom automated cross-posting infrastructure (Buffer covers it)
- Sentiment-analysis agents (defer until ≥100 mentions/week)
- Custom daily-progress-report system (Notion covers it)
- Auto-posting to Instagram for a B2B dev tool
- Promotional posting on Stack Overflow (it's against their ToS)
- Vanta/Drata subscription before an audit is signed

---

## 9. Day 1 Kickoff Checklist (do this first)

In order:

1. ✋ Read this entire plan once. Reject anything you disagree with **now**, not in Week 3.
2. ✋ B1: `git add proxy.ts app/api/webhooks/clerk/route.ts && git commit -m "fix: redirect unauthed users + harden clerk webhook" && git push`
3. ✋ Verify deploy on shotbase.dev — `/dashboard` should redirect to `/signin` instead of 404
4. ✋ B2: decide pricing (recommend $29/$99/$399 for AI-agent positioning; the $9/$19/$49 indie ladder is too cheap to fund Vercel Enterprise + Supabase Pro you'll need next year)
5. 🔧 **S3 spend caps — do this BEFORE writing any new code today.** Set monthly hard caps + email alerts on: Vercel (billing → spend management), Anthropic/OpenAI dashboard, Railway (project → settings → usage limits), Supabase (org → billing → spend cap), Unkey (workspace → billing). 1 hour of clicking. **This is the single best ROI hour of the entire 4 weeks.**
6. 🔧 Install Sentry: `npx @sentry/wizard@latest -i nextjs`
7. 🔧 Set up Better Uptime monitor on shotbase.dev + 3 API endpoints
8. 🔧 Sign up Vercel Agent (one toggle in Vercel dashboard)
9. 🔧 Sign up Loops.so or Resend; wire to landing waitlist form
10. ✋ Sign up free tiers at ScreenshotOne + Browserless; screenshot their dashboards into a Notion doc
11. 🤖 Hand the dashboard redesign spec (§3) to Claude Code — give it this plan and say "execute U1 + U2 for me; ask before deleting `/account/*`."
12. ✋ Write Day 1 LinkedIn post: "Day 1 of building Shotbase — the screenshot API for AI agents. Here's what I'm shipping and why I think incumbents can't follow."

---

## 10. The Single Rule

> When any new idea comes up, ask: **"Does this serve the AI-agent-screenshot wedge for the customer I'm trying to win in the next 90 days?"**
>
> - If yes → add to this plan, displace something else if needed.
> - If no → write it in `someday.md`. Look in 6 months.

Scope is closed until launch.

---

## 11. Appendix — Pre-launch Security Audit Prompts

Run these against the codebase during S7 (Week 4, Day 22). Log findings to `security-audit.md`; fix every High/Critical before launch. Hand each prompt to Claude Code with the repo context.

### 11.1 Full security audit

> Review this codebase as a security specialist. Check for: SQL injection, XSS, CSRF, broken authentication, insecure direct object references (IDOR), open redirects, server-side request forgery (SSRF) — especially in the `/api/playground/screenshot` proxy where user-supplied URLs are fetched server-side. List every vulnerability with file:line, severity (Critical/High/Medium/Low), and a concrete fix.

### 11.2 Secret & environment audit

> Scan the entire codebase for hardcoded API keys, tokens, passwords, and secrets. Check that all `.env*` files are gitignored. Check `git log --all -p` for accidentally committed secrets. Verify no sensitive values are exposed in frontend code (`process.env.X` in client components must be `NEXT_PUBLIC_*` only and must never include keys). Check API responses for accidental leakage of internal IDs, tokens, or PII.

### 11.3 Security headers audit

> Review HTTP security headers configured in `next.config.ts`. Verify presence and correctness of: Content-Security-Policy (with appropriate sources for Clerk, Stripe, Supabase, Vercel Analytics), Strict-Transport-Security (max-age ≥ 63072000, includeSubDomains, preload), X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy restricting camera/microphone/geolocation. Test the deployed site against [securityheaders.com](https://securityheaders.com) — target rating A or higher.

### 11.4 Rate limiting audit

> Verify every API route under `app/api/` has rate limiting. Confirm: (a) IP-based limits on unauthenticated routes, (b) API-key-based limits on authenticated routes, (c) per-plan request budgets enforced server-side, (d) exponential backoff on auth and webhook routes to prevent brute force, (e) the `/extract` and `/playground/screenshot` endpoints have stricter limits because they trigger expensive downstream calls. Use the Upstash Redis sliding-window pattern.

### 11.5 Privacy & GDPR audit

> Review the codebase for GDPR/CCPA compliance. List every piece of user data collected, where it's stored, retention duration, and the legal basis for processing. Confirm presence of: privacy policy, terms of service, DPA template, subprocessors list, cookie consent banner (with reject option that actually blocks analytics), `DELETE /api/account` endpoint that wipes user + screenshots + audit logs, configurable per-org retention. Flag any PII logged to Sentry, Vercel logs, or stored without redaction.

### 11.6 Input validation audit

> Verify every API route validates input with Zod (or equivalent) before any DB / LLM / external API call. For each route: list the schema, confirm rejection with 400 on malformed input, and verify the validation runs on both client and server. Pay special attention to: URL inputs (must be parseable URLs with allowed protocols only — block `file://`, `gopher://`, internal IPs, localhost), JSON schemas passed to `/extract` (must have bounded depth and field count), and any field used in DB queries or LLM prompts.

### 11.7 Abuse scenarios

> Walk through these abuse scenarios and confirm we have a defense for each: (1) someone scripts `/extract` and burns through the LLM budget — defense: rate limit + spend cap. (2) someone passes a `file://` URL to render a server file — defense: URL allowlist. (3) someone creates 10,000 accounts via headless browser — defense: Clerk bot protection. (4) someone uploads illegal content via the screenshot proxy as a cache poisoning attack — defense: retention policy + abuse-report endpoint. (5) someone DDoS's a single API key — defense: per-key rate limit + circuit breaker. For each, document the defense and where it lives in code.

---

Run all seven before launch. Anything Critical/High that can't be fixed blocks launch.
