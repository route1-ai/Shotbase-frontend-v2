import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { ScreenshotRequestSchema, zodErrorResponse } from '@/lib/validation'
import { validateSafeUrl, safeUrlReasonToMessage } from '@/lib/safe-url'

// Monthly screenshot limits per plan. Must match limits surfaced in /api/usage.
const PLAN_LIMITS: Record<string, number> = {
  free: 10000,
  starter: 50000,
  pro: 250000,
  scale: 1500000,
}

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
    // 3. Plan-quota check.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const [userRes, countRes] = await Promise.all([
        supabase.from('users').select('plan').eq('clerk_id', userId).single(),
        supabase
          .from('screenshots')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', startOfMonth.toISOString()),
      ])

      const plan = (userRes.data?.plan || 'free').toLowerCase()
      const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free
      const used = countRes.count ?? 0

      if (used >= limit) {
        return Response.json(
          { error: 'Monthly quota exceeded', plan, used, limit },
          { status: 429 }
        )
      }
    }

    // 4. Forward the validated body to the renderer with a bounded timeout.
    const res = await fetch('https://shotbase-production.up.railway.app/screenshot', {
      method: 'POST',
      headers: {
        // Authenticate to the render backend with the server-only shared secret
        // resolved above (backend PLAYGROUND_BYPASS_KEY). Clerk auth + plan-quota
        // check above already gate this route, so this doesn't widen the attack
        // surface from the proxy side. The secret is server-only and never logged.
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
