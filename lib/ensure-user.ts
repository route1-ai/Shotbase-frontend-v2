import { createClient } from '@supabase/supabase-js'

/**
 * Self-heal the Supabase `users` row for an authenticated Clerk user.
 *
 * Users who signed up BEFORE the production Clerk webhook (`user.created`) was
 * live have no `users` row. The render backend resolves plan/quota by
 * `clerk_id`; a missing row makes that lookup fail closed and the playground
 * returns 503 "Usage temporarily unavailable". This inserts the row on demand,
 * server-side, using ONLY the trusted Clerk identity passed in by the caller.
 *
 * Insert-if-missing semantics (`onConflict: clerk_id, ignoreDuplicates`): an
 * existing row is never modified, so a paid `plan` / `stripe_customer_id` /
 * `stripe_subscription_id` is always preserved. Free tier is stored as 'Free'
 * to match the column default and the Clerk webhook's insert.
 *
 * Best-effort: never throws. Callers proceed regardless; a transient failure
 * just means the next authenticated request retries the upsert.
 */
export async function ensureUserRow(
  userId: string,
  email: string | null | undefined,
): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey || !userId) return

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const row: Record<string, unknown> = { clerk_id: userId, plan: 'Free' }
    if (email) row.email = email
    const { error } = await supabase
      .from('users')
      .upsert(row, { onConflict: 'clerk_id', ignoreDuplicates: true })
    if (error) {
      console.error('ensureUserRow: upsert failed:', error.message)
    }
  } catch (err) {
    console.error('ensureUserRow: threw:', err instanceof Error ? err.message : 'unknown error')
  }
}
