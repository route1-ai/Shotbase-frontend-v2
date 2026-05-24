"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"

const cardStyle: React.CSSProperties = {
  background: "#0a0a0a",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 12,
  padding: 28,
}

export default function UsagePage() {
  const [usage, setUsage] = useState({ count: 0, plan: "Free", limit: 10000 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((u) => {
        if (u) setUsage({ count: u.count || 0, plan: u.plan || "Free", limit: u.limit || 10000 })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const percentage = (usage.count / usage.limit) * 100
  const remaining = Math.max(0, usage.limit - usage.count)

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>Usage</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>Consumption and rate limits for the current billing period.</p>

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#00e87b", fontWeight: 600, marginBottom: 6 }}>Current Plan</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 2 }}>{loading ? "…" : usage.plan}</div>
            <div style={{ color: "#888", fontSize: 13 }}>{usage.limit.toLocaleString()} requests per month</div>
          </div>
          <Link
            href="/dashboard/settings/billing"
            style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#f0f0f0", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", padding: "8px 16px", borderRadius: 7, textDecoration: "none" }}
          >
            Manage billing
          </Link>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Screenshots used</div>
          <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888" }}>
            <span style={{ color: "#f0f0f0", fontWeight: 500 }}>{usage.count.toLocaleString()}</span> / {usage.limit.toLocaleString()}
          </div>
        </div>
        <div style={{ height: 8, background: "#1a1a24", borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ height: "100%", width: `${Math.min(100, percentage)}%`, background: percentage > 80 ? "#ff9060" : "#00e87b", borderRadius: 4, transition: "width 0.3s" }} />
        </div>
        <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444" }}>
          {remaining.toLocaleString()} remaining · resets on the 1st of next month
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={cardStyle}>
          <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Rate limit</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>40 req / sec</div>
          <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444" }}>Burst up to 80 req/sec for short windows</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Concurrency</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>10 parallel</div>
          <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444" }}>Maximum concurrent render jobs per account</div>
        </div>
      </div>
    </div>
  )
}
