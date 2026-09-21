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

// ── Dashboard usage consumers use the Pricing V2 /api/usage shape ──
const usagePage = src('../app/dashboard/usage/page.tsx')
const overview = src('../app/dashboard/page.tsx')
const quotaLayout = src('../app/dashboard/layout.tsx')
const billing = src('../app/dashboard/settings/billing/page.tsx')

test('A: usage page consumes V2 shape (captures + ai_extractions), not old count/limit', () => {
  assert.ok(/u\.captures/.test(usagePage) && /u\.ai_extractions/.test(usagePage), 'reads captures + ai_extractions from API')
  assert.ok(/captures\.used/.test(usagePage) && /captures\.limit/.test(usagePage), 'renders captures used/limit')
  assert.ok(/ai_extractions\.used/.test(usagePage) && /ai_extractions\.limit/.test(usagePage), 'renders AI used/limit')
  assert.ok(!/\bu\.count\b/.test(usagePage) && !/\bu\.limit\b/.test(usagePage), 'no old flat u.count/u.limit')
  assert.ok(/Captures/.test(usagePage) && /AI extractions/.test(usagePage), 'shows both meters')
})

test('B/C: plan limits come from the central config (Builder 1500/150, Pro 7500/1000)', () => {
  // The API sends limits from planConfig; the page renders whatever it sends.
  assert.equal(PLANS.builder.captures, 1500)
  assert.equal(PLANS.builder.aiExtractions, 150)
  assert.equal(PLANS.pro.captures, 7500)
  assert.equal(PLANS.pro.aiExtractions, 1000)
  assert.equal(PLANS.free.captures, 250)
  assert.equal(PLANS.free.aiExtractions, 25)
})

test('D: usage + overview show honest unavailable, never fabricate 0/10000', () => {
  assert.ok(/Usage tracking temporarily unavailable/.test(usagePage), 'usage page has honest unavailable state')
  assert.ok(/temporarily unavailable/i.test(overview), 'overview has honest unavailable state')
})

test('E: no 10000 fallback anywhere in the dashboard usage consumers', () => {
  for (const [name, code] of [['usage', usagePage], ['overview', overview], ['quota widget', quotaLayout]]) {
    assert.ok(!/10000|10,000/.test(code), `${name} must not contain a 10000 fallback`)
    assert.ok(!/\bu\.count\b/.test(code) && !/\bu\.limit\b/.test(code), `${name} must not read old u.count/u.limit`)
  }
  // Overview + quota widget consume the V2 captures shape.
  assert.ok(/captures/.test(overview), 'overview reads captures')
  assert.ok(/captures/.test(quotaLayout), 'quota widget reads captures')
  // Billing (the reference) already uses captures + ai_extractions.
  assert.ok(/captures/.test(billing) && /ai_extractions/.test(billing), 'billing reference intact')
})
