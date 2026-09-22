"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { planConfig } from "@/lib/plans"

const cardStyle: React.CSSProperties = {
  background: "#0a0a0a",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 12,
  padding: 28,
}

type Meter = { used: number; limit: number }
type Usage =
  | { available: true; plan: string; captures: Meter; ai_extractions: Meter }
  | { available: false }

function isMeter(m: unknown): m is Meter {
  return !!m && typeof (m as Meter).used === "number" && typeof (m as Meter).limit === "number"
}

function MeterRow({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0
  const remaining = Math.max(0, limit - used)
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888" }}>
          <span style={{ color: "#f0f0f0", fontWeight: 500 }}>{used.toLocaleString()}</span> / {limit.toLocaleString()}
        </div>
      </div>
      <div style={{ height: 8, background: "#1a1a24", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: pct > 80 ? "#ff9060" : "#00e87b", borderRadius: 4, transition: "width 0.3s" }} />
      </div>
      <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444" }}>{remaining.toLocaleString()} remaining</div>
    </div>
  )
}

export default function UsagePage() {
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((u) => {
        // Accounting is available only when the API explicitly says so AND
        // returns the V2 meters. Anything else → unavailable (never fabricate).
        if (u && u.available === true && isMeter(u.captures) && isMeter(u.ai_extractions)) {
          setUsage({ available: true, plan: u.plan || "free", captures: u.captures, ai_extractions: u.ai_extractions })
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

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>Usage</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>Consumption for the current billing period.</p>

      {loading ? (
        <div style={{ ...cardStyle, fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#444", textAlign: "center" }}>Loading usage…</div>
      ) : usage?.available !== true ? (
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#00e87b", fontWeight: 600, marginBottom: 6 }}>Current Plan</div>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>{planConfig(usage.plan).name}</div>
            </div>
            <Link
              href="/dashboard/settings/billing"
              style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#f0f0f0", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", padding: "8px 16px", borderRadius: 7, textDecoration: "none" }}
            >
              Manage billing
            </Link>
          </div>

          <MeterRow label="Captures" used={usage.captures.used} limit={usage.captures.limit} />
          <MeterRow label="AI extractions" used={usage.ai_extractions.used} limit={usage.ai_extractions.limit} />

          <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444" }}>Resets on the 1st of next month (UTC).</div>
        </div>
      )}

      <div style={{ marginTop: 16, fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444", lineHeight: 1.7 }}>
        <span style={{ color: "#00e87b" }}>→</span> Rate limits are per-plan, per-minute. See the <Link href="/docs" style={{ color: "#666" }}>docs</Link> for current limits.
      </div>
    </div>
  )
}
