"use client"

import React, { useEffect, useState } from "react"

export default function BillingPage() {
  const [usage, setUsage] = useState({ count: 0, plan: "Free", limit: 10000 })
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/usage").then((r) => r.json()).then((u) => {
      if (u) setUsage({ count: u.count || 0, plan: u.plan || "Free", limit: u.limit || 10000 })
    }).catch(() => {})
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

  const percentage = (usage.count / usage.limit) * 100

  const PLANS = [
    { id: "starter", name: "Starter", price: "$9", limit: "50,000 requests", features: ["Email support", "7-day log retention"] },
    { id: "pro", name: "Pro", price: "$19", limit: "250,000 requests", features: ["Priority support", "30-day log retention", "Custom webhooks"], popular: true },
    { id: "scale", name: "Scale", price: "$49", limit: "1,500,000 requests", features: ["24/7 Slack support", "90-day log retention", "Dedicated IPs"] },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>Billing & Usage</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 32 }}>Manage your subscription and monitor API usage.</p>

      <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 28, marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#00e87b", fontWeight: 600, marginBottom: 6 }}>Current Plan</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 2 }}>{usage.plan}</div>
            <div style={{ color: "#888", fontSize: 13 }}>{usage.limit.toLocaleString()} requests / month</div>
          </div>
          <button
            onClick={handlePortal}
            disabled={loadingPortal}
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#f0f0f0", padding: "8px 16px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: loadingPortal ? "not-allowed" : "pointer", opacity: loadingPortal ? 0.7 : 1 }}
          >
            {loadingPortal ? "Loading…" : "Manage billing"}
          </button>
        </div>

        <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Screenshots used</div>
          <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888" }}>
            <span style={{ color: "#f0f0f0", fontWeight: 500 }}>{usage.count.toLocaleString()}</span> / {usage.limit.toLocaleString()}
          </div>
        </div>

        <div style={{ height: 8, background: "#1a1a24", borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ height: "100%", width: `${Math.min(100, percentage)}%`, background: percentage > 80 ? "#ff9060" : "#00e87b", borderRadius: 4, transition: "width 0.3s" }} />
        </div>

        <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444" }}>Usage resets on the 1st of next month</div>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Available Plans</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {PLANS.map((p) => {
          const popular = !!p.popular
          return (
            <div
              key={p.id}
              style={{
                background: "#050505",
                border: `1px solid ${popular ? "rgba(0,232,123,0.35)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 12,
                padding: 22,
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {popular && (
                <div style={{ position: "absolute", top: -10, right: 22, background: "#00e87b", color: "#000", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Popular</div>
              )}
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{p.name}</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
                {p.price}<span style={{ fontSize: 13, color: "#888", fontWeight: 400 }}>/mo</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px 0", fontSize: 12, color: "#888", flex: 1 }}>
                <li style={{ marginBottom: 6, color: "#f0f0f0" }}>✓ {p.limit}</li>
                {p.features.map((f) => (
                  <li key={f} style={{ marginBottom: 6 }}>✓ {f}</li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(p.id)}
                disabled={loadingCheckout === p.id}
                style={{ width: "100%", background: popular ? "#00e87b" : "#111", color: popular ? "#000" : "#f0f0f0", border: popular ? "none" : "1px solid rgba(255,255,255,0.1)", padding: "10px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: loadingCheckout === p.id ? "not-allowed" : "pointer", opacity: loadingCheckout === p.id ? 0.7 : 1 }}
              >
                {loadingCheckout === p.id ? "Redirecting…" : `Upgrade to ${p.name}`}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
