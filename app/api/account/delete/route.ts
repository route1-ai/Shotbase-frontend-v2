import { auth, clerkClient } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { listKeysByExternalId, deleteKey } from '@/lib/unkey'

/**
 * Delete the authenticated user's account. Identity comes ONLY from Clerk auth()
 * — never from the request body. Irreversible.
 *
 * SAFETY GATE: stays fully disabled until BOTH
 *   - ACCOUNT_DELETION_ENABLED === 'true', and
 *   - production Supabase (DB cleanup) is configured,
 * so we can never delete an identity while leaving real application data behind.
 * While disabled the route performs NO side effects.
 *
 * Order is deliberate: revoke API keys FIRST (deleting the identity while valid
 * keys remain would orphan working credentials), then delete DB data, then the
 * Clerk account. Any failure before the Clerk step aborts and is reported.
 */
export async function POST() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  if (process.env.ACCOUNT_DELETION_ENABLED !== 'true') {
    return Response.json(
      { error: 'Account deletion is not enabled yet.', code: 'DELETION_DISABLED' },
      { status: 503 },
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    // Hard-gate: refuse to delete while DB cleanup is impossible. No side effects.
    return Response.json(
      { error: 'Account deletion is temporarily unavailable (data store not ready).', code: 'DB_UNAVAILABLE' },
      { status: 503 },
    )
  }

  const steps: Record<string, string> = {}

  // 1) Revoke every Unkey key first, or abort (never orphan valid credentials).
  try {
    const keys = await listKeysByExternalId(userId)
    let failed = 0
    for (const k of keys) {
      try {
        await deleteKey(k.keyId)
      } catch {
        failed++
      }
    }
    if (failed > 0) {
      return Response.json(
        { error: 'Could not revoke all API keys — aborted before deleting your account.', code: 'KEYS_REVOKE_FAILED', failed },
        { status: 500 },
      )
    }
    steps.keys = `revoked:${keys.length}`
  } catch (err) {
    console.error('account delete: key revocation failed:', err instanceof Error ? err.message : 'unknown')
    return Response.json(
      { error: 'Key service unavailable — aborted before deleting your account.', code: 'KEYS_UNAVAILABLE' },
      { status: 500 },
    )
  }

  // 2) Delete application/accounting data. Abort if it fails (don't delete the
  //    identity while its data survives).
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    await supabase.from('screenshots').delete().eq('user_id', userId)
    await supabase.from('users').delete().eq('clerk_id', userId)
    steps.data = 'deleted'
  } catch (err) {
    console.error('account delete: DB cleanup failed:', err instanceof Error ? err.message : 'unknown')
    return Response.json(
      { error: 'Could not delete your data — aborted before deleting your account.', code: 'DB_CLEANUP_FAILED', steps },
      { status: 500 },
    )
  }

  // 3) Delete the Clerk identity — irreversible.
  try {
    const client = await clerkClient()
    await client.users.deleteUser(userId)
    steps.identity = 'deleted'
  } catch (err) {
    console.error('account delete: Clerk deletion failed:', err instanceof Error ? err.message : 'unknown')
    return Response.json(
      { error: 'Account deletion failed at the identity provider. Some data was already removed — contact support.', code: 'CLERK_DELETE_FAILED', steps },
      { status: 500 },
    )
  }

  return Response.json({ ok: true, steps })
}
