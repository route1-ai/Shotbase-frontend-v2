import type { NextConfig } from "next";

/**
 * Global response headers applied to every route.
 *
 * Tested against https://securityheaders.com — target rating: A
 *
 * We are NOT adding Content-Security-Policy here yet — getting CSP right
 * requires auditing every third-party origin (Clerk, Stripe, Supabase, Vercel
 * Analytics, Sentry, any future widgets) and a single misconfigured directive
 * breaks the site. CSP belongs in its own PR after that audit. Until then,
 * the headers below cover the highest-leverage defenses.
 */
const SECURITY_HEADERS = [
  // Force HTTPS for two years; eligible for the HSTS preload list once stable.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Disallow framing entirely — defends against clickjacking.
  { key: 'X-Frame-Options', value: 'DENY' },
  // Prevent MIME-type sniffing on responses.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Send only the origin on cross-origin navigation; full URL on same-origin.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Lock down powerful browser features by default. Re-enable per-route if needed.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=()',
  },
  // Legacy header — disabled per OWASP guidance (modern browsers handle XSS via CSP, not this).
  { key: 'X-XSS-Protection', value: '0' },
  // Allow popups (needed for Stripe Checkout, Clerk OAuth) but keep COOP isolation otherwise.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  // Block other origins from embedding/loading our resources except same-site.
  { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework via X-Powered-By.
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
      {
        // RFC 9116 — security.txt should be served as plain text.
        source: '/.well-known/security.txt',
        headers: [{ key: 'Content-Type', value: 'text/plain; charset=utf-8' }],
      },
    ];
  },

  // Permanent redirects from old URL spaces so bookmarks and email links keep working.
  async redirects() {
    return [
      // /account/* was migrated into /dashboard/settings/* in PR #39.
      { source: '/account', destination: '/dashboard/settings/profile', permanent: true },
      { source: '/account/profile', destination: '/dashboard/settings/profile', permanent: true },
      { source: '/account/billing', destination: '/dashboard/settings/billing', permanent: true },
      { source: '/account/security', destination: '/dashboard/settings/security', permanent: true },
      { source: '/account/preferences', destination: '/dashboard/settings/notifications', permanent: true },
      // Playground moved under the dashboard tree so the sidebar persists across routes.
      { source: '/playground', destination: '/dashboard/playground', permanent: true },
    ];
  },
};

export default nextConfig;
