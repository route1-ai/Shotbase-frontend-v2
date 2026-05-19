import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase env vars missing. Returning mock usage data.')
      return Response.json({ count: 0, plan: 'Free', limit: 10000 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0,0,0,0)

    // Try to get count of screenshots for this month
    const { count, error } = await supabase
      .from('screenshots')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())

    if (error) {
      console.error('Supabase screenshots count error:', error)
      return Response.json({ count: 0, plan: 'Free', limit: 10000 })
    }

    return Response.json({ count: count || 0, plan: 'Free', limit: 10000 })
  } catch (err: any) {
    console.error('Usage API error:', err)
    return Response.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
