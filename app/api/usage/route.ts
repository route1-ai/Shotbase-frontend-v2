import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { ensureUserRow } from '@/lib/ensure-user'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Self-heal a missing users row (pre-webhook signups) so plan/usage resolve.
    const user = await currentUser()
    await ensureUserRow(userId, user?.emailAddresses?.[0]?.emailAddress)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      // Accounting backend is intentionally unavailable — do NOT fabricate a
      // count/limit. Signal unavailability so the UI shows an honest state.
      return Response.json({ available: false })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0,0,0,0)

    // Fetch user plan
    const { data: userData } = await supabase
      .from('users')
      .select('plan')
      .eq('clerk_id', userId)
      .single()

    const userPlan = userData?.plan || 'Free'
    
    // Limits based on plan
    let limit = 10000
    if (userPlan.toLowerCase() === 'starter') limit = 50000
    if (userPlan.toLowerCase() === 'pro') limit = 250000
    if (userPlan.toLowerCase() === 'scale') limit = 1500000

    // Try to get count of screenshots for this month
    const { count, error } = await supabase
      .from('screenshots')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())

    if (error) {
      // Query failed → accounting unavailable; don't report a fake 0.
      console.error('Supabase screenshots count error:', error)
      return Response.json({ available: false })
    }

    return Response.json({ available: true, count: count || 0, plan: userPlan, limit })
  } catch (err: any) {
    console.error('Usage API error:', err)
    return Response.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
