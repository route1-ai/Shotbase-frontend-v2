// Server-only Unkey v2 client (https://api.unkey.com/v2).
//
// Reads UNKEY_ROOT_KEY / UNKEY_API_ID from the server environment. NEVER import
// this from a 'use client' component, never log the root key, and never return
// it to the caller. All identity is threaded via `externalId` == Clerk userId,
// matching keys created by app/api/keys/create/route.ts.

import { planToUnkeyMeta } from '@/lib/plans'

const UNKEY_V2_BASE = 'https://api.unkey.com/v2'

// Subset of the v2 KeyResponseData object we actually consume.
export interface UnkeyKey {
  keyId: string
  name?: string
  enabled?: boolean
  meta?: Record<string, unknown>
  createdAt?: number
  start?: string
  externalId?: string
}

/** Thrown when UNKEY_ROOT_KEY / UNKEY_API_ID are absent — callers fail closed. */
export class UnkeyConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnkeyConfigError'
  }
}

/** Thrown when Unkey returns a non-2xx response. Carries the HTTP status only. */
export class UnkeyRequestError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'UnkeyRequestError'
    this.status = status
  }
}

function config(): { rootKey: string; apiId: string } {
  const rootKey = process.env.UNKEY_ROOT_KEY
  const apiId = process.env.UNKEY_API_ID
  if (!rootKey || !apiId) {
    // Never include secret material in the message.
    throw new UnkeyConfigError('Unkey is not configured (UNKEY_ROOT_KEY / UNKEY_API_ID missing)')
  }
  return { rootKey, apiId }
}

async function unkeyPost<T>(path: string, body: Record<string, unknown>, rootKey: string): Promise<T> {
  const res = await fetch(`${UNKEY_V2_BASE}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${rootKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    // Log the status + Unkey's own error body only. Never the request headers,
    // which carry the root key.
    const detail = await res.text().catch(() => '')
    console.error(`Unkey ${path} failed:`, res.status, detail.slice(0, 300))
    throw new UnkeyRequestError(res.status, `Unkey ${path} returned ${res.status}`)
  }
  return (await res.json()) as T
}

/** List every key for a given externalId (Clerk userId), following pagination. */
export async function listKeysByExternalId(externalId: string): Promise<UnkeyKey[]> {
  const { rootKey, apiId } = config()
  const keys: UnkeyKey[] = []
  let cursor: string | undefined
  do {
    const body: Record<string, unknown> = { apiId, externalId, limit: 100 }
    if (cursor) body.cursor = cursor
    const json = await unkeyPost<{
      data?: UnkeyKey[]
      pagination?: { cursor?: string; hasMore?: boolean }
    }>('apis.listKeys', body, rootKey)
    if (Array.isArray(json.data)) keys.push(...json.data)
    cursor = json.pagination?.hasMore ? json.pagination?.cursor : undefined
  } while (cursor)
  return keys
}

/**
 * Create the default key for a user. Returns the plaintext key ONCE (Unkey never
 * returns it again). `plan` is normalised into meta.plan for backend rate limits.
 */
export async function createKeyForExternalId(
  externalId: string,
  plan: string,
  name = 'Default',
): Promise<{ keyId: string; key: string }> {
  const { rootKey, apiId } = config()
  const json = await unkeyPost<{ data?: { keyId?: string; key?: string } }>(
    'keys.createKey',
    { apiId, externalId, prefix: 'sk_live', name, meta: { plan: planToUnkeyMeta(plan) } },
    rootKey,
  )
  if (!json.data?.keyId || !json.data?.key) {
    throw new UnkeyRequestError(502, 'Unkey createKey returned an unexpected shape')
  }
  return { keyId: json.data.keyId, key: json.data.key }
}

/** Permanently delete a key by id. */
export async function deleteKey(keyId: string): Promise<void> {
  const { rootKey } = config()
  await unkeyPost('keys.deleteKey', { keyId }, rootKey)
}

/**
 * Update a single key's meta.plan. NOTE: Unkey v2 replaces the whole meta object;
 * keys in this app only ever carry `{ plan }`, so replacing is safe here.
 */
export async function updateKeyPlan(keyId: string, plan: string): Promise<void> {
  const { rootKey } = config()
  await unkeyPost('keys.updateKey', { keyId, meta: { plan: planToUnkeyMeta(plan) } }, rootKey)
}

/**
 * Sync meta.plan across ALL of a user's keys so backend rate limits match their
 * current plan. Best-effort: attempts every key, returns counts. Individual
 * failures are logged (never the secret) and reflected in `failed`. A config
 * error (Unkey not set up) still throws so the caller can decide what to do.
 */
export async function syncPlanForExternalId(
  externalId: string,
  plan: string,
): Promise<{ total: number; updated: number; failed: number }> {
  const keys = await listKeysByExternalId(externalId)
  let updated = 0
  let failed = 0
  for (const k of keys) {
    try {
      await updateKeyPlan(k.keyId, plan)
      updated++
    } catch {
      failed++
    }
  }
  return { total: keys.length, updated, failed }
}
