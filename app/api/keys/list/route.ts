import { auth } from '@clerk/nextjs/server'
import { listKeysByExternalId, UnkeyConfigError } from '@/lib/unkey'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Unkey v2: list this user's keys by externalId (== Clerk userId).
    const keys = await listKeysByExternalId(userId)

    // Map v2 KeyResponseData → the shape the dashboard already expects.
    const shaped = keys.map((k) => ({
      id: k.keyId,
      name: k.name ?? 'Key',
      createdAt: k.createdAt ?? null,
      active: k.enabled !== false,
      // Non-secret first-few-chars prefix for identification only. The full key
      // is never returned by Unkey after creation.
      start: k.start ?? null,
      // Last-used timestamp (ms) from Unkey — approximate, ~5min granularity.
      // Per-key request COUNT is not available from apis.listKeys.
      lastUsedAt: k.lastUsedAt ?? null,
    }))

    return Response.json({ keys: shaped })
  } catch (err) {
    if (err instanceof UnkeyConfigError) {
      console.error('keys/list: Unkey not configured')
      return Response.json({ error: 'Key service not configured' }, { status: 503 })
    }
    console.error('keys/list failed:', err instanceof Error ? err.message : 'unknown error')
    return Response.json({ error: 'Failed to fetch keys' }, { status: 502 })
  }
}
