"use client"

import React, { useState } from "react"

function getInitialPrefs() {
  if (typeof window === "undefined") return null
  try {
    const prefs = localStorage.getItem("shotbase_prefs")
    return prefs ? JSON.parse(prefs) : null
  } catch {
    return null
  }
}

function Toggle({
  value,
  onChange,
  label,
  sub,
}: {
  value: boolean
  onChange: (v: boolean) => void
  label: string
  sub: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={() => onChange(!value)}
      className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00e87b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] rounded-md"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "14px 8px",
        background: "none",
        border: "none",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        cursor: "pointer",
        textAlign: "left",
        color: "inherit",
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{label}</div>
        <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888" }}>{sub}</div>
      </div>
      <div
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          background: value ? "#00e87b" : "#1a1a1a",
          border: value ? "1px solid transparent" : "1px solid rgba(255,255,255,0.15)",
          position: "relative",
          transition: "background 0.2s, border-color 0.2s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            background: value ? "#000" : "#fff",
            position: "absolute",
            top: 2,
            left: value ? 20 : 2,
            transition: "left 0.2s, background 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
          }}
        />
      </div>
    </button>
  )
}

export default function NotificationsPage() {
  const [format, setFormat] = useState(() => getInitialPrefs()?.format || "png")
  const [width, setWidth] = useState(() => getInitialPrefs()?.width || "1280")
  const [emailUsage, setEmailUsage] = useState(() => getInitialPrefs()?.emailUsage ?? true)
  const [emailBilling, setEmailBilling] = useState(() => getInitialPrefs()?.emailBilling ?? true)
  const [emailIncidents, setEmailIncidents] = useState(() => getInitialPrefs()?.emailIncidents ?? true)
  const [emailProduct, setEmailProduct] = useState(() => getInitialPrefs()?.emailProduct ?? false)
  const [saved, setSaved] = useState(false)

  const save = () => {
    localStorage.setItem(
      "shotbase_prefs",
      JSON.stringify({ format, width, emailUsage, emailBilling, emailIncidents, emailProduct })
    )
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>Notifications</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 32 }}>API defaults and email preferences.</p>

      <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 28, marginBottom: 20, maxWidth: 680 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>API defaults</h2>

        <div style={{ marginBottom: 22 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Default format</label>
          <div style={{ display: "flex", gap: 10 }}>
            {["png", "jpeg", "webp"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: format === f ? "rgba(0,232,123,0.1)" : "#111",
                  border: `1px solid ${format === f ? "rgba(0,232,123,0.25)" : "rgba(255,255,255,0.07)"}`,
                  color: format === f ? "#00e87b" : "#888",
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: format === f ? 600 : 400,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-ibm-plex)",
                  letterSpacing: "0.05em",
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#888", marginTop: 8 }}>Used when no format is specified in the API request.</div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Default viewport width</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, padding: "9px 14px", color: "#f0f0f0", fontSize: 13, outline: "none", width: 140 }}
            />
            <span style={{ fontFamily: "var(--font-ibm-plex)", color: "#888", fontSize: 12 }}>pixels</span>
          </div>
        </div>
      </div>

      <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 28px 28px", marginBottom: 28, maxWidth: 680 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, margin: "16px 0 4px" }}>Email preferences</h2>
        <p style={{ color: "#888", fontFamily: "var(--font-ibm-plex)", fontSize: 12, marginBottom: 8 }}>What we email you about.</p>

        <Toggle label="Usage limits" sub="When you cross 80% / 100% of your monthly quota" value={emailUsage} onChange={setEmailUsage} />
        <Toggle label="Billing events" sub="Charge receipts, plan changes, failed payments" value={emailBilling} onChange={setEmailBilling} />
        <Toggle label="Incidents" sub="Live alerts when shotbase.dev experiences degraded service" value={emailIncidents} onChange={setEmailIncidents} />
        <Toggle label="Product updates" sub="New features, integrations, and changelog (~1×/month)" value={emailProduct} onChange={setEmailProduct} />
      </div>

      <button
        type="button"
        onClick={save}
        style={{ background: saved ? "#009950" : "#00e87b", color: "#000", border: "none", padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 0.15s" }}
      >
        {saved ? "✓ Saved" : "Save preferences"}
      </button>
    </div>
  )
}
