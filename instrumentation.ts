/**
 * Next.js instrumentation hook — runs once per server start before any request.
 *
 * Currently a placeholder. When the Sentry wizard runs in task #5
 * (`npx @sentry/wizard@latest -i nextjs`), this file becomes:
 *
 *   export async function register() {
 *     if (process.env.NEXT_RUNTIME === 'nodejs') {
 *       await import('./sentry.server.config')
 *     }
 *     if (process.env.NEXT_RUNTIME === 'edge') {
 *       await import('./sentry.edge.config')
 *     }
 *   }
 *
 * When wiring Sentry, use the redaction helpers from `lib/sentry-redact.ts`
 * in `beforeSend` / `beforeBreadcrumb`. Otherwise inbound Authorization
 * headers (which carry customer API keys) end up in your Sentry events.
 */
export async function register() {
  // No-op until Sentry is installed.
}
