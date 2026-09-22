"use client"

import React from "react"
import Link from "next/link"

const BORDER = "rgba(255,255,255,0.07)"

const cardStyle: React.CSSProperties = {
  background: "#0a0a0a",
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  padding: 22,
}

// Webhooks aren't implemented yet — there's no backend to register endpoints,
// sign deliveries, or retry. Rather than present a form that only writes to
// throwaway local state (fake endpoints + fake signing secrets), we show an
// honest "coming soon" notice.
export default function WebhooksPage() {
  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>Webhooks</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>Signed HTTP callbacks for render, error, and quota events.</p>

      <div style={{ ...cardStyle, textAlign: "center", padding: "56px 28px", maxWidth: 560 }}>
        <div style={{ width: 56, height: 56, background: "#111", border: `1px solid ${BORDER}`, borderRadius: 12, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
            <circle cx="5" cy="17" r="3" />
            <circle cx="19" cy="17" r="3" />
            <circle cx="12" cy="6" r="3" />
            <path d="M10 8L7 14M14 8L17 14" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Webhooks are coming soon</span>
          <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 9, background: "#1a1a24", padding: "2px 7px", borderRadius: 10, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Soon</span>
        </div>
        <p style={{ color: "#888", fontSize: 13, lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>
          You&apos;ll be able to register HTTPS endpoints and receive HMAC-signed callbacks when a
          screenshot completes or fails, when structured extraction returns, and on quota events.
          It isn&apos;t available yet — no setup is required in the meantime.
        </p>
        <div style={{ marginTop: 20, fontFamily: "var(--font-ibm-plex)", fontSize: 12 }}>
          <Link href="/dashboard/logs" style={{ color: "#00e87b", textDecoration: "none" }}>View recent activity →</Link>
        </div>
      </div>
    </div>
  )
}
