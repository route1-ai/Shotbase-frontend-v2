"use client"

import React, { useEffect, useState } from "react"
import { PLANS, BUSINESS, planConfig, salesContactHref } from "@/lib/plans"

type Meter = { used: number; limit: number }
type Usage =
  | { available: true; plan: string; captures: Meter; ai_extractions: Meter }
  | { available: false }
  | null

// Real, non-gated capabilities shown on every paid plan (differences are the
// numeric limits, not feature gating).
const CORE_FEATURES = [
  "REST API + MCP server",
  "PNG / JPEG / WebP / PDF",
  "Full-page & custom viewport",
  "Page text + structured extraction",
]

function Bar({ used, limit }: Meter) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0
  return (
    <>
      <div style={{ height: 8, background: "#1a1a24", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: pct > 80 ? "#ff9060" : "#00e87b", borderRadius: 4, transition: "width 0.3s" }} />
      </div>
    </>
  )
}

export default function BillingPage() {
  const [usage, setUsage] = useState<Usage>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((u) => {
        if (u && u.available === true && u.captures && u.ai_extractions) {
          setUsage({ available: true, plan: u.plan, captures: u.captures, ai_extractions: u.ai_extractions })
        } else {
          setUsage({ available: false })
        }
      })
      .catch(() => setUsage({ available: false }))
  }, [])

  const handlePortal = async () => {
    setLoadingPortal(true)
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" })
      const { url, error } = await res.json()
      if (url) window.location.href = url
      else if (error) alert(error)
    } finally {
      setLoadingPortal(false)
    }
  }

  const handleCheckout = async (tier: string) => {
    setLoadingCheckout(tier)
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      })
      const { url, error } = await res.json()
      if (url) window.location.href = url
      else if (error) alert(error)
    } finally {
      setLoadingCheckout(null)
    }
  }

  const currentPlanName = usage?.available ? planConfig(usage.plan).name : null
  const paid = [PLANS.builder, PLANS.pro]

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>Billing &amp; Usage</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 32 }}>Manage your subscription and monitor API usage.</p>

      {/* Current plan + usage */}
      <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 28, marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#00e87b", fontWeight: 600, marginBottom: 6 }}>Current Plan</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>{currentPlanName ?? (usage === null ? "…" : "—")}</div>
          </div>
          <button
            onClick={handlePortal}
            disabled={loadingPortal}
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#f0f0f0", padding: "8px 16px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: loadingPortal ? "not-allowed" : "pointer", opacity: loadingPortal ? 0.7 : 1 }}
          >
            {loadingPortal ? "Loading…" : "Manage billing"}
          </button>
        </div>

        {usage === null ? (
          <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#444" }}>Loading usage…</div>
        ) : usage.available === false ? (
          <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>
            <strong style={{ color: "#f0f0f0" }}>Usage tracking temporarily unavailable.</strong> Captures still work; per-account counts aren&apos;t being displayed right now.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Captures</div>
                <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888" }}>
                  <span style={{ color: "#f0f0f0", fontWeight: 500 }}>{usage.captures.used.toLocaleString()}</span> / {usage.captures.limit.toLocaleString()}
                </div>
              </div>
              <Bar used={usage.captures.used} limit={usage.captures.limit} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>AI extractions</div>
                <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888" }}>
                  <span style={{ color: "#f0f0f0", fontWeight: 500 }}>{usage.ai_extractions.used.toLocaleString()}</span> / {usage.ai_extractions.limit.toLocaleString()}
                </div>
              </div>
              <Bar used={usage.ai_extractions.used} limit={usage.ai_extractions.limit} />
            </div>
          </div>
        )}
        <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444", marginTop: 14 }}>Usage resets on the 1st of next month (UTC).</div>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Plans</h2>

      <style>{`
        .bill-plans > * { min-width: 0; }
        @media (max-width: 767px) { .bill-plans { grid-template-columns: minmax(0, 1fr) !important; } }
      `}</style>
      <div className="bill-plans" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {paid.map((p) => (
          <div key={p.id} style={{ background: "#050505", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 22, display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{p.name}</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
              ${p.priceMonthly}<span style={{ fontSize: 13, color: "#888", fontWeight: 400 }}>/mo</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px 0", fontSize: 12, color: "#888", flex: 1 }}>
              <li style={{ marginBottom: 6, color: "#f0f0f0" }}>✓ {p.captures.toLocaleString()} captures / month</li>
              <li style={{ marginBottom: 6, color: "#f0f0f0" }}>✓ {p.aiExtractions.toLocaleString()} AI extractions / month</li>
              <li style={{ marginBottom: 6, color: "#f0f0f0" }}>✓ {p.rpm} requests / minute</li>
              {CORE_FEATURES.map((f) => (
                <li key={f} style={{ marginBottom: 6 }}>✓ {f}</li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout(p.id)}
              disabled={loadingCheckout === p.id}
              style={{ width: "100%", background: "#00e87b", color: "#000", border: "none", padding: "10px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: loadingCheckout === p.id ? "not-allowed" : "pointer", opacity: loadingCheckout === p.id ? 0.7 : 1 }}
            >
              {loadingCheckout === p.id ? "Redirecting…" : `Upgrade to ${p.name}`}
            </button>
          </div>
        ))}

        {/* Business — contact sales, no checkout. */}
        <div style={{ background: "#050505", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 22, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{BUSINESS.name}</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{BUSINESS.priceLabel}</div>
          <p style={{ fontSize: 12, color: "#888", lineHeight: 1.6, flex: 1, margin: "0 0 22px 0" }}>{BUSINESS.blurb}</p>
          <a
            href={salesContactHref()}
            style={{ width: "100%", background: "#111", color: "#f0f0f0", border: "1px solid rgba(255,255,255,0.1)", padding: "10px", borderRadius: 8, fontSize: 12, fontWeight: 600, textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}
          >
            {BUSINESS.cta}
          </a>
        </div>
      </div>
    </div>
  )
}
