import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { ensureUserRow } from '@/lib/ensure-user'
import { normalizePlan, planConfig } from '@/lib/plans'

// Start of the current calendar month in UTC.
function startOfUtcMonth(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)).toISOString()
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Self-heal a missing users row (pre-webhook signups) so plan resolves.
    const user = await currentUser()
    await ensureUserRow(userId, user?.emailAddresses?.[0]?.emailAddress)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Accounting backend intentionally unavailable → do NOT fabricate counts.
    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ available: false })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const monthStart = startOfUtcMonth()

    const { data: userData } = await supabase
      .from('users')
      .select('plan')
      .eq('clerk_id', userId)
      .single()

    const plan = normalizePlan(userData?.plan)
    const cfg = planConfig(plan)

    // Captures used this month: successful (status 200) renders for this user.
    const capturesQuery = await supabase
      .from('screenshots')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 200)
      .gte('created_at', monthStart)

    // AI extractions used this month: successful renders where AI extraction
    // actually succeeded (ai_succeeded = true).
    const aiQuery = await supabase
      .from('screenshots')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 200)
      .eq('ai_succeeded', true)
      .gte('created_at', monthStart)

    // If the accounting query itself failed, report unavailable rather than 0.
    if (capturesQuery.error || aiQuery.error) {
      console.error('usage: accounting query error:', capturesQuery.error?.message || aiQuery.error?.message)
      return Response.json({ available: false })
    }

    return Response.json({
      available: true,
      plan,
      captures: { used: capturesQuery.count ?? 0, limit: cfg.captures },
      ai_extractions: { used: aiQuery.count ?? 0, limit: cfg.aiExtractions },
    })
  } catch (err) {
    console.error('Usage API error:', err instanceof Error ? err.message : 'unknown error')
    return Response.json({ available: false })
  }
}
