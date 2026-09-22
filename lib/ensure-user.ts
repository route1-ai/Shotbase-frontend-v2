import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Create the service-role client ONCE at module scope and reuse it across
// requests in this function instance — createClient() on every call allocated a
// fresh client (and its internal fetch/agent state) per playground request.
// Resolved lazily so a missing env var doesn't crash at import time; null when
// Supabase isn't configured (callers then treat the upsert as a no-op failure).
let cachedClient: SupabaseClient | null | undefined
function getClient(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  cachedClient = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null
  return cachedClient
}

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
 * Best-effort: never throws. Returns whether the upsert completed without error
 * so callers can cache "already ensured" and skip it next time; a transient
 * failure returns false and the next authenticated request retries the upsert.
 */
export async function ensureUserRow(
  userId: string,
  email: string | null | undefined,
): Promise<boolean> {
  if (!userId) return false
  const supabase = getClient()
  if (!supabase) return false

  try {
    const row: Record<string, unknown> = { clerk_id: userId, plan: 'Free' }
    if (email) row.email = email
    const { error } = await supabase
      .from('users')
      .upsert(row, { onConflict: 'clerk_id', ignoreDuplicates: true })
    if (error) {
      console.error('ensureUserRow: upsert failed:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('ensureUserRow: threw:', err instanceof Error ? err.message : 'unknown error')
    return false
  }
}
