"use client"

import React from "react"

const cardStyle: React.CSSProperties = {
  background: "#0a0a0a",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 10,
  padding: 32,
  textAlign: "center" as const,
}

export default function WebhooksPage() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>Webhooks</h1>
          <p style={{ color: "#888", fontSize: 13 }}>Receive HTTP callbacks for screenshot completion, errors, and quota events.</p>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ width: 48, height: 48, background: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5">
            <circle cx="5" cy="17" r="3" />
            <circle cx="19" cy="17" r="3" />
            <circle cx="12" cy="6" r="3" />
            <path d="M10 8L7 14M14 8L17 14" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Webhooks ship in week 2</div>
        <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#444", marginBottom: 18 }}>
          You'll be able to configure endpoints here that receive signed POSTs<br />
          on `screenshot.completed`, `screenshot.failed`, and `quota.exceeded`.
        </div>
        <a
          href="/dashboard/integrations"
          style={{ display: "inline-flex", fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#00e87b", background: "rgba(0,232,123,0.08)", border: "1px solid rgba(0,232,123,0.25)", padding: "8px 16px", borderRadius: 6, textDecoration: "none" }}
        >
          See integrations →
        </a>
      </div>
    </div>
  )
}
