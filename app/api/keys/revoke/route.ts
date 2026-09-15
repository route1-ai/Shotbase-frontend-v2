import { auth } from '@clerk/nextjs/server'
import { listKeysByExternalId, deleteKey, UnkeyConfigError } from '@/lib/unkey'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let keyId: unknown
  try {
    ;({ keyId } = await req.json())
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  if (!keyId || typeof keyId !== 'string') {
    return Response.json({ error: 'Missing keyId' }, { status: 400 })
  }

  try {
    // Ownership check (Unkey v2): the key must belong to this user's externalId
    // (== Clerk userId) before we allow deletion.
    const keys = await listKeysByExternalId(userId)
    const ownsKey = keys.some((k) => k.keyId === keyId)
    if (!ownsKey) {
      return Response.json({ error: 'Unauthorized or key not found' }, { status: 403 })
    }

    await deleteKey(keyId)
    return Response.json({ success: true })
  } catch (err) {
    if (err instanceof UnkeyConfigError) {
      console.error('keys/revoke: Unkey not configured')
      return Response.json({ error: 'Key service not configured' }, { status: 503 })
    }
    console.error('keys/revoke failed:', err instanceof Error ? err.message : 'unknown error')
    return Response.json({ error: 'Failed to revoke key' }, { status: 502 })
  }
}
