/**
 * Sentry breadcrumb / event redaction helpers.
 *
 * Wire these into sentry.server.config.ts after running the Sentry wizard
 * (task #5). Default Sentry config sends request bodies and headers as
 * breadcrumbs — that includes inbound `Authorization: Bearer <customer-key>`
 * headers, which would expose customer API keys to whoever has access to
 * Sentry. This module strips them.
 *
 * Example:
 *   import * as Sentry from '@sentry/nextjs'
 *   import { redactSentryEvent, redactSentryBreadcrumb } from '@/lib/sentry-redact'
 *
 *   Sentry.init({
 *     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
 *     beforeSend: redactSentryEvent,
 *     beforeBreadcrumb: redactSentryBreadcrumb,
 *     tracesSampleRate: 0.1,
 *   })
 */

const REDACTED = '[REDACTED]'

const SENSITIVE_HEADER_PATTERNS: RegExp[] = [
  /^authorization$/i,
  /^proxy-authorization$/i,
  /^cookie$/i,
  /^set-cookie$/i,
  /^x-api-key$/i,
  /-?key$/i,
  /-?secret$/i,
  /-?token$/i,
  /^x-csrf/i,
  /^x-clerk/i,
  /^stripe-signature$/i,
  /^svix-/i,
]

const SENSITIVE_QUERY_KEYS = new Set([
  'key',
  'apikey',
  'api_key',
  'token',
  'access_token',
  'refresh_token',
  'auth',
  'password',
  'secret',
])

function redactHeaders(headers: Record<string, unknown> | undefined) {
  if (!headers || typeof headers !== 'object') return headers
  const out: Record<string, unknown> = { ...headers }
  for (const k of Object.keys(out)) {
    if (SENSITIVE_HEADER_PATTERNS.some((p) => p.test(k))) {
      out[k] = REDACTED
    }
  }
  return out
}

function redactQueryString(qs: string | undefined): string | undefined {
  if (!qs) return qs
  try {
    const params = new URLSearchParams(qs)
    let changed = false
    for (const k of Array.from(params.keys())) {
      if (SENSITIVE_QUERY_KEYS.has(k.toLowerCase())) {
        params.set(k, REDACTED)
        changed = true
      }
    }
    return changed ? params.toString() : qs
  } catch {
    return qs
  }
}

export function redactSentryEvent<T extends { request?: any }>(event: T): T {
  if (event.request) {
    event.request.headers = redactHeaders(event.request.headers)
    event.request.cookies = REDACTED
    if (event.request.query_string) {
      event.request.query_string = redactQueryString(event.request.query_string)
    }
    if (event.request.data !== undefined) {
      // Never ship raw request bodies — they may contain customer secrets, PII,
      // schemas, prompts, etc. If you genuinely need them for a class of bug,
      // selectively allow-list the field instead of redacting the whole body.
      event.request.data = REDACTED
    }
  }
  return event
}

export function redactSentryBreadcrumb<T extends { category?: string; data?: any }>(
  breadcrumb: T
): T | null {
  if (breadcrumb?.data?.headers) {
    breadcrumb.data.headers = redactHeaders(breadcrumb.data.headers)
  }
  if (breadcrumb?.category === 'fetch' && typeof breadcrumb?.data?.url === 'string') {
    const u = breadcrumb.data.url as string
    const idx = u.indexOf('?')
    if (idx >= 0) {
      breadcrumb.data.url = u.slice(0, idx + 1) + (redactQueryString(u.slice(idx + 1)) || '')
    }
  }
  return breadcrumb
}
