// Unit + content tests for Pricing V2. Runs on Node's built-in test runner with
// native TS type-stripping — no extra deps: node --test tests/plans.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  PLANS, PLAN_ORDER, BUSINESS, SELF_SERVE_PAID_IDS,
  normalizePlan, planConfig, captureLimit, aiExtractionLimit,
  getPlanFromPriceId, priceIdForTier, planToUnkeyMeta, FREE_PLAN, salesContactHref,
} from '../lib/plans.ts'

const src = (rel) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')

// ── exact plan prices / quotas / rates ──
test('exact plan config matches the final pricing contract', () => {
  assert.deepEqual(
    { id: PLANS.free.id, price: PLANS.free.priceMonthly, cap: PLANS.free.captures, ai: PLANS.free.aiExtractions, rpm: PLANS.free.rpm },
    { id: 'free', price: 0, cap: 250, ai: 25, rpm: 10 },
  )
  assert.deepEqual(
    { id: PLANS.builder.id, price: PLANS.builder.priceMonthly, cap: PLANS.builder.captures, ai: PLANS.builder.aiExtractions, rpm: PLANS.builder.rpm },
    { id: 'builder', price: 9, cap: 1500, ai: 150, rpm: 20 },
  )
  assert.deepEqual(
    { id: PLANS.pro.id, price: PLANS.pro.priceMonthly, cap: PLANS.pro.captures, ai: PLANS.pro.aiExtractions, rpm: PLANS.pro.rpm },
    { id: 'pro', price: 29, cap: 7500, ai: 1000, rpm: 40 },
  )
})

test('plan set is exactly free/builder/pro (no starter/scale)', () => {
  assert.deepEqual(PLAN_ORDER, ['free', 'builder', 'pro'])
  assert.deepEqual(Object.keys(PLANS).sort(), ['builder', 'free', 'pro'])
  assert.ok(!('starter' in PLANS) && !('scale' in PLANS))
})

test('legacy names normalize but are never a public plan', () => {
  assert.equal(normalizePlan('starter'), 'builder')
  assert.equal(normalizePlan('scale'), 'pro')
  assert.equal(normalizePlan('Free'), 'free')
  assert.equal(normalizePlan(''), 'free')
  assert.equal(normalizePlan(null), 'free')
  assert.equal(normalizePlan('Pro'), 'pro')
  assert.equal(captureLimit('starter'), 1500)
  assert.equal(aiExtractionLimit('scale'), 1000)
  assert.equal(planConfig('starter').name, 'Builder')
})

// ── Stripe self-serve mapping ──
const env = { STRIPE_PRICE_BUILDER: 'price_b_1', STRIPE_PRICE_PRO: 'price_p_1' }

test('getPlanFromPriceId maps builder/pro; unknown fails safe (never paid)', () => {
  assert.equal(getPlanFromPriceId('price_b_1', env), 'builder')
  assert.equal(getPlanFromPriceId('price_p_1', env), 'pro')
  assert.equal(getPlanFromPriceId('price_unknown', env), null)
  assert.equal(getPlanFromPriceId(null, env), null)
  assert.equal(getPlanFromPriceId('price_p_1', {}), null) // env unset → null
})

test('priceIdForTier allows only builder/pro; rejects everything else', () => {
  assert.equal(priceIdForTier('builder', env), 'price_b_1')
  assert.equal(priceIdForTier('pro', env), 'price_p_1')
  for (const t of ['free', 'business', 'scale', 'starter', 'enterprise', '', null]) {
    assert.equal(priceIdForTier(t, env), null, `tier ${t} must not be checkout-able`)
  }
  assert.deepEqual(SELF_SERVE_PAID_IDS, ['builder', 'pro'])
})

test('planToUnkeyMeta returns a canonical self-serve id', () => {
  assert.equal(planToUnkeyMeta('starter'), 'builder')
  assert.equal(planToUnkeyMeta('scale'), 'pro')
  assert.equal(planToUnkeyMeta('Free'), 'free')
  assert.equal(FREE_PLAN, 'free')
})

test('Business is contact-sales with no price/checkout, and CTA never a broken #', () => {
  assert.equal(BUSINESS.priceLabel, 'Custom')
  assert.equal(BUSINESS.cta, 'Talk to us')
  assert.equal(salesContactHref({ NEXT_PUBLIC_SALES_CONTACT_URL: 'https://cal.com/shotbase' }), 'https://cal.com/shotbase')
  const fallback = salesContactHref({})
  assert.notEqual(fallback, '#')
  assert.ok(fallback.startsWith('mailto:') || fallback.startsWith('http'))
})

// ── content truth: no removed/false claims survive in customer-facing files ──
test('marketing pricing has no legacy plan names, overage, trial, or "most popular"', () => {
  const page = src('../app/page.tsx')
  // Note: the bare word "Scale" is allowed (headline "Scale without friction");
  // we only ban plan-name/claim strings that must not appear.
  for (const bad of ['Starter', 'per extra', 'Most popular', 'Start Pro trial', '10,000 screenshots', '10K']) {
    assert.ok(!page.includes(bad), `marketing page must not contain "${bad}"`)
  }
  assert.ok(page.includes('Builder'), 'Builder plan should be present')
  assert.ok(page.includes('250 captures'), 'free tier should state 250 captures')
})

test('dashboard billing has no fabricated premium features', () => {
  const billing = src('../app/dashboard/settings/billing/page.tsx')
  for (const bad of ['Dedicated IP', 'Slack support', 'log retention', 'Email support', 'Priority support', 'Most popular', 'Scale']) {
    assert.ok(!billing.includes(bad), `billing must not contain "${bad}"`)
  }
})

test('playground proxy no longer contains a duplicate monthly quota table', () => {
  const proxy = src('../app/api/playground/screenshot/route.ts')
  assert.ok(!proxy.includes('PLAN_LIMITS'), 'proxy must not re-declare PLAN_LIMITS')
  assert.ok(!/Monthly quota exceeded/.test(proxy), 'proxy must not enforce monthly quota')
  // Protections must remain.
  assert.ok(proxy.includes('validateSafeUrl'), 'SSRF guard preserved')
  assert.ok(proxy.includes('X-Shotbase-User-Id'), 'trusted identity header preserved')
  assert.ok(proxy.includes('SHOTBASE_BACKEND_BYPASS_KEY'), 'server-only bypass secret preserved')
})

test('supabase schema has ai_requested + ai_succeeded columns', () => {
  const schema = src('../supabase/schema.sql')
  assert.ok(/ai_requested\s+boolean/.test(schema), 'ai_requested column present')
  assert.ok(/ai_succeeded\s+boolean/.test(schema), 'ai_succeeded column present')
  assert.ok(/add column if not exists ai_requested/i.test(schema), 'idempotent ALTER for existing projects')
})
