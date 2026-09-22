// Tests for the Playground "Page text + AI structured extraction" feature.
// Runs on Node's built-in test runner with native TS type-stripping:
//   node --test tests/playground-extraction.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { ScreenshotRequestSchema } from '../lib/validation.ts'

const src = (rel) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')
const page = src('../app/dashboard/playground/page.tsx')
const proxy = src('../app/api/playground/screenshot/route.ts')

// ── Validation schema accepts the new fields ──
test('schema: include_text defaults to false and coerces nothing', () => {
  const parsed = ScreenshotRequestSchema.parse({ url: 'https://example.com' })
  assert.equal(parsed.include_text, false)
  assert.equal(parsed.ai_extract, undefined)
})

test('schema: include_text true is accepted', () => {
  const parsed = ScreenshotRequestSchema.parse({ url: 'https://example.com', include_text: true })
  assert.equal(parsed.include_text, true)
})

test('schema: ai_extract accepts a partial facet object', () => {
  const parsed = ScreenshotRequestSchema.parse({
    url: 'https://example.com',
    ai_extract: { page_type: true, prices: true },
  })
  assert.deepEqual(parsed.ai_extract, { page_type: true, prices: true })
})

test('schema: ai_extract rejects unknown/non-boolean facet types', () => {
  const bad = ScreenshotRequestSchema.safeParse({
    url: 'https://example.com',
    ai_extract: { page_type: 'yes' },
  })
  assert.equal(bad.success, false)
})

test('schema: include_text rejects non-boolean', () => {
  const bad = ScreenshotRequestSchema.safeParse({ url: 'https://example.com', include_text: 'yes' })
  assert.equal(bad.success, false)
})

// ── Payload construction rules (asserted against the page source) ──
test('page: buildPayload adds include_text only when enabled', () => {
  assert.ok(/if \(c\.includeText\) payload\.include_text = true/.test(page), 'include_text gated on the toggle')
})

test('page: ai_extract only sent when enabled AND at least one facet selected', () => {
  assert.ok(/if \(c\.aiExtractEnabled\)/.test(page), 'ai_extract gated on the AI toggle')
  assert.ok(/selectedAiFields\(c\.aiFields\)/.test(page), 'uses the selected-facets helper')
  assert.ok(/if \(selected\.length > 0\)/.test(page), 'never sends an all-false ai_extract')
})

test('page: an empty facet selection is prevented in the UI', () => {
  assert.ok(/selectedAiFields\(next\)\.length === 0\) return prev/.test(page), 'last facet cannot be unchecked')
})

test('page: isDataMode drives JSON-vs-binary expectations', () => {
  assert.ok(/function isDataMode/.test(page), 'isDataMode helper present')
  assert.ok(/c\.includeText \|\| \(c\.aiExtractEnabled/.test(page), 'data mode = text or AI-with-facets')
})

// ── Code samples adapt to data mode ──
test('page: code samples drop --output and parse JSON in data mode', () => {
  assert.ok(/dataMode \? base :/.test(page), 'curl omits --output in data mode')
  assert.ok(/const data = await res\.json\(\)/.test(page), 'JS sample parses JSON in data mode')
  assert.ok(/data = r\.json\(\)/.test(page), 'Python sample parses JSON in data mode')
  assert.ok(/--output screenshot\./.test(page), 'binary mode still writes a file')
})

// ── Result panel handles both modes without touching the wrong shape ──
test('page: result is a discriminated union (image | data)', () => {
  assert.ok(/kind: 'image'/.test(page) && /kind: 'data'/.test(page), 'both result kinds exist')
  assert.ok(/result\.kind === 'image'/.test(page), 'image panel guarded by kind')
  assert.ok(/result\.kind === 'data'/.test(page), 'data panel guarded by kind')
})

test('page: lightbox + download are image-only', () => {
  assert.ok(/expanded && result && result\.kind === 'image'/.test(page), 'lightbox is image-only')
  assert.ok(/if \(!result \|\| result\.kind !== 'image'\) return/.test(page), 'download bails on data results')
})

test('page: AI null data is a soft notice, not a hard failure', () => {
  assert.ok(/AI extraction temporarily unavailable/.test(page), 'soft AI-unavailable message present')
})

test('page: Output/Data controls are present', () => {
  assert.ok(/Page text/.test(page), 'Page text toggle present')
  assert.ok(/AI extraction/.test(page), 'AI extraction toggle present')
  assert.ok(/available on every plan/.test(page), 'AI is not gated as paid-only')
})

test('page: URL state persists text/ai/fields', () => {
  assert.ok(/params\.set\('text', '1'\)/.test(page), 'text=1 in URL state')
  assert.ok(/params\.set\('ai', '1'\)/.test(page), 'ai=1 in URL state')
  assert.ok(/params\.set\('fields'/.test(page), 'narrowed facet list serialized')
})

// ── Proxy handles Content-Type + sanitized 429 ──
test('proxy: parses JSON responses instead of always blob()', () => {
  assert.ok(/upstreamType\.includes\('application\/json'\)/.test(proxy), 'branches on Content-Type')
  assert.ok(/res\.blob\(\)/.test(proxy), 'binary path preserved for images/PDF')
})

test('proxy: 429 returns sanitized quota fields only', () => {
  assert.ok(/res\.status === 429/.test(proxy), 'handles 429 explicitly')
  assert.ok(/quota_type/.test(proxy) && /limit/.test(proxy) && /used/.test(proxy), 'whitelists quota fields')
  assert.ok(/ai_extractions/.test(proxy), 'distinguishes AI vs capture quota')
})
