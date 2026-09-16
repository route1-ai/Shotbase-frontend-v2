// Central, dependency-free plan-mapping logic shared by the billing webhook and
// the API-key routes. Kept pure (no I/O, no SDKs) so it is unit-testable without
// a running server — see tests/plans.test.mjs.

export type PaidPlan = 'starter' | 'pro' | 'scale'
export type StoredPlan = 'Free' | PaidPlan

// Supabase stores the free tier capitalised ('Free', the column default) and
// paid tiers lowercase. Use this constant instead of a bare string literal.
export const FREE_PLAN: StoredPlan = 'Free'

// Index signature so `process.env` (ProcessEnv) is assignable, while still
// documenting the specific keys we read.
type PriceEnv = Record<string, string | undefined> & {
  STRIPE_PRICE_STARTER?: string
  STRIPE_PRICE_PRO?: string
  STRIPE_PRICE_SCALE?: string
}

/**
 * Map a Stripe price ID to our stored (paid) plan name.
 *
 * Returns `null` when the price ID is missing OR does not match any configured
 * STRIPE_PRICE_* env var. Callers MUST treat `null` as "unknown" and fail safely
 * — never fall back to a paid tier. (This previously defaulted to 'pro', which
 * silently granted paid access whenever a price was unrecognised or the price
 * env vars were unset/misconfigured.)
 */
export function getPlanFromPriceId(
  priceId: string | null | undefined,
  env: PriceEnv = process.env,
): PaidPlan | null {
  if (!priceId) return null
  if (env.STRIPE_PRICE_STARTER && priceId === env.STRIPE_PRICE_STARTER) return 'starter'
  if (env.STRIPE_PRICE_PRO && priceId === env.STRIPE_PRICE_PRO) return 'pro'
  if (env.STRIPE_PRICE_SCALE && priceId === env.STRIPE_PRICE_SCALE) return 'scale'
  return null
}

/**
 * The value written to an Unkey key's `meta.plan`. The render backend reads this
 * (lowercased) to apply per-plan rate limits, so we always normalise here. This
 * is the single place that reconciles Supabase's mixed casing ('Free' vs
 * 'starter') with the lowercase form the backend expects.
 */
export function planToUnkeyMeta(plan: string): string {
  return plan.trim().toLowerCase()
}
