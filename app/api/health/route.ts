import { auth } from '@clerk/nextjs/server'

// Thin server-side proxy to the render backend's GET /health so the dashboard
// "Operational" badge reflects reality instead of a hardcoded green dot.
//
// Proxied (not called from the browser) for two reasons: it avoids depending on
// the backend sending permissive CORS headers, and it keeps with the rule that
// the frontend talks to the backend through /api/* routes. The backend /health
// is a public, non-sensitive status probe; we still gate on Clerk auth since
// only the authenticated dashboard consumes it, and we return a minimal shape.

const HEALTH_URL =
  (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.shotbase.dev').replace(/\/+$/, '') + '/health'

const HEALTH_TIMEOUT_MS = 5_000

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const res = await fetch(HEALTH_URL, {
      method: 'GET',
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
      // Never serve a stale cached health result.
      cache: 'no-store',
    })
    const body = (await res.json().catch(() => null)) as { status?: unknown } | null
    // Green only when the request succeeds AND the backend reports status "ok".
    const ok = res.ok && body?.status === 'ok'
    return Response.json({ ok }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    // Timeout / network / DNS → not operational.
    return Response.json({ ok: false }, { headers: { 'Cache-Control': 'no-store' } })
  }
}
