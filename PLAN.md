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

**Scope total: 25 items + 6 ops setup + 2 immediate fixes. Solo-buildable in 4 weeks.**

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
| **1 (Mon)** | ✋ B1 commit/push bug fixes • ✋ B2 decide pricing • 🔧 O1 Sentry • 🔧 O2 Better Uptime • 🔧 O3 Vercel Agent • 🤖 O6 waitlist wiring • 🎨 rewrite landing hero to new tagline |
| **2 (Tue)** | 🎨 U1 + U2 build unified `/dashboard/*` shell + migrate account routes (one focused day on shell only) |
| **3 (Wed)** | 🎨 U3 Overview + Playground pages |
| **4 (Thu)** | 🤖 W2 `/markdown` endpoint + 🤖 W4 idempotency keys |
| **5 (Fri)** | 🤖 W1 `/extract` start — schema validation + Vercel AI Gateway integration |
| **6 (Sat)** | 🤖 W1 `/extract` finish + tests |
| **7 (Sun)** | ✋ rest / weekly review / write Week 1 LinkedIn recap |

### Week 2 — Polish + remaining wedge + compliance core

| Day | Tasks |
|---|---|
| **8 (Mon)** | 🤖 P1 PDF • 🤖 P2 cookie-banner integration • 🤖 W5 vision-ready response |
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
| **22 (Mon)** | ✋ Record Veo 3 demo (60s — agent uses Shotbase MCP to extract product prices from a page) |
| **23 (Tue)** | ✋ Product Hunt assets: gif, 5 screenshots, tagline copy, first comment drafted |
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
- 25-item feature set (W1-W5, P1-P2, D1-D6, A1-A8, U1-U4)
- Dashboard unification at `/dashboard/*`
- Build-in-public on LinkedIn during Weeks 1-3
- Compliance-ready architecture (NOT certification)
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
5. 🔧 Install Sentry: `npx @sentry/wizard@latest -i nextjs`
6. 🔧 Set up Better Uptime monitor on shotbase.dev + 3 API endpoints
7. 🔧 Sign up Vercel Agent (one toggle in Vercel dashboard)
8. 🔧 Sign up Loops.so or Resend; wire to landing waitlist form
9. ✋ Sign up free tiers at ScreenshotOne + Browserless; screenshot their dashboards into a Notion doc
10. 🤖 Hand the dashboard redesign spec (§3) to Claude Code — give it this plan and say "execute U1 + U2 for me; ask before deleting `/account/*`."
11. ✋ Write Day 1 LinkedIn post: "Day 1 of building Shotbase — the screenshot API for AI agents. Here's what I'm shipping and why I think incumbents can't follow."

---

## 10. The Single Rule

> When any new idea comes up, ask: **"Does this serve the AI-agent-screenshot wedge for the customer I'm trying to win in the next 90 days?"**
>
> - If yes → add to this plan, displace something else if needed.
> - If no → write it in `someday.md`. Look in 6 months.

Scope is closed until launch.
