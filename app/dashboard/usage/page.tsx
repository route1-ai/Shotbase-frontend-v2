"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"

const cardStyle: React.CSSProperties = {
  background: "#0a0a0a",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 12,
  padding: 28,
}

type Usage =
  | { available: true; count: number; plan: string; limit: number }
  | { available: false }

export default function UsagePage() {
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((u) => {
        // Accounting is available only when the API explicitly says so AND
        // returns real numbers. Anything else → treat as unavailable (never
        // fabricate a count/limit).
        if (u && u.available === true && typeof u.count === "number") {
          setUsage({ available: true, count: u.count, plan: u.plan || "Free", limit: u.limit })
        } else {
          setUsage({ available: false })
        }
        setLoading(false)
      })
      .catch(() => {
        setUsage({ available: false })
        setLoading(false)
      })
  }, [])

  const available = usage?.available === true

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>Usage</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>Consumption for the current billing period.</p>

      {loading ? (
        <div style={{ ...cardStyle, fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#444", textAlign: "center" }}>Loading usage…</div>
      ) : !available ? (
        // Honest unavailable state — no fabricated numbers.
        <div style={{ ...cardStyle }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Usage tracking temporarily unavailable</div>
          <p style={{ color: "#888", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            Request metering is being reconnected. Your account still works — captures run normally — but
            per-account usage counts aren&apos;t being displayed right now. Check back soon.
          </p>
        </div>
      ) : (
        <div style={{ ...cardStyle }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#00e87b", fontWeight: 600, marginBottom: 6 }}>Current Plan</div>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 2 }}>{(usage as { plan: string }).plan}</div>
              <div style={{ color: "#888", fontSize: 13 }}>{(usage as { limit: number }).limit.toLocaleString()} captures per month</div>
            </div>
            <Link
              href="/dashboard/settings/billing"
              style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#f0f0f0", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", padding: "8px 16px", borderRadius: 7, textDecoration: "none" }}
            >
              Manage billing
            </Link>
          </div>

          {(() => {
            const u = usage as { count: number; limit: number }
            const percentage = u.limit > 0 ? (u.count / u.limit) * 100 : 0
            const remaining = Math.max(0, u.limit - u.count)
            return (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Captures used</div>
                  <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888" }}>
                    <span style={{ color: "#f0f0f0", fontWeight: 500 }}>{u.count.toLocaleString()}</span> / {u.limit.toLocaleString()}
                  </div>
                </div>
                <div style={{ height: 8, background: "#1a1a24", borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
                  <div style={{ height: "100%", width: `${Math.min(100, percentage)}%`, background: percentage > 80 ? "#ff9060" : "#00e87b", borderRadius: 4, transition: "width 0.3s" }} />
                </div>
                <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444" }}>
                  {remaining.toLocaleString()} remaining · resets on the 1st of next month
                </div>
              </>
            )
          })()}
        </div>
      )}

      <div style={{ marginTop: 16, fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444", lineHeight: 1.7 }}>
        <span style={{ color: "#00e87b" }}>→</span> Rate limits are per-plan, per-minute. See the <Link href="/docs" style={{ color: "#666" }}>docs</Link> for current limits.
      </div>
    </div>
  )
}
