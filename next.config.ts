import type { NextConfig } from "next";

/**
 * Global response headers applied to every route.
 *
 * Tested against https://securityheaders.com — target rating: A
 *
 * NOT adding Content-Security-Policy here yet — getting CSP right requires
 * auditing every third-party origin (Clerk, Stripe, Supabase, Vercel
 * Analytics, Sentry, any future widgets). CSP belongs in its own PR after
 * that audit.
 */
const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=()",
  },
  { key: "X-XSS-Protection", value: "0" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      {
        // RFC 9116 — security.txt is served as plain text.
        source: "/.well-known/security.txt",
        headers: [{ key: "Content-Type", value: "text/plain; charset=utf-8" }],
      },
    ];
  },

  // Permanent redirects from the old /account/* URL space to the unified
  // /dashboard/settings/* tree. Linked from emails, bookmarks, etc.
  async redirects() {
    return [
      { source: "/account", destination: "/dashboard/settings/profile", permanent: true },
      { source: "/account/profile", destination: "/dashboard/settings/profile", permanent: true },
      { source: "/account/billing", destination: "/dashboard/settings/billing", permanent: true },
      { source: "/account/security", destination: "/dashboard/settings/security", permanent: true },
      { source: "/account/preferences", destination: "/dashboard/settings/notifications", permanent: true },
    ];
  },
};

export default nextConfig;
