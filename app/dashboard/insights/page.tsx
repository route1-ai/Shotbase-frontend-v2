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

// Insights require the usage/logs accounting backend, which is not yet wired in
// production. We intentionally show an honest empty state rather than any
// fabricated charts/metrics. Real aggregation will replace this once the
// screenshots-logs pipeline is available.
export default function InsightsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>Insights</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>Aggregate analytics over your render activity.</p>

      <div style={{ ...cardStyle, textAlign: "center", padding: "56px 28px" }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(0,232,123,0.08)", border: "1px solid rgba(0,232,123,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="22" height="22" viewBox="0 0 16 16" fill="none"><path d="M2 13V8M6 13V3M10 13v-7M14 13v-3" stroke="#00e87b" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Insights will appear once usage tracking is enabled</div>
        <p style={{ color: "#888", fontSize: 13, lineHeight: 1.6, maxWidth: 440, margin: "0 auto" }}>
          Latency, error rates, top domains and traffic patterns are generated from your real render
          history. They&apos;ll show up here as soon as usage tracking is reconnected — no sample or
          placeholder numbers are shown in the meantime.
        </p>
        <div style={{ marginTop: 20, fontFamily: "var(--font-ibm-plex)", fontSize: 12 }}>
          <Link href="/dashboard/playground" style={{ color: "#00e87b", textDecoration: "none" }}>Try the Playground →</Link>
        </div>
      </div>
    </div>
  )
}
