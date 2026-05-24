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

// Mock data — real charts wire up once Supabase logs aggregation exists.
const TOP_DOMAINS = [
  { host: "stripe.com",    requests: 1284, p50: 198, p95: 421, errors: 0.4 },
  { host: "vercel.com",    requests: 942,  p50: 215, p95: 540, errors: 0.1 },
  { host: "linear.app",    requests: 631,  p50: 178, p95: 380, errors: 0.0 },
  { host: "github.com",    requests: 528,  p50: 248, p95: 612, errors: 1.2 },
  { host: "ycombinator.com", requests: 412,  p50: 162, p95: 350, errors: 0.0 },
  { host: "openai.com",    requests: 309,  p50: 287, p95: 720, errors: 0.6 },
]

const TOP_ERRORS = [
  { code: 408, label: "Render timeout", count: 24, pct: 38 },
  { code: 502, label: "Upstream error", count: 11, pct: 17 },
  { code: 400, label: "Invalid URL",    count: 8,  pct: 13 },
  { code: 429, label: "Rate limited",   count: 5,  pct: 8 },
]

const HOURLY = Array.from({ length: 24 }, (_, i) => 30 + Math.sin(i / 3) * 25 + Math.random() * 20)

function tag(color: "green" | "yellow" | "red") {
  const m = {
    green:  { bg: "rgba(0,232,123,0.1)",  fg: "#00e87b", br: "rgba(0,232,123,0.25)" },
    yellow: { bg: "rgba(255,176,0,0.08)", fg: "#ffb000", br: "rgba(255,176,0,0.25)" },
    red:    { bg: "rgba(255,60,60,0.1)",  fg: "#ff6060", br: "rgba(255,60,60,0.25)" },
  }[color]
  return {
    fontFamily: "var(--font-ibm-plex)",
    fontSize: 10,
    padding: "2px 7px",
    borderRadius: 4,
    background: m.bg,
    color: m.fg,
    border: `1px solid ${m.br}`,
  } as React.CSSProperties
}

export default function InsightsPage() {
  // Latency distribution bars
  const max = Math.max(...HOURLY)

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>Insights</h1>
          <p style={{ color: "#888", fontSize: 13 }}>
            Aggregate analytics over your render history. Last 7 days · all endpoints.
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["24h", "7d", "30d", "90d"].map((t, i) => (
            <button key={t} style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, padding: "5px 12px", background: i === 1 ? "rgba(0,232,123,0.08)" : "transparent", border: `1px solid ${i === 1 ? "rgba(0,232,123,0.25)" : BORDER}`, borderRadius: 6, color: i === 1 ? "#00e87b" : "#888", cursor: "pointer" }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Renders / 7d", value: "4,106", trend: "+18%", trendColor: "#00e87b" },
          { label: "p50 latency",  value: "241ms", trend: "-12ms", trendColor: "#00e87b" },
          { label: "p95 latency",  value: "612ms", trend: "+34ms", trendColor: "#ffb000" },
          { label: "Error rate",   value: "0.62%", trend: "-0.18%", trendColor: "#00e87b" },
        ].map((m) => (
          <div key={m.label} style={cardStyle}>
            <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              {m.label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em" }}>{m.value}</span>
              <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: m.trendColor }}>{m.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Hourly distribution */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>Hourly distribution</div>
            <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444" }}>Average requests per hour of day · across selected window</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120 }}>
          {HOURLY.map((v, i) => {
            const height = (v / max) * 100
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div title={`${Math.round(v)} renders @ ${String(i).padStart(2, "0")}:00`}
                  style={{ width: "100%", height: `${height}%`, background: i >= 8 && i <= 18 ? "#00e87b" : "rgba(0,232,123,0.35)", borderRadius: "3px 3px 0 0", transition: "height 0.3s" }}
                />
              </div>
            )
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#444", marginTop: 8 }}>
          {["00", "04", "08", "12", "16", "20", "24"].map((h) => <span key={h}>{h}:00</span>)}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {/* Top domains */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>Top target domains</div>
            <Link href="/dashboard/logs" style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#00e87b", textDecoration: "none" }}>All logs →</Link>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                {["Host", "Requests", "p50", "p95", "Errors"].map((h) => (
                  <th key={h} style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", fontWeight: 500, textAlign: "left", padding: "0 12px 8px 0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_DOMAINS.map((d, i) => (
                <tr key={d.host} style={{ borderBottom: i < TOP_DOMAINS.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                  <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#f0f0f0", padding: "9px 12px 9px 0" }}>{d.host}</td>
                  <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#888", padding: "9px 12px 9px 0" }}>{d.requests.toLocaleString()}</td>
                  <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#888", padding: "9px 12px 9px 0" }}>{d.p50}ms</td>
                  <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#888", padding: "9px 12px 9px 0" }}>{d.p95}ms</td>
                  <td style={{ padding: "9px 0" }}>
                    <span style={tag(d.errors > 1 ? "yellow" : "green")}>{d.errors}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top errors */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>Top errors</div>
            <Link href="/dashboard/logs?status=err" style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#00e87b", textDecoration: "none" }}>See errors →</Link>
          </div>
          {TOP_ERRORS.map((e) => (
            <div key={e.code} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={tag(e.code >= 500 ? "red" : "yellow")}>{e.code}</span>
                  <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888" }}>{e.label}</span>
                </div>
                <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#888" }}>{e.count}</span>
              </div>
              <div style={{ height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${e.pct}%`, background: e.code >= 500 ? "#ff6060" : "#ffb000", borderRadius: 2 }} />
              </div>
            </div>
          ))}
          {TOP_ERRORS.length === 0 && (
            <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#444", padding: "20px 0", textAlign: "center" }}>
              No errors in window 🎉
            </div>
          )}
        </div>
      </div>

      <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444", textAlign: "right" }}>
        Updated 2 min ago · <Link href="/dashboard/logs" style={{ color: "#666" }}>raw logs</Link>
      </div>
    </div>
  )
}
