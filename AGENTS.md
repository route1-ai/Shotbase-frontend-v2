<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This is Next.js **16.2.4** — a forked version. APIs, conventions, and file structure differ from 14/15.
Read `node_modules/next/dist/docs/` before writing ANY Next.js-specific code.
Heed deprecation notices in that directory. They are real breaking changes.
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

1. **Never call Railway directly from client components.**
   All backend calls go through `/api/playground/screenshot`. That route handles auth, SSRF guard, and quota enforcement. Direct `fetch('https://shotbase-production.up.railway.app/...')` in a `'use client'` component is a security hole.

2. **Never use `SUPABASE_SERVICE_ROLE_KEY` in client components or with `NEXT_PUBLIC_` prefix.**
   Service role key bypasses Row Level Security. It must only appear in server-side route handlers.

3. **Never expose these keys with `NEXT_PUBLIC_` prefix:**
   `CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `UNKEY_ROOT_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

4. **Never import `@clerk/nextjs/server` in a `'use client'` component.**
   `auth()`, `currentUser()` are server-only. For client components use `useUser()`, `useAuth()` from `@clerk/nextjs`.

5. **Never write to the `screenshots` table from frontend.**
   Only the Railway backend writes screenshots rows. Frontend reads them for logs/usage display only.

6. **`playground_bypass` must stay as-is in `app/api/playground/screenshot/route.ts`.**
   It's the fixed token the backend expects. Do not rotate it without coordinating with backend.

7. **Plan name casing is load-bearing:**
   - Supabase default value: `'Free'` (capital F)
   - Paid plans lowercase: `'starter'`, `'pro'`, `'scale'`
   - `PLAN_LIMITS` object keys must match exactly: `{ Free: 500, starter: 5000, pro: 25000, scale: Infinity }`
   - Mismatch here silently gives wrong quota to users

8. **`metadata.clerk_id` must always be in Stripe checkout sessions.**
   Without it, `webhooks/stripe/route.ts` cannot match the payment to the user. Subscription goes into limbo.

9. **Always call `validateSafeUrl(url)` before any outbound fetch in API routes.**
   The helper is in `lib/safe-url.ts`. Bypassing it enables SSRF attacks.

10. **`stripe_customer_id` may not exist for new users** — always fetch it from Supabase first, create it in Stripe if null, then write it back. Never assume it's set.

---

### Known issues — do not silently work around

- **F1/F2/F3**: `keys/list`, `keys/revoke`, `webhooks/clerk` use Unkey **v1** (`api.unkey.dev/v1`). When migrating to v2 (`api.unkey.com/v2`), the response shapes differ — verify field names against v2 docs before touching these files.
- **F4**: `playground_bypass` is hardcoded in `app/api/playground/screenshot/route.ts` line ~65. The backlog item is to move it to env var — do not change it unless explicitly implementing that task.
- **F5**: The 24h chart in `dashboard/page.tsx` uses hardcoded data. Do not treat it as real — it's a placeholder.
- **F7**: `lib/sentry-redact.ts` exists but is not wired. `instrumentation.ts` is a stub. Do not delete sentry-redact.ts — it will be needed when Sentry is configured.
- **F9**: CSP header is intentionally missing from `next.config.ts` — noted as pending audit. Do not add a permissive CSP "to unblock" something — leave it absent until properly audited.

---

### Before writing a new API route
1. Check: does this route need auth? If yes, call `const { userId } = await auth()` at the top and return 401 if null.
2. Check: does this route call Supabase with write operations? Use `SUPABASE_SERVICE_ROLE_KEY`, not anon key.
3. Check: does this route call Unkey? Use v2 (`api.unkey.com/v2`) — not v1.
4. Check: does this route proxy to Railway? Use `validateSafeUrl()` first, then `playground_bypass` auth.
5. Check: does this route handle Stripe webhooks? Use `stripe.webhooks.constructEvent()` — never trust raw body.

### Before writing a new dashboard page
- Put it under `app/dashboard/[name]/page.tsx`
- It inherits `app/dashboard/layout.tsx` (sidebar + auth guard) — no need to add auth check again
- Mark it in CLAUDE.md status table as real vs stub
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
- Any hardcoded plan name that doesn't match the exact casing contract (`Free`/`starter`/`pro`/`scale`)
- Any new API route that doesn't guard against missing `userId` from Clerk

---

## Shared Ground Rules (all agents)

**Identity thread** — must never break:
```
Clerk userId  =  Supabase users.clerk_id  =  Unkey key.ownerId
```

**Plan casing contract:**
| Tier | Stored as | Source |
|------|-----------|--------|
| Default | `'Free'` | Supabase `users.plan` default value |
| Paid | `'starter'` `'pro'` `'scale'` | Stripe webhook → `getPlanFromPriceId()` |
| Unkey meta | `'free'` `'starter'` `'pro'` `'scale'` | Set at key creation from `plan.toLowerCase()` |

**`screenshots` table ownership:**
- **Reads**: Frontend (`/api/logs`, `/api/usage`, `/api/playground/screenshot` quota check)
- **Writes**: Backend only (`logScreenshot()` in `src/server.ts`)

**Webhook security:**
- Clerk webhooks: verified via `svix` + `CLERK_WEBHOOK_SECRET`
- Stripe webhooks: verified via `stripe.webhooks.constructEvent()` + `STRIPE_WEBHOOK_SECRET`
- Never process a webhook body without verifying its signature first
