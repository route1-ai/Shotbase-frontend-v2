@AGENTS.md

# Shotbase Frontend — Deep Context

## What This App Does
Three things only:
1. **Marketing site** — `app/page.tsx` (public, no auth)
2. **Dashboard** — `app/dashboard/**` (requires Clerk auth)
3. **API proxy layer** — `app/api/**` (server-side routes that talk to Railway backend or third-party services)

Production: Vercel (auto-deploys from `main`)
Backend: `https://shotbase-production.up.railway.app`
Public API base: `https://api.shotbase.dev/v1` (referenced in playground code samples)

---

## Stack (exact — do not upgrade without reading CHANGELOG)
| Concern | Package | Version | Notes |
|---------|---------|---------|-------|
| Framework | next | **16.2.4** | Forked — NOT standard 14/15. Read `node_modules/next/dist/docs/` before writing any Next.js code |
| React | react + react-dom | 19.2.4 | — |
| Auth | @clerk/nextjs | 7.3.0 | v7 — breaking changes from v5/v6 |
| DB client | @supabase/supabase-js | 2.105.1 | — |
| Payments | stripe | 22.1.1 | — |
| Webhook verify | svix | 1.92.2 | Clerk webhooks only |
| Animations | framer-motion + lenis | 12.38.0 + 1.3.23 | — |
| 3D | three | 0.184.0 | — |
| UI | shadcn 4.5.0 + tailwind 4 | — | Use Tailwind classes, not inline styles |
| Validation | zod | 4.4.3 | — |
| Icons | lucide-react 1.14.0 + @tabler/icons-react | — | — |

---

## Project Structure (every meaningful file)

```
app/
  layout.tsx              ClerkProvider + JetBrains Mono font + Lenis scroll init
  page.tsx                Landing page (900+ lines — hero, pricing, code samples, comparison table)
  globals.css             Global styles + CSS custom properties
  sections.css            Section-specific animation classes

  api/
    billing/
      checkout/route.ts   POST → creates Stripe checkout session, upserts stripe_customer_id in Supabase
      portal/route.ts     POST → opens Stripe billing portal (needs existing stripe_customer_id)
    keys/
      create/route.ts     POST → fetch plan from Supabase → call Unkey v2 createKey → return raw key (ONLY time it's visible)
      list/route.ts       GET  → list user's Unkey keys — ⚠️ STILL USES v1 API (deprecated)
      revoke/route.ts     POST → verify ownership → delete via Unkey — ⚠️ STILL USES v1 API (deprecated)
    logs/route.ts         GET  → last 50 screenshots from Supabase for current user (no pagination)
    playground/
      screenshot/route.ts POST → SSRF-guarded proxy to Railway /screenshot using playground_bypass
    usage/route.ts        GET  → count screenshots this month + plan + limit
    webhooks/
      clerk/route.ts      POST → Clerk user.created → insert Supabase user + create Unkey key (⚠️ uses v1 API)
      stripe/route.ts     POST → handle checkout/subscription events → update Supabase plan

  dashboard/
    layout.tsx            Sidebar nav + auth guard
    page.tsx              Overview: 4 metrics, quota bar, recent renders, activity table (some hardcoded data)
    keys/page.tsx         List/create/revoke API keys
    logs/page.tsx         Request history with filter drawer (Webhooks + Audit tabs are stubs)
    playground/page.tsx   Interactive screenshot tool (URL input, settings, preview, code gen)
    usage/page.tsx        Plan details, usage bar chart
    settings/page.tsx     Profile/security/notifications (navigation stubs — not implemented)
    billing/page.tsx      Plan upgrade UI
    integrations/page.tsx Make, n8n, Zapier connector info (static content)
    insights/page.tsx     Analytics stub
    templates/page.tsx    Preset templates stub
    webhooks/page.tsx     Webhook config stub
    trust/page.tsx        Security/compliance static page
    api-explorer/page.tsx API explorer stub

  docs/page.tsx           Public API docs page
  signin/page.tsx         Clerk sign-in wrapper
  signup/page.tsx         Clerk sign-up wrapper
  onboarding/page.tsx     Post-signup onboarding flow

components/
  ui/
    animated-shader-hero.tsx    WebGL shader animation for landing hero
    smooth-shader-bg.tsx        Background shader component
    web-gl-shader.tsx           Low-level WebGL utilities
    infinite-grid-bg.tsx        Animated grid background
    macbook-scroll.tsx          Scroll-driven MacBook animation (landing page)
    integrations-marquee.tsx    Scrolling integrations logo strip
    radial-orbital-timeline.tsx Animated capability showcase
    remocn-perspective-marquee.tsx 3D perspective marquee
    liquid-glass-button.tsx     Custom animated CTA button
    button.tsx                  shadcn base button

lib/
  safe-url.ts       SSRF guard — validates URLs before forwarding to backend (240 lines)
  utils.ts          cn() = clsx + tailwind-merge
  sentry-redact.ts  Sentry PII redactor (not yet wired — see instrumentation.ts)

instrumentation.ts  Sentry init placeholder — ⚠️ NOT YET CONFIGURED
next.config.ts      Security headers (HSTS, DENY frames, etc.) + redirects + RFC 9116
```

---

## All Environment Variables (complete — all must be set in Vercel)

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...          # ⚠️ NEVER prefix with NEXT_PUBLIC_
CLERK_WEBHOOK_SECRET=whsec_...        # from Clerk Dashboard → Webhooks
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...   # read-only client-side queries only
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # ⚠️ server-only — write access — NEVER NEXT_PUBLIC_

# Unkey
UNKEY_API_ID=api_...
UNKEY_ROOT_KEY=unkey_...              # ⚠️ server-only — NEVER NEXT_PUBLIC_

# Stripe
STRIPE_SECRET_KEY=sk_live_...         # ⚠️ server-only
STRIPE_WEBHOOK_SECRET=whsec_...       # from Stripe Dashboard → Webhooks
STRIPE_PRICE_STARTER=price_...        # Stripe Price ID for Starter plan
STRIPE_PRICE_PRO=price_...            # Stripe Price ID for Pro plan
STRIPE_PRICE_SCALE=price_...          # Stripe Price ID for Scale plan

# Backend
NEXT_PUBLIC_BACKEND_URL=https://shotbase-production.up.railway.app
```

---

## Data Flows (exact, step by step)

### User Signup
```
User fills Clerk form
→ Clerk creates user
→ Clerk fires POST to /api/webhooks/clerk
→ svix.Webhook.verify(body, headers, CLERK_WEBHOOK_SECRET)
→ event.type === 'user.created'
→ supabase.from('users').insert({ clerk_id, email, plan: 'Free' })
→ fetch('https://api.unkey.com/v2/keys.createKey', {   ← ⚠️ clerk webhook still uses v1
     apiId, ownerId: clerk_id, prefix: 'sk_live', meta: { plan: 'free' }
   })
→ Key created, stored in Unkey only (NOT Supabase)
```

### API Key Creation (from Dashboard)
```
User clicks "Create Key" in /dashboard/keys
→ POST /api/keys/create
→ auth() from @clerk/nextjs/server → userId
→ supabase.from('users').select('plan').eq('clerk_id', userId).single()
→ plan = data.plan.toLowerCase() || 'free'
→ fetch('https://api.unkey.com/v2/keys.createKey', {   ← v2
     apiId: UNKEY_API_ID,
     ownerId: userId,
     prefix: 'sk_live',
     meta: { plan }
   })
→ Return { keyId, key: 'sk_live_...' } — RAW KEY ONLY SHOWN ONCE
```

### Playground Screenshot
```
User enters URL in /dashboard/playground → POST /api/playground/screenshot
→ validateSafeUrl(url)     ← blocks private IPs, file://, credentials, etc.
→ count screenshots this month from Supabase
→ check against PLAN_LIMITS[plan]   ← { Free: 500, starter: 5000, pro: 25000, scale: Infinity }
→ fetch('https://shotbase-production.up.railway.app/screenshot', {
     method: 'POST',
     headers: { Authorization: 'Bearer playground_bypass' },   ← NOT user's real key
     body: JSON.stringify({ url, format, ... }),
     signal: AbortSignal.timeout(60000)
   })
→ Return binary or JSON from backend
```

### Stripe Checkout
```
User clicks upgrade in /dashboard/billing
→ POST /api/billing/checkout with { priceId, plan }
→ auth() → userId
→ supabase.from('users').select('stripe_customer_id').eq('clerk_id', userId)
→ if no customer: stripe.customers.create({ email, metadata: { clerk_id } })
→ supabase.from('users').update({ stripe_customer_id }).eq('clerk_id', userId)
→ stripe.checkout.sessions.create({
     customer: stripe_customer_id,
     line_items: [{ price: priceId }],
     mode: 'subscription',
     metadata: { clerk_id }   ← CRITICAL: webhook needs this to find user
   })
→ Return { url: checkoutUrl }
```

### Stripe Webhook → Plan Update
```
POST /api/webhooks/stripe
→ stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)
→ switch event.type:

  'checkout.session.completed':
    → retrieve subscription from Stripe
    → priceId = sub.items.data[0].price.id
    → plan = getPlanFromPriceId(priceId)   ← maps STRIPE_PRICE_* env vars
    → supabase.update({ stripe_customer_id, stripe_subscription_id, plan })
       .eq('clerk_id', session.metadata.clerk_id)

  'customer.subscription.updated':
    → status === 'active' ? getPlanFromPriceId(priceId) : 'Free'
    → supabase.update({ plan }).eq('stripe_customer_id', customerId)

  'customer.subscription.deleted':
    → supabase.update({ stripe_subscription_id: null, plan: 'Free' })
       .eq('stripe_customer_id', customerId)
```

---

## SSRF Guard — lib/safe-url.ts
**Called before every proxy request in playground/screenshot/route.ts.**
Blocks:
- Non-http(s) schemes: `file://`, `gopher://`, `javascript:`, `data:`, `ftp://`
- Embedded credentials: `http://user:pass@host`
- Private IPv4: `10.x`, `172.16-31.x`, `192.168.x`, `127.x`, `169.254.x` (AWS metadata)
- Private IPv6: `::1`, `fc00::/7`, `fe80::/10`, `ff00::/8`
- Internal hostnames: `localhost`, `*.local`, `*.internal`, `*.cluster.local`

**Known gap**: DNS rebinding — hostname resolves to public IP at check time, private IP at fetch time. Mitigated by backend re-validating the actual fetch target.

---

## Plan Quota System (frontend-enforced)
Hardcoded in `app/api/playground/screenshot/route.ts` AND `app/api/usage/route.ts`:
```typescript
const PLAN_LIMITS = {
  Free: 500,
  starter: 5000,
  pro: 25000,
  scale: Infinity
}
```
⚠️ **Case sensitivity**: Supabase stores `Free` (capital F for default), lowercase for paid tiers. These constants must match exactly what's in the Supabase `users.plan` column.

---

## Security Headers (next.config.ts)
Applied to ALL routes:
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`
- `X-XSS-Protection: 0` — intentionally disabled per OWASP 2024
- `Cross-Origin-Resource-Policy: same-site`
- `Cross-Origin-Opener-Policy: same-origin-allow-popups` — needed for Stripe + Clerk OAuth

⚠️ **CSP not yet configured** — explicitly noted in next.config.ts as pending third-party audit.

---

## Known Bugs & Technical Debt

| ID | File | Description | Severity |
|----|------|-------------|----------|
| F1 | keys/list/route.ts | Uses deprecated Unkey v1 API (`api.unkey.dev/v1`) | HIGH |
| F2 | keys/revoke/route.ts | Uses deprecated Unkey v1 API | HIGH |
| F3 | webhooks/clerk/route.ts | Uses deprecated Unkey v1 API for initial key creation | HIGH |
| F4 | playground/screenshot/route.ts | `playground_bypass` hardcoded — should be env var | MEDIUM |
| F5 | dashboard/page.tsx | 24h chart data is hardcoded, not real | MEDIUM |
| F6 | dashboard/logs/page.tsx | Webhooks + Audit tabs are empty stubs | LOW |
| F7 | instrumentation.ts | Sentry not wired — `sentry-redact.ts` helpers unused | MEDIUM |
| F8 | dashboard/settings/* | Settings sub-pages are navigation stubs | LOW |
| F9 | next.config.ts | CSP header not configured | MEDIUM |
| F10 | No E2E tests | No Playwright/Cypress test suite | HIGH |
| F11 | billing/checkout/route.ts | Missing hard error if STRIPE_SECRET_KEY is undefined | LOW |

---

## Supabase Schema (what this app reads/writes)
```sql
users (
  id                    uuid primary key,
  clerk_id              text unique,   -- Clerk userId — joins everything
  email                 text,
  plan                  text default 'Free',  -- 'Free'|'starter'|'pro'|'scale'
  stripe_customer_id    text,
  stripe_subscription_id text,
  created_at            timestamptz
)

screenshots (
  id          uuid primary key,
  user_id     text,         -- = clerk_id / Unkey ownerId
  url         text,
  format      text,
  status      int,
  time_ms     int,
  size_kb     float,
  cached      boolean,
  created_at  timestamptz
)
```
Frontend reads `screenshots` for logs/usage. Backend writes it. Frontend never writes to `screenshots`.

---

## Identity Thread (critical — must stay consistent)
```
Clerk userId  ←→  Supabase users.clerk_id  ←→  Unkey key.ownerId
```
These three must always be the same string. If any route breaks this thread, keys become orphaned or usage logs stop working.

---

## Hardcoded Values That Should Be Env Vars
These are hardcoded today — flag before changing, don't silently move them:
- `playground_bypass` in `app/api/playground/screenshot/route.ts`
- `PLAN_LIMITS` object in playground + usage routes
- Bedrock model ID (backend, not here)
- Rate limit per-plan numbers (backend)

---

## Dashboard Pages: What's Real vs Stub
| Page | Status |
|------|--------|
| /dashboard | Real (some data hardcoded) |
| /dashboard/keys | Real |
| /dashboard/logs | Real (50-item limit, no pagination) |
| /dashboard/playground | Real |
| /dashboard/usage | Real |
| /dashboard/billing | Real (Stripe integration) |
| /dashboard/settings | Navigation only — no forms work |
| /dashboard/integrations | Static content only |
| /dashboard/insights | Stub |
| /dashboard/templates | Stub |
| /dashboard/webhooks | Stub |
| /dashboard/trust | Static content |
| /dashboard/api-explorer | Stub |

---

## Dev Commands
```bash
npm run dev          # Next.js dev server on :3000
npm run build        # production build — run this to catch TS errors before pushing
npx vercel --prod    # manual deploy to Vercel production
```

## What NOT To Do
- Never `import { auth } from '@clerk/nextjs/server'` inside a `'use client'` component
- Never use `SUPABASE_SERVICE_ROLE_KEY` in client components or with `NEXT_PUBLIC_` prefix
- Never call `https://shotbase-production.up.railway.app` directly from client components — always route through `/api/playground/screenshot`
- Never use `UNKEY_ROOT_KEY` or `STRIPE_SECRET_KEY` client-side
- Never upgrade Next.js without reading `node_modules/next/dist/docs/` — this is a forked build
- Never add a new `NEXT_PUBLIC_` secret — if it shouldn't be in the browser, it shouldn't have that prefix
- Never write to the `screenshots` table from frontend — that's backend's job
- Never hardcode `stripe_customer_id` or assume it exists — always fetch from Supabase first

## Backlog (prioritized)
- [ ] Migrate keys/list, keys/revoke, webhooks/clerk to Unkey v2 API
- [ ] Move playground_bypass to env var
- [ ] Wire Sentry via instrumentation.ts + sentry-redact.ts
- [ ] Add CSP header to next.config.ts
- [ ] Implement /api/mcp route (MCP server exposing screenshot tool)
- [ ] Build Make.com + n8n connector endpoints
- [ ] Add pagination to logs (cursor-based, Supabase .range())
- [ ] Implement settings pages (profile update, notification prefs)
- [ ] Add E2E tests for critical flows (signup → key → playground → log)

---

## gstack Skills
gstack is installed at `~/.claude/skills/gstack`. Skills are available as slash commands in Claude Code.

**Use these skills for Shotbase frontend work:**
- `/review` — code review before any PR. For frontend: checks NEXT_PUBLIC_ leaks, client/server import violations, RLS, webhook signature verification
- `/cso` — Chief Security Officer review. Runs Antigravity-style checks: SSRF bypass, auth holes, secret exposure, Stripe webhook forgery
- `/qa` — full QA pass targeting auth flows, Stripe webhooks, Clerk integration, quota enforcement
- `/qa-only` — QA only, no code changes (use before every push)
- `/ship` — pre-ship checklist: `npm run build` must pass, no TS errors, env vars set in Vercel
- `/land-and-deploy` — ship + `git push` → Vercel auto-deploy
- `/investigate` — trace bugs across routes (e.g. "quota not enforcing" → trace from usage/route.ts → PLAN_LIMITS → plan casing)
- `/office-hours` — architecture decisions: new dashboard pages, new API routes, data model changes
- `/plan-eng-review` — validate plan before implementing (use for anything touching Stripe webhooks, Clerk webhooks, or Unkey)
- `/browse` — fetch Unkey v2 / Clerk v7 / Stripe v22 / Next.js 16.2.4 docs (this fork has different APIs)
- `/document-release` — changelog after a deploy
- `/gstack-upgrade` — update gstack to latest

**Workflow with gstack:**
```
You describe feature/fix
  → /plan-eng-review (validate before touching Stripe/Clerk/Unkey)
  → Implement
  → /cso (security: SSRF, secret leakage, auth bypass)
  → /qa-only (catch quota bugs, plan casing errors, missing clerk_id)
  → /ship (npm run build passes, Vercel env vars set)
  → /land-and-deploy (git push → Vercel deploy)
```

Install: `git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup`
