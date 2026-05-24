"use client"

import React, { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"

const CHART_DATA = [12, 28, 19, 44, 61, 38, 72, 55, 90, 78, 103, 88, 120, 98, 134, 115, 142, 128, 160, 145, 172, 158, 188, 174]

const cardStyle: React.CSSProperties = {
  background: "#0a0a0a",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 10,
  padding: 24,
}

const metricCard: React.CSSProperties = {
  background: "#0a0a0a",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 10,
  padding: "20px 24px",
}

function MiniChart() {
  const max = Math.max(...CHART_DATA)
  const w = 480
  const h = 80
  const pts = CHART_DATA.map((v, i) => {
    const x = (i / (CHART_DATA.length - 1)) * w
    const y = h - (v / max) * (h - 8)
    return `${x},${y}`
  }).join(" ")
  const area = `0,${h} ${pts} ${w},${h}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 80 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00e87b" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00e87b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#cg)" />
      <polyline points={pts} fill="none" stroke="#00e87b" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function tag(status: number): React.CSSProperties {
  const ok = status === 200
  return {
    display: "inline-flex",
    alignItems: "center",
    fontFamily: "var(--font-ibm-plex)",
    fontSize: 11,
    padding: "2px 8px",
    borderRadius: 4,
    background: ok ? "rgba(0,232,123,0.1)" : "rgba(255,60,60,0.1)",
    color: ok ? "#00e87b" : "#ff6060",
    border: `1px solid ${ok ? "rgba(0,232,123,0.2)" : "rgba(255,60,60,0.2)"}`,
  }
}

export default function OverviewPage() {
  const { user } = useUser()
  const [usage, setUsage] = useState({ count: 0, plan: "Free", limit: 10000 })
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/usage").then((r) => r.json()).catch(() => null),
      fetch("/api/logs").then((r) => r.json()).catch(() => null),
    ]).then(([u, l]) => {
      if (u) setUsage({ count: u.count || 0, plan: u.plan || "Free", limit: u.limit || 10000 })
      if (l && l.logs) setLogs(l.logs)
      setLoading(false)
    })
  }, [])

  const isEmpty = !loading && usage.count === 0 && logs.length === 0

  // -------- Empty state (first-run) --------
  if (isEmpty) {
    return (
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 4 }}>
          Welcome to Shotbase{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p style={{ color: "#888", fontSize: 13, marginBottom: 28 }}>
          Get your first screenshot in 60 seconds. Drop the snippet below into a terminal — your account is already authorized.
        </p>

        <div style={{ ...cardStyle, marginBottom: 16, border: "1px solid rgba(0,232,123,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#00e87b", background: "rgba(0,232,123,0.1)", padding: "3px 8px", borderRadius: 4, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Step 1</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Make your first call</span>
            </div>
            <a href="/playground" style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#00e87b", textDecoration: "none" }}>Try in Playground →</a>
          </div>
          <pre style={{ background: "#050505", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: 14, fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888", overflow: "auto", margin: 0 }}>
{`curl -X POST 'https://api.shotbase.dev/v1/screenshot' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{"url": "https://stripe.com"}' \\
  --output screenshot.png`}
          </pre>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <a href="/dashboard/keys" style={{ ...cardStyle, textDecoration: "none", color: "inherit", display: "block", transition: "border-color 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,232,123,0.25)" }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)" }}>
            <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>Step 2</div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Generate an API key →</div>
            <div style={{ fontSize: 12, color: "#888" }}>Replace YOUR_API_KEY in the snippet with a real one.</div>
          </a>
          <a href="/dashboard/integrations" style={{ ...cardStyle, textDecoration: "none", color: "inherit", display: "block", transition: "border-color 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,232,123,0.25)" }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)" }}>
            <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>Step 3</div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Plug into your stack →</div>
            <div style={{ fontSize: 12, color: "#888" }}>LangChain · Vercel AI SDK · Stagehand · MCP · n8n.</div>
          </a>
        </div>
      </div>
    )
  }

  // -------- Normal state --------
  const metrics = [
    { label: "Screenshots this month", value: usage.count.toLocaleString(), sub: `${usage.plan} plan · ${usage.limit.toLocaleString()} included` },
    { label: "Avg response time", value: "241ms", sub: "p50 across all renders" },
    { label: "Cache hit rate", value: "64%", sub: "sub-200ms served from edge" },
    { label: "Success rate", value: "99.4%", sub: "of the last 30 days" },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>Overview</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>
        Current period · <span style={{ color: "#f0f0f0" }}>{usage.plan} plan</span> · {user?.emailAddresses?.[0]?.emailAddress}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 20 }}>
        {metrics.map((m) => (
          <div key={m.label} style={metricCard}>
            <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              {m.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 6 }}>{m.value}</div>
            <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444" }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>Request volume</div>
            <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444" }}>Last 24 hours · hourly</div>
          </div>
        </div>
        <MiniChart />
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#444", marginTop: 8 }}>
          {["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontWeight: 500, fontSize: 14 }}>Recent requests</div>
          <a href="/dashboard/logs" style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#00e87b", textDecoration: "none" }}>View all →</a>
        </div>
        {logs.length === 0 ? (
          <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#444", padding: "16px 0" }}>No requests yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Request ID", "URL", "Status", "Time", "Format", "When"].map((h) => (
                  <th key={h} style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", fontWeight: 500, textAlign: "left", padding: "0 16px 10px 0" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 5).map((r: any, i: number) => (
                <tr key={r.id} style={{ borderBottom: i < Math.min(5, logs.length) - 1 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                  <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#00e87b", padding: "11px 16px 11px 0", whiteSpace: "nowrap" }}>{r.id}</td>
                  <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#888", padding: "11px 16px 11px 0", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.url}</td>
                  <td style={{ padding: "11px 16px 11px 0" }}><span style={tag(r.status)}>{r.status}</span></td>
                  <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#888", padding: "11px 16px 11px 0", whiteSpace: "nowrap" }}>{r.ms ? `${r.ms}ms` : "—"}</td>
                  <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#888", padding: "11px 16px 11px 0" }}>{r.format || "—"}</td>
                  <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444", padding: "11px 0", whiteSpace: "nowrap" }}>{r.ts || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
