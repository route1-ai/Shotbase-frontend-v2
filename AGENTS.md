<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Shotbase Frontend — Agent Rules

## Agent: Claude Code
**Scope**: Everything under `app/`, `components/`, `lib/`, `next.config.ts`, `instrumentation.ts`
**Never touch**: `.env.local`, `.git/`, `node_modules/`

### What you're allowed to do
- Edit any file under `app/`, `components/`, `lib/`
- Run `npm run dev` to test locally on :3000
- Run `npm run build` to verify TypeScript + Next.js compilation before pushing
- Run `git add -A && git commit -m "..." && git push` to trigger Vercel deploy
- Run `npx vercel --prod` for manual production deploy
- Install npm packages only when explicitly instructed

### Non-negotiable rules (never break these)

1. **Never call the backend directly from client components.**
   All backend calls go through `/api/playground/screenshot`. That route handles auth, the SSRF guard, and forwards the trusted user identity; the backend is the single authority for quota/rate enforcement. A direct `fetch('https://api.shotbase.dev/...')` from a `'use client'` component is a security hole.

2. **Never use `SUPABASE_SERVICE_ROLE_KEY` in client components or with `NEXT_PUBLIC_` prefix.**
   Service role key bypasses Row Level Security. It must only appear in server-side route handlers.

3. **Never expose these keys with `NEXT_PUBLIC_` prefix:**
   `CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `UNKEY_ROOT_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SHOTBASE_BACKEND_BYPASS_KEY`

4. **Never import `@clerk/nextjs/server` in a `'use client'` component.**
   `auth()`, `currentUser()` are server-only. For client components use `useUser()`, `useAuth()` from `@clerk/nextjs`.

5. **Never write to the `screenshots` table from frontend.**
   Only the backend writes screenshots rows. Frontend reads them for logs/usage display only.

6. **The playground proxy authenticates with a server-only env secret.**
   `app/api/playground/screenshot/route.ts` reads `SHOTBASE_BACKEND_BYPASS_KEY` from the environment, sends it as `Authorization: Bearer …` to the backend, and fails closed (500) if it's absent. Never hardcode this value, never prefix it with `NEXT_PUBLIC_`, and never log it.

7. **`metadata.clerk_id` must always be in Stripe checkout sessions.**
   Without it, `webhooks/stripe/route.ts` cannot match the payment to the user. Subscription goes into limbo.

8. **Always call `validateSafeUrl(url)` before any outbound fetch in API routes.**
   The helper is in `lib/safe-url.ts`. Bypassing it enables SSRF attacks.

9. **`stripe_customer_id` may not exist for new users** — always fetch it from Supabase first, create it in Stripe if null, then write it back. Never assume it's set.

---

### Plans & quota (backend-authoritative)

Plans live in `lib/plans.ts` as the single source of truth: **free / builder / pro** (plus **Business**, contact-sales only). Legacy names normalize (`starter` → `builder`, `scale` → `pro`).

| Plan    | Captures / mo | AI extractions / mo | Rate limit (rpm) |
|---------|---------------|---------------------|------------------|
| Free    | 250           | 25                  | 10               |
| Builder | 1,500         | 150                 | 20               |
| Pro     | 7,500         | 1,000               | 40               |

The **backend enforces all quotas and rate limits** (keyed off the trusted `X-Shotbase-User-Id` the proxy forwards). The frontend does NOT re-implement a limit table — do not add one.

---

### Before writing a new API route
1. Check: does this route need auth? If yes, call `const { userId } = await auth()` at the top and return 401 if null.
2. Check: does this route call Supabase with write operations? Use `SUPABASE_SERVICE_ROLE_KEY`, not anon key.
3. Check: does this route call Unkey? Use the v2 API (`api.unkey.com/v2`).
4. Check: does this route proxy to the backend? Call `validateSafeUrl()` first, then authenticate with `SHOTBASE_BACKEND_BYPASS_KEY` (server-only env secret) to `https://api.shotbase.dev`.
5. Check: does this route handle Stripe webhooks? Use `stripe.webhooks.constructEvent()` — never trust raw body.

### Before writing a new dashboard page
- Put it under `app/dashboard/[name]/page.tsx`
- It inherits `app/dashboard/layout.tsx` (sidebar + auth guard) — no need to add auth check again
- Use Tailwind classes, not inline styles
- Use `lucide-react` or `@tabler/icons-react` for icons — don't add new icon libraries

### When writing Supabase queries in server routes
```typescript
// Always use service role for writes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Identity thread — always join on clerk_id
.eq('clerk_id', userId)  // userId comes from Clerk auth()
```

---

## Agent: Claude (Cowork)
**Scope**: Planning, research, cross-repo coordination, writing docs.

When describing a change involving both repos simultaneously, write it as:
```
FRONTEND: app/api/[route]/route.ts — [what changes]
BACKEND:  src/server.ts — [what changes]
```
Claude Code will implement each separately.

When researching Unkey/Clerk/Stripe/Supabase API changes, always check current docs — these SDKs have breaking version changes that may differ from training data.

---

## Agent: Antigravity
**Scope**: Code review on PRs/diffs before merge.

**Check specifically for:**
- Any new `NEXT_PUBLIC_` env var that shouldn't be public (keys, secrets, webhook secrets)
- Any `fetch()` in a server route that bypasses `validateSafeUrl()` — SSRF risk
- Any Supabase write using anon key instead of service role key
- Any client component importing from `@clerk/nextjs/server`
- Any Stripe webhook handler missing `constructEvent()` signature verification
- Any Unkey key creation that omits `meta: { plan }` — breaks backend rate limiting
- Any hardcoded plan name outside the current model (`free`/`builder`/`pro`) or a re-implemented quota table in the frontend
- Any new API route that doesn't guard against missing `userId` from Clerk

---

## Shared Ground Rules (all agents)

**Identity thread** — must never break:
```
Clerk userId  =  Supabase users.clerk_id  =  Unkey key.ownerId
```

**Plan model:**
| Tier | Stored as | Source |
|------|-----------|--------|
| Default | `'free'` | Supabase `users.plan` default value |
| Paid | `'builder'` `'pro'` | Stripe webhook → `getPlanFromPriceId()` |
| Unkey meta | `'free'` `'builder'` `'pro'` | Set at key creation from the plan |

Legacy `'starter'`/`'scale'` values normalize to `'builder'`/`'pro'` via `normalizePlan()` in `lib/plans.ts` — never introduce new casings.

**`screenshots` table ownership:**
- **Reads**: Frontend (`/api/logs`, `/api/usage`, `/api/insights`)
- **Writes**: Backend only

**Webhook security:**
- Clerk webhooks: verified via `svix` + `CLERK_WEBHOOK_SECRET`
- Stripe webhooks: verified via `stripe.webhooks.constructEvent()` + `STRIPE_WEBHOOK_SECRET`
- Never process a webhook body without verifying its signature first
