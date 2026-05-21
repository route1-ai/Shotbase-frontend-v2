import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Fetch user's current plan from Supabase so Unkey key carries plan metadata
    let plan = 'free'
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data } = await supabase
        .from('users')
        .select('plan')
        .eq('clerk_id', userId)
        .single()
      if (data?.plan) plan = data.plan.toLowerCase()
    }

    const res = await fetch('https://api.unkey.dev/v1/keys.createKey', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UNKEY_ROOT_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiId: process.env.UNKEY_API_ID,
        ownerId: userId,
        prefix: 'sk_live',
        meta: { plan }, // backend reads this to apply correct rate limit
      })
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Unkey API error:', res.status, errorText)
      return Response.json({ error: 'Failed to create key' }, { status: res.status })
    }

    const data = await res.json()
    return Response.json(data)
  } catch (err) {
    console.error('Failed to create Unkey API key:', err)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
