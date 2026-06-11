# Playwright E2E tests

End-to-end tests for shotbase.dev. Add a flow → loop clicks the buttons → CI screams if anything breaks.

## Quick start

```bash
# 1. install browser binaries (once per machine)
npx playwright install chromium

# 2. run all tests (auto-starts npm run dev)
npx playwright test

# 3. visual mode (you'll live here while writing tests)
npx playwright test --ui

# 4. after a failure, browse trace + screenshots + video
npx playwright show-report
```

## Recording new tests instead of hand-writing them

Don't hand-write selectors — record them:

```bash
# in one terminal:
npm run dev

# in another:
npx playwright codegen http://localhost:3000
```

A real browser opens. Click through the flow you want to test. Playwright generates the test code in a side panel. Copy it into a new `tests/<flow>.spec.ts` file and add `expect(...)` assertions at the end.

## Running against the live site

```bash
BASE_URL=https://shotbase.dev npx playwright test
```

Useful for catching regressions in prod that didn't surface in dev (env mismatch, edge caching, etc.).

## What's covered today

- `smoke.spec.ts` — public pages return 2xx, auth-gated routes redirect (not 404), homepage has no dead internal links.

## What's NOT covered yet (and why)

| Flow              | Why deferred                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| Signup / login    | Needs a Clerk test user. Provision in Clerk Dashboard → Users → Create user, then store creds as GH Secrets. |
| Stripe checkout   | Needs a Stripe test user + the `4242 4242 4242 4242` test card. Add once activate-payments KYC is done.      |
| Playground render | Hits Railway → can rack up minor cost on every CI run. Stub locally first, gate behind a label.              |

Each of these is one `codegen` session away once the prerequisite is in place.

## CI

`.github/workflows/playwright.yml` runs on every PR + push to main. Required GH Secrets:

- `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `UNKEY_API_ID`, `UNKEY_ROOT_KEY`

Add these once at `Settings → Secrets and variables → Actions`. CI will run with placeholder builds if they're missing, but the routes that touch those services won't function.

## Gotchas

- **Never `page.waitForTimeout(N)`.** Use `await expect(locator).toBeVisible()` — it auto-waits for real conditions and won't be flaky.
- **Tests creating real data** (signups, screenshots, subscriptions) should use a separate test environment or a per-test cleanup hook. Don't pollute prod tables.
