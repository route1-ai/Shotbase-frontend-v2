import { Webhook } from 'svix'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
  let event: any
  try { event = wh.verify(payload, headers) }
  catch { return Response.json({ error: 'Invalid' }, { status: 400 }) }

  if (event.type === 'user.created') {
    const { id: clerkId, email_addresses } = event.data
    const email = email_addresses[0].email_address

    const { data: user } = await supabase
      .from('users')
      .insert({ clerk_id: clerkId, email })
      .select().single()

    await fetch('https://api.unkey.dev/v1/keys.createKey', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.UNKEY_ROOT_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiId: process.env.UNKEY_API_ID, name: 'Default', ownerId: clerkId, meta: { plan: 'free' } })
    })
  }
  return Response.json({ received: true })
}
