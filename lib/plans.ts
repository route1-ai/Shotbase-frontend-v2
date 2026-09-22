// ── Single source of truth for Shotbase plans ──
// Public names: Free, Builder, Pro, Business.
// Self-serve stored ids: free, builder, pro. Business = contact-sales only.
// Legacy (never shown in UI): starter -> builder, scale -> pro.
// Pure/dependency-free so it is usable from client components, server routes,
// and unit tests alike (see tests/plans.test.mjs).

export type PlanId = 'free' | 'builder' | 'pro'
export type PaidPlanId = 'builder' | 'pro'

export interface PlanConfig {
  id: PlanId
  name: string // public display name
  priceLabel: string // '$0', '$9/mo', '$29/mo'
  priceMonthly: number // 0, 9, 29
  captures: number // successful captures / month
  aiExtractions: number // AI extractions / month
  rpm: number // requests / minute
  stripeEnvVar?: 'STRIPE_PRICE_BUILDER' | 'STRIPE_PRICE_PRO'
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: { id: 'free', name: 'Free', priceLabel: '$0', priceMonthly: 0, captures: 250, aiExtractions: 25, rpm: 10 },
  builder: { id: 'builder', name: 'Builder', priceLabel: '$9/mo', priceMonthly: 9, captures: 1500, aiExtractions: 150, rpm: 20, stripeEnvVar: 'STRIPE_PRICE_BUILDER' },
  pro: { id: 'pro', name: 'Pro', priceLabel: '$29/mo', priceMonthly: 29, captures: 7500, aiExtractions: 1000, rpm: 40, stripeEnvVar: 'STRIPE_PRICE_PRO' },
}

// Order for pricing UIs.
export const PLAN_ORDER: PlanId[] = ['free', 'builder', 'pro']
export const SELF_SERVE_PAID_IDS: PaidPlanId[] = ['builder', 'pro']

// Business — contact-sales, NOT a Stripe tier. No quota numbers advertised, no
// checkout path. Copy is intentionally free of SLA / dedicated-IP / support claims.
export const BUSINESS = {
  name: 'Business',
  priceLabel: 'Custom',
  blurb: 'Custom volume and throughput for larger workloads.',
  cta: 'Talk to us',
} as const

/**
 * Sales/business contact target for the Business CTA.
 * Uses NEXT_PUBLIC_SALES_CONTACT_URL when configured; otherwise falls back to the
 * existing repo contact address (hello@shotbase.dev) — never an invented value and
 * never a broken "#". Set the env var to point at a real sales page/scheduler.
 */
export function salesContactHref(env: Record<string, string | undefined> = process.env): string {
  return env.NEXT_PUBLIC_SALES_CONTACT_URL || 'mailto:hello@shotbase.dev'
}

// Normalize any stored/legacy/casing variant to a canonical self-serve PlanId.
export function normalizePlan(plan: string | null | undefined): PlanId {
  const p = (plan ?? '').trim().toLowerCase()
  if (p === 'builder' || p === 'starter') return 'builder'
  if (p === 'pro' || p === 'scale') return 'pro'
  return 'free'
}

export function planConfig(plan: string | null | undefined): PlanConfig {
  return PLANS[normalizePlan(plan)]
}
export function captureLimit(plan: string | null | undefined): number {
  return planConfig(plan).captures
}
export function aiExtractionLimit(plan: string | null | undefined): number {
  return planConfig(plan).aiExtractions
}

type PriceEnv = Record<string, string | undefined> & {
  STRIPE_PRICE_BUILDER?: string
  STRIPE_PRICE_PRO?: string
}

/**
 * Map a Stripe price ID to our canonical paid plan id. Returns null when the
 * price is missing or unrecognised — callers MUST treat null as "unknown" and
 * never fall back to a paid tier. (Business is not a Stripe tier.)
 */
export function getPlanFromPriceId(priceId: string | null | undefined, env: PriceEnv = process.env): PaidPlanId | null {
  if (!priceId) return null
  if (env.STRIPE_PRICE_BUILDER && priceId === env.STRIPE_PRICE_BUILDER) return 'builder'
  if (env.STRIPE_PRICE_PRO && priceId === env.STRIPE_PRICE_PRO) return 'pro'
  return null
}

/**
 * Self-serve checkout: tier name -> Stripe price id. Only 'builder'/'pro' are
 * self-serve. Everything else (free, business, legacy starter/scale, unknown)
 * returns null and must be rejected by the checkout route.
 */
export function priceIdForTier(tier: string | null | undefined, env: PriceEnv = process.env): string | null {
  const t = (tier ?? '').trim().toLowerCase()
  if (t === 'builder') return env.STRIPE_PRICE_BUILDER ?? null
  if (t === 'pro') return env.STRIPE_PRICE_PRO ?? null
  return null
}

/**
 * Value written to Supabase users.plan and Unkey meta.plan — always a canonical
 * self-serve id (free | builder | pro). The render backend reads meta.plan and is
 * the authoritative enforcement point for quotas and rate limits.
 */
export function planToUnkeyMeta(plan: string | null | undefined): PlanId {
  return normalizePlan(plan)
}

// Canonical stored value for the free tier (webhook downgrade / default).
export const FREE_PLAN: PlanId = 'free'
