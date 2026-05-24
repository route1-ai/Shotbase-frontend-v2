import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Database not configured. Returning empty logs.')
      return Response.json({ logs: [] })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('screenshots')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Supabase query error (logs):', error)
      return Response.json({ logs: [] })
    }

    // Format for the dashboard UI
    const logs = (data || []).map((row: any) => ({
      id: row.id || `req_${Math.random().toString(36).slice(2, 7)}`,
      url: row.url || '—',
      status: row.status || 200,
      ms: row.time_ms || 0,
      format: row.format || 'png',
      cached: row.cached || false,
      // convert to roughly relative time or locale string
      ts: row.created_at ? new Date(row.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }) : 'Just now',
      size: row.size_kb ? `${Math.round(row.size_kb)} KB` : '—'
    }))

    return Response.json({ logs })
  } catch (err: any) {
    console.error('Logs API error:', err)
    return Response.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
