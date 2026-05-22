import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

// Monthly screenshot limits per plan. Must match limits surfaced in /api/usage.
const PLAN_LIMITS: Record<string, number> = {
  free: 10000,
  starter: 50000,
  pro: 250000,
  scale: 1500000,
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Quota check before forwarding to Railway
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

    const body = await req.json()
    
    // Proxy the request to Railway backend
    const res = await fetch('https://shotbase-production.up.railway.app/screenshot', {
      method: 'POST',
      headers: {
        // Use a generic bypass or root key for the playground proxy
        'Authorization': `Bearer ${process.env.UNKEY_ROOT_KEY || 'playground_bypass'}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Railway API error:', res.status, errorText)
      return new Response(errorText, { status: res.status })
    }

    // Return the binary blob
    const blob = await res.blob()
    const headers = new Headers()
    headers.set('Content-Type', res.headers.get('Content-Type') || 'image/png')
    headers.set('x-cache', res.headers.get('x-cache') || 'MISS')
    
    return new Response(blob, { status: 200, headers })
  } catch (err: any) {
    console.error('Playground proxy error:', err)
    return Response.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
