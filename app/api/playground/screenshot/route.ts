import { auth, currentUser } from '@clerk/nextjs/server'
import { ScreenshotRequestSchema, zodErrorResponse } from '@/lib/validation'
import { validateSafeUrl, safeUrlReasonToMessage } from '@/lib/safe-url'
import { ensureUserRow } from '@/lib/ensure-user'

// NOTE: this proxy deliberately does NOT enforce capture/AI/rate quotas. The
// Railway backend is the single authoritative enforcement point (keyed off the
// trusted X-Shotbase-User-Id + the user's plan). Duplicating limits here caused
// backend/frontend drift, so it was removed.

// Bound the upstream call so a hung render can't tie up a Vercel function slot.
const RENDER_TIMEOUT_MS = 60_000

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Server-only shared secret used to authenticate this proxy to the render
  // backend (matches the backend's PLAYGROUND_BYPASS_KEY). It must never reach
  // the browser: read it only here in server route code, never expose it via a
  // NEXT_PUBLIC_ var, and never log its value. Fail closed if it's absent so we
  // never fall back to a public/default token.
  const backendBypassKey = process.env.SHOTBASE_BACKEND_BYPASS_KEY
  if (!backendBypassKey) {
    console.error('SHOTBASE_BACKEND_BYPASS_KEY is not configured — refusing to proxy render request')
    return Response.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  // Self-heal: the render backend resolves plan/quota by clerk_id. A user who
  // predates the Clerk webhook has no Supabase row, which makes the backend fail
  // closed with 503. Ensure the row exists (insert-if-missing) before forwarding.
  const user = await currentUser()
  await ensureUserRow(userId, user?.emailAddresses?.[0]?.emailAddress)

  // 1. Parse + validate the request body shape with Zod.
  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = ScreenshotRequestSchema.safeParse(rawBody)
  if (!parsed.success) return zodErrorResponse(parsed.error)
  const body = parsed.data

  // 2. SSRF guard — reject URLs that point at private / internal / metadata
  //    destinations BEFORE forwarding anywhere or spending render credits.
  const urlCheck = validateSafeUrl(body.url)
  if (!urlCheck.ok) {
    return Response.json({ error: safeUrlReasonToMessage(urlCheck) }, { status: 400 })
  }

  try {
    // 3. Forward the validated body to the renderer with a bounded timeout.
    //    The backend enforces quotas/rate limits authoritatively.
    const res = await fetch('https://api.shotbase.dev/screenshot', {
      method: 'POST',
      headers: {
        // Authenticate to the render backend with the server-only shared secret
        // resolved above (backend PLAYGROUND_BYPASS_KEY). Clerk auth gates this
        // route; the secret is server-only and never logged.
        'Authorization': `Bearer ${backendBypassKey}`,
        'Content-Type': 'application/json',
        // Trusted identity: the authenticated Clerk userId, sourced ONLY from
        // auth() above — never from the request body, query, or a client-sent
        // header — so a caller cannot attribute a render to another user. This
        // internal header is never copied onto the response returned to the
        // browser (see the whitelist where we build the response headers below).
        'X-Shotbase-User-Id': userId,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(RENDER_TIMEOUT_MS),
    })

    if (!res.ok) {
      // Log the upstream details server-side but DO NOT echo them back —
      // raw render errors can leak internals (paths, queue states, etc.).
      const errorText = await res.text().catch(() => '')
      console.error('Render upstream error:', res.status, errorText.slice(0, 500))
      return Response.json(
        { error: 'Render failed', status: res.status },
        { status: res.status >= 400 && res.status < 600 ? res.status : 502 }
      )
    }

    // 5. Stream the binary back to the client. Whitelist the headers we copy.
    const blob = await res.blob()
    const headers = new Headers()
    headers.set('Content-Type', res.headers.get('Content-Type') || 'image/png')
    headers.set('x-cache', res.headers.get('x-cache') || 'MISS')
    return new Response(blob, { status: 200, headers })
  } catch (err) {
    const isAbort = err instanceof Error && err.name === 'AbortError'
    console.error('Playground proxy error:', isAbort ? 'upstream timeout' : err)
    return Response.json(
      { error: isAbort ? 'Render timed out' : 'Render failed' },
      { status: isAbort ? 504 : 500 }
    )
  }
}
