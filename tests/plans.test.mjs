// Unit tests for the pure plan-mapping logic. Runs on Node's built-in test
// runner with native TypeScript type-stripping (Node >= 22.6) — no extra deps:
//   node --test tests/plans.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { getPlanFromPriceId, planToUnkeyMeta, FREE_PLAN } from '../lib/plans.ts'

const env = {
  STRIPE_PRICE_STARTER: 'price_starter_123',
  STRIPE_PRICE_PRO: 'price_pro_123',
  STRIPE_PRICE_SCALE: 'price_scale_123',
}

test('maps known price IDs to their plan', () => {
  assert.equal(getPlanFromPriceId('price_starter_123', env), 'starter')
  assert.equal(getPlanFromPriceId('price_pro_123', env), 'pro')
  assert.equal(getPlanFromPriceId('price_scale_123', env), 'scale')
})

test('unknown price ID returns null (never defaults to pro)', () => {
  assert.equal(getPlanFromPriceId('price_unrecognised', env), null)
})

test('missing/empty price ID returns null', () => {
  assert.equal(getPlanFromPriceId(null, env), null)
  assert.equal(getPlanFromPriceId(undefined, env), null)
  assert.equal(getPlanFromPriceId('', env), null)
})

test('a real price ID does not match when the env vars are unset', () => {
  // Guards against the misconfiguration where undefined === undefined granted pro.
  assert.equal(getPlanFromPriceId('price_pro_123', {}), null)
})

test('planToUnkeyMeta normalises to lowercase', () => {
  assert.equal(planToUnkeyMeta('Free'), 'free')
  assert.equal(planToUnkeyMeta('PRO'), 'pro')
  assert.equal(planToUnkeyMeta('  Starter '), 'starter')
  assert.equal(planToUnkeyMeta(FREE_PLAN), 'free')
})
