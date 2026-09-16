// Focused tests for the playground proxy's trusted identity header.
//   node --test tests/playground-identity.test.mjs
// Proves:
//  - a signed-in request forwards X-Shotbase-User-Id sourced from auth()
//  - a caller cannot spoof another user via request headers or body
//  - the internal identity header is never echoed to the browser response
//  - a missing backend secret still fails closed (no backend call)
//  - an unauthenticated request is rejected before any backend call
import test from 'node:test'
import assert from 'node:assert/strict'
import { register } from 'node:module'

// Skip the Supabase quota block so the test stays focused on the outbound call.
delete process.env.NEXT_PUBLIC_SUPABASE_URL
delete process.env.SUPABASE_URL
delete process.env.SUPABASE_SERVICE_ROLE_KEY

register('./support/route-loader.mjs', import.meta.url)
const { POST } = await import(new URL('../app/api/playground/screenshot/route.ts', import.meta.url).href)

function makeReq(body, headers = {}) {
  return new Request('https://app.example/api/playground/screenshot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

let lastFetch
function stubBackendOk() {
  lastFetch = null
  globalThis.fetch = async (url, init) => {
    lastFetch = { url, init }
    return new Response(new Blob([Uint8Array.from([1, 2, 3])], { type: 'image/png' }), {
      status: 200,
      headers: { 'Content-Type': 'image/png', 'x-cache': 'MISS' },
    })
  }
}

test('signed-in proxy forwards X-Shotbase-User-Id from auth(); client cannot spoof', async () => {
  process.env.SHOTBASE_BACKEND_BYPASS_KEY = 'test-secret'
  process.env.__TEST_CLERK_USER_ID__ = 'user_REAL'
  stubBackendOk()

  // Attacker attempts to spoof both via a client header AND via the JSON body.
  const res = await POST(
    makeReq(
      { url: 'https://example.com', userId: 'user_SPOOF', clerk_id: 'user_SPOOF' },
      { 'X-Shotbase-User-Id': 'user_SPOOF' },
    ),
  )

  assert.equal(res.status, 200)
  assert.ok(lastFetch, 'backend should have been called')
  const sent = new Headers(lastFetch.init.headers)
  assert.equal(sent.get('X-Shotbase-User-Id'), 'user_REAL', 'identity must come from auth()')
  assert.notEqual(sent.get('X-Shotbase-User-Id'), 'user_SPOOF', 'client input must not win')
  // Internal identity header must never be echoed back to the browser.
  assert.equal(res.headers.get('X-Shotbase-User-Id'), null)
})

test('missing backend secret fails closed with 500 and no backend call', async () => {
  delete process.env.SHOTBASE_BACKEND_BYPASS_KEY
  process.env.__TEST_CLERK_USER_ID__ = 'user_REAL'
  let called = false
  globalThis.fetch = async () => {
    called = true
    return new Response(null)
  }
  const res = await POST(makeReq({ url: 'https://example.com' }))
  assert.equal(res.status, 500)
  assert.equal(called, false, 'backend must not be called when the secret is absent')
})

test('unauthenticated request is rejected (401) with no backend call', async () => {
  process.env.SHOTBASE_BACKEND_BYPASS_KEY = 'test-secret'
  delete process.env.__TEST_CLERK_USER_ID__
  let called = false
  globalThis.fetch = async () => {
    called = true
    return new Response(null)
  }
  const res = await POST(makeReq({ url: 'https://example.com' }))
  assert.equal(res.status, 401)
  assert.equal(called, false)
})

test('SSRF guard still rejects internal targets (400) with no backend call', async () => {
  process.env.SHOTBASE_BACKEND_BYPASS_KEY = 'test-secret'
  process.env.__TEST_CLERK_USER_ID__ = 'user_REAL'
  let called = false
  globalThis.fetch = async () => {
    called = true
    return new Response(null)
  }
  // AWS metadata endpoint — must be blocked by lib/safe-url before any fetch.
  const res = await POST(makeReq({ url: 'http://169.254.169.254/latest/meta-data/' }))
  assert.equal(res.status, 400)
  assert.equal(called, false, 'must not reach the backend for an unsafe URL')
})

test('input validation still rejects a malformed body (400) with no backend call', async () => {
  process.env.SHOTBASE_BACKEND_BYPASS_KEY = 'test-secret'
  process.env.__TEST_CLERK_USER_ID__ = 'user_REAL'
  let called = false
  globalThis.fetch = async () => {
    called = true
    return new Response(null)
  }
  // Missing required `url` → Zod schema rejects before SSRF/backend.
  const res = await POST(makeReq({ format: 'png' }))
  assert.equal(res.status, 400)
  assert.equal(called, false)
})
