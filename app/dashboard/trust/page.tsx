"use client"

import React from "react"

const cardStyle: React.CSSProperties = {
  background: "#0a0a0a",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 12,
  padding: 24,
}

type Status = "ready" | "in_progress" | "available_enterprise" | "deferred"

function Badge({ status }: { status: Status }) {
  const map: Record<Status, { label: string; bg: string; fg: string; border: string }> = {
    ready: { label: "Ready", bg: "rgba(0,232,123,0.1)", fg: "#00e87b", border: "rgba(0,232,123,0.25)" },
    in_progress: { label: "In progress", bg: "rgba(255,176,0,0.08)", fg: "#ffb000", border: "rgba(255,176,0,0.25)" },
    available_enterprise: { label: "Enterprise", bg: "rgba(120,140,255,0.08)", fg: "#8a9eff", border: "rgba(120,140,255,0.25)" },
    deferred: { label: "Roadmap", bg: "#1a1a24", fg: "#666", border: "rgba(255,255,255,0.07)" },
  }
  const s = map[status]
  return (
    <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, padding: "2px 8px", borderRadius: 4, background: s.bg, color: s.fg, border: `1px solid ${s.border}`, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
      {s.label}
    </span>
  )
}

function Row({ name, status, note }: { name: string; status: Status; note?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{name}</div>
        {note && <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#666", marginTop: 2 }}>{note}</div>}
      </div>
      <Badge status={status} />
    </div>
  )
}

const SUBPROCESSORS = [
  { name: "Vercel", purpose: "Application hosting, edge network", region: "US, EU" },
  { name: "Supabase", purpose: "Database, user records, audit logs", region: "US" },
  { name: "Railway", purpose: "Render workers (browser automation)", region: "US" },
  { name: "Clerk", purpose: "Authentication and session management", region: "US" },
  { name: "Stripe", purpose: "Billing and payment processing", region: "US" },
  { name: "Unkey", purpose: "API key issuance and verification", region: "US" },
  { name: "Upstash", purpose: "Rate-limiting + caching (Redis)", region: "US" },
  { name: "Sentry", purpose: "Error tracking (PII-redacted)", region: "US" },
]

export default function TrustPage() {
  return (
    <div style={{ maxWidth: 820 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>Trust Center</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 28 }}>
        How Shotbase handles your data, where it lives, and the security controls we operate.
        Last reviewed {new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" })}.
      </p>

      <h2 style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666", marginBottom: 12 }}>Security posture</h2>
      <div style={{ ...cardStyle, marginBottom: 24, padding: "8px 24px" }}>
        <Row name="Encryption in transit" status="ready" note="TLS 1.3, HSTS preload (max-age 2 years)" />
        <Row name="Encryption at rest" status="ready" note="AES-256 on Supabase + Vercel managed storage" />
        <Row name="Audit logging" status="ready" note="Every API call appended, 90-day default retention (configurable)" />
        <Row name="Rate limiting + abuse protection" status="ready" note="Per-IP + per-key sliding window via Upstash Redis" />
        <Row name="SSRF defense on render proxy" status="ready" note="URL allowlist + private-IP blocking + scheme filtering" />
        <Row name="Bot protection on signup" status="ready" note="Cloudflare Turnstile via Clerk" />
        <Row name="Daily secret scanning + SAST" status="ready" note="gitleaks + CodeQL on every PR + nightly" />
      </div>

      <h2 style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666", marginBottom: 12 }}>Privacy + data controls</h2>
      <div style={{ ...cardStyle, marginBottom: 24, padding: "8px 24px" }}>
        <Row name="GDPR / CCPA right-to-erasure" status="ready" note="DELETE /api/account wipes user + screenshots + audit logs" />
        <Row name="Configurable screenshot retention" status="ready" note="30 / 60 / 90 / 365 days (per workspace)" />
        <Row name="PII redaction toggle on /extract" status="in_progress" note="Detected PII redacted before storage when redact_pii=true" />
        <Row name="Cookie consent (EU)" status="in_progress" note="Honoring the user's choice — analytics gated on accept" />
        <Row name="Data Processing Agreement (DPA)" status="available_enterprise" note="Available on Pro+ plans" />
      </div>

      <h2 style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666", marginBottom: 12 }}>Compliance roadmap</h2>
      <div style={{ ...cardStyle, marginBottom: 24, padding: "8px 24px" }}>
        <Row name="SOC 2 Type I" status="deferred" note="Begins after first paying enterprise customer" />
        <Row name="SOC 2 Type II" status="deferred" note="6+ months of operating Type I controls" />
        <Row name="HIPAA BAA" status="deferred" note="Available on Enterprise plan once Vercel/Supabase BAAs are in place" />
        <Row name="ISO 27001" status="deferred" note="Roadmap year 2" />
      </div>

      <h2 style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666", marginBottom: 12 }}>Subprocessors</h2>
      <div style={{ ...cardStyle, marginBottom: 24, padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Provider", "Purpose", "Region"].map((h) => (
                <th key={h} style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", fontWeight: 500, textAlign: "left", padding: "14px 24px" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SUBPROCESSORS.map((p, i) => (
              <tr key={p.name} style={{ borderBottom: i < SUBPROCESSORS.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                <td style={{ fontSize: 13, fontWeight: 500, padding: "12px 24px" }}>{p.name}</td>
                <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888", padding: "12px 24px" }}>{p.purpose}</td>
                <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888", padding: "12px 24px" }}>{p.region}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666", marginBottom: 12 }}>Reporting a vulnerability</h2>
      <div style={cardStyle}>
        <p style={{ fontSize: 13, color: "#888", lineHeight: 1.7, margin: 0 }}>
          Found a security issue?{" "}
          <a href="mailto:security@shotbase.dev" style={{ color: "#00e87b", textDecoration: "none" }}>security@shotbase.dev</a> — please do not file a public GitHub issue.
          We acknowledge reports within 48 hours and aim to ship a fix or detailed mitigation plan within 14 days.{" "}
          <a href="https://github.com/route1-ai/Shotbase-frontend-v2/blob/main/SECURITY.md" style={{ color: "#888", textDecoration: "underline" }}>Full policy ↗</a>
        </p>
      </div>
    </div>
  )
}
