import { Webhook } from 'svix'
import { createClient } from '@supabase/supabase-js'
import { createKeyForExternalId } from '@/lib/unkey'

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) {
    console.error('Clerk webhook not configured')
    return Response.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)
  let event: any
  try {
    event = new Webhook(secret).verify(payload, headers)
  } catch (err) {
    console.error('Clerk webhook verification failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'user.created') {
    const { id: clerkId, email_addresses } = event.data
    const email = email_addresses[0].email_address

    const { error: supabaseError } = await supabase
      .from('users')
      .insert({ clerk_id: clerkId, email })

    if (supabaseError) {
      console.error('Error inserting user into Supabase:', supabaseError)
      return Response.json({ error: 'Database insertion failed' }, { status: 500 })
    }

    try {
      // Unkey v2: create the user's default key, threading identity via
      // externalId (== Clerk userId) and stamping meta.plan for backend limits.
      await createKeyForExternalId(clerkId, 'free', 'Default')
    } catch (err) {
      // Non-fatal: the Supabase user row already exists and the user can create
      // a key from the dashboard. Log without leaking the root key.
      console.error(
        'clerk webhook: default key creation failed:',
        err instanceof Error ? err.message : 'unknown error',
      )
    }
  }
  return Response.json({ received: true })
}
