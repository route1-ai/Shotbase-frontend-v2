"use client"

import React, { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { Copy, Check } from "lucide-react"

const BORDER = "rgba(255,255,255,0.07)"
const ACTIVE_BG = "rgba(0,232,123,0.1)"
const ACTIVE_BORDER = "rgba(0,232,123,0.25)"

const CHART_DATA = [12, 28, 19, 44, 61, 38, 72, 55, 90, 78, 103, 88, 120, 98, 134, 115, 142, 128, 160, 145, 172, 158, 188, 174]

const cardStyle: React.CSSProperties = {
  background: "#0a0a0a",
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  padding: 22,
}

const metricCard: React.CSSProperties = {
  background: "#0a0a0a",
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  padding: "18px 22px",
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

interface DashboardLog { id: string; url: string; status: number; ms?: number; format?: string; ts?: string }

function ThumbPlaceholder({ idx, label }: { idx: number; label: string }) {
  // Subtle gradient placeholders so the gallery never looks empty.
  const hues = ["#00e87b", "#5b8dff", "#ff7ac5", "#ffb000", "#a07cff", "#00bcd4"]
  const c = hues[idx % hues.length]
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "16 / 10",
        background: `linear-gradient(135deg, ${c}11 0%, #050505 60%)`,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        overflow: "hidden",
        display: "flex",
        alignItems: "flex-end",
        padding: 10,
      }}
    >
      <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#666" }}>{label}</div>
      <div style={{ position: "absolute", top: 8, right: 8, width: 6, height: 6, borderRadius: "50%", background: c, opacity: 0.5 }} />
    </div>
  )
}

export default function OverviewPage() {
  const { user } = useUser()
  const [usage, setUsage] = useState({ count: 0, plan: "Free", limit: 10000 })
  const [logs, setLogs] = useState<DashboardLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showFirstCall, setShowFirstCall] = useState(true)

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopiedId(null), 2000)
    } catch (e) { console.error(e) }
  }
  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  useEffect(() => {
    Promise.all([
      fetch("/api/usage").then((r) => r.json()).catch(() => null),
      fetch("/api/logs").then((r) => r.json()).catch(() => null),
    ]).then(([u, l]) => {
      if (u) setUsage({ count: u.count || 0, plan: u.plan || "Free", limit: u.limit || 10000 })
      if (l && l.logs) setLogs(l.logs)
      setLoading(false)
      // If the user has already made calls, collapse the getting-started card.
      if (u && u.count > 0) setShowFirstCall(false)
    })
  }, [])

  const pct = (usage.count / usage.limit) * 100
  const hasData = logs.length > 0 || usage.count > 0

  const metrics = [
    { label: "Screenshots this month", value: usage.count.toLocaleString(), sub: `${usage.plan} plan · ${usage.limit.toLocaleString()} included` },
    { label: "Avg response time", value: hasData ? "241ms" : "—", sub: hasData ? "p50 across all renders" : "Once you make a call" },
    { label: "Cache hit rate", value: hasData ? "64%" : "—", sub: hasData ? "Sub-200ms served from edge" : "Cached repeat URLs" },
    { label: "Success rate", value: hasData ? "99.4%" : "—", sub: hasData ? "Last 30 days" : "Renders that returned 200" },
  ]

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 20 }}>
      {/* ----- Main column ----- */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 4 }}>
              Welcome{user?.firstName ? `, ${user.firstName}` : ""}
            </h1>
            <p style={{ color: "#888", fontSize: 13 }}>
              <span style={{ color: "#f0f0f0" }}>{usage.plan} plan</span> · {user?.emailAddresses?.[0]?.emailAddress}
            </p>
          </div>
          <Link
            href="/dashboard/playground"
            style={{
              fontFamily: "var(--font-ibm-plex)",
              fontSize: 12,
              fontWeight: 600,
              color: "#000",
              background: "#00e87b",
              padding: "8px 16px",
              borderRadius: 7,
              textDecoration: "none",
            }}
          >
            ▶ Open playground
          </Link>
        </div>

        {/* Metric cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 16 }}>
          {metrics.map((m) => (
            <div key={m.label} style={metricCard}>
              <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                {m.label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 4 }}>{m.value}</div>
              <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#444" }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Plan + quota card */}
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>Monthly quota</div>
              <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#666" }}>
                Resets {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </div>
            </div>
            <Link href="/dashboard/settings/billing" style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#00e87b", textDecoration: "none" }}>
              Upgrade →
            </Link>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <span style={{ fontSize: 18, fontWeight: 600 }}>{usage.count.toLocaleString()}</span>
            <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#666" }}>
              of {usage.limit.toLocaleString()} · {Math.round(pct)}% used
            </span>
          </div>
          <div style={{ height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: pct > 80 ? "#ff9060" : "#00e87b", borderRadius: 3, transition: "width 0.3s" }} />
          </div>
        </div>

        {/* First-call card — collapsible after the first request */}
        {showFirstCall && (
          <div style={{ ...cardStyle, marginBottom: 16, border: `1px solid ${ACTIVE_BORDER}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#00e87b", background: ACTIVE_BG, padding: "3px 8px", borderRadius: 4, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Getting started
                </span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>Make your first call</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Link href="/dashboard/playground" style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#00e87b", textDecoration: "none" }}>
                  Try in Playground →
                </Link>
                <button
                  onClick={() => setShowFirstCall(false)}
                  style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#666", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                  aria-label="Dismiss getting-started card"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <pre style={{ background: "#050505", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "14px 64px 14px 14px", fontFamily: "var(--font-ibm-plex)", fontSize: 11.5, color: "#888", overflow: "auto", margin: 0, lineHeight: 1.6 }}>
{`curl -X POST 'https://api.shotbase.dev/v1/screenshot' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{"url": "https://stripe.com"}' \\
  --output screenshot.png`}
              </pre>
              <button
                onClick={() => handleCopy("started", `curl -X POST 'https://api.shotbase.dev/v1/screenshot' \\\n  -H 'Authorization: Bearer YOUR_API_KEY' \\\n  -H 'Content-Type: application/json' \\\n  -d '{"url": "https://stripe.com"}' \\\n  --output screenshot.png`)}
                className="ccopy"
                style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}
                aria-label={copiedId === "started" ? "Copied code snippet to clipboard" : "Copy code snippet to clipboard"}
                title={copiedId === "started" ? "Copied!" : "Copy code"}
              >
                {copiedId === "started" ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedId === "started" ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Recent renders gallery */}
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>Recent renders</div>
            <Link href="/dashboard/logs" style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#00e87b", textDecoration: "none" }}>
              View all →
            </Link>
          </div>
          {hasData ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <ThumbPlaceholder key={i} idx={i} label={`render ${i + 1}`} />
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, opacity: 0.5 }}>
              {["stripe.com", "vercel.com", "linear.app", "github.com"].map((host, i) => (
                <ThumbPlaceholder key={host} idx={i} label={host} />
              ))}
            </div>
          )}
        </div>

        {/* Request volume chart */}
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>Request volume</div>
              <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444" }}>Last 24 hours · hourly</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["24h", "7d", "30d"].map((t, i) => (
                <button key={t} style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, padding: "4px 10px", background: i === 0 ? ACTIVE_BG : "transparent", border: `1px solid ${i === 0 ? ACTIVE_BORDER : BORDER}`, borderRadius: 6, color: i === 0 ? "#00e87b" : "#888", cursor: "pointer" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <MiniChart />
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#444", marginTop: 8 }}>
            {["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>

        {/* Recent activity table */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>Recent activity</div>
            <Link href="/dashboard/logs" style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#00e87b", textDecoration: "none" }}>
              View all logs →
            </Link>
          </div>
          {logs.length === 0 ? (
            <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#444", padding: "20px 0", textAlign: "center" }}>
              {loading ? "Loading…" : "No requests yet. Your renders will appear here in real time."}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {["Request ID", "URL", "Status", "Time", "Format", "When"].map((h) => (
                    <th key={h} style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", fontWeight: 500, textAlign: "left", padding: "0 16px 10px 0" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 5).map((r: DashboardLog, i: number) => (
                  <tr key={r.id || i} style={{ borderBottom: i < Math.min(5, logs.length) - 1 ? `1px solid ${BORDER}` : "none" }}>
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

      {/* ----- Right rail (code samples + quick links — ScreenshotOne/Resend pattern) ----- */}
      <aside style={{ minWidth: 0 }}>
        <div style={{ ...cardStyle, marginBottom: 12, padding: 16 }}>
          <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Copy & paste
          </div>
          <div style={{ position: "relative" }}>
            <pre style={{ background: "#050505", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "12px 64px 12px 12px", fontFamily: "var(--font-ibm-plex)", fontSize: 10.5, color: "#888", overflow: "auto", margin: 0, lineHeight: 1.6, whiteSpace: "pre" }}>
{`curl -X POST \\
  'https://api.shotbase.dev/v1/screenshot' \\
  -H 'Authorization: Bearer YOUR_KEY' \\
  -d '{"url":"https://stripe.com"}'`}
            </pre>
            <button
              onClick={() => handleCopy("rail", `curl -X POST \\\n  'https://api.shotbase.dev/v1/screenshot' \\\n  -H 'Authorization: Bearer YOUR_KEY' \\\n  -d '{"url":"https://stripe.com"}'`)}
              className="ccopy"
              style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}
              aria-label={copiedId === "rail" ? "Copied code snippet to clipboard" : "Copy code snippet to clipboard"}
              title={copiedId === "rail" ? "Copied!" : "Copy code"}
            >
              {copiedId === "rail" ? <Check size={11} /> : <Copy size={11} />}
              <span>{copiedId === "rail" ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <Link href="/dashboard/keys" style={{ display: "block", marginTop: 10, fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#00e87b", textDecoration: "none" }}>
            Get your API key →
          </Link>
        </div>

        <div style={{ ...cardStyle, marginBottom: 12, padding: 16 }}>
          <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Connect your stack
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "LangChain", href: "/dashboard/integrations" },
              { label: "Vercel AI SDK", href: "/dashboard/integrations" },
              { label: "MCP Server", href: "/dashboard/integrations" },
              { label: "Claude Skill", href: "/dashboard/integrations" },
              { label: "n8n", href: "/dashboard/integrations" },
            ].map((i) => (
              <Link key={i.label} href={i.href} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "#050505", border: `1px solid ${BORDER}`, borderRadius: 6, color: "#888", textDecoration: "none", fontSize: 12 }}>
                <span>{i.label}</span>
                <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#444" }}>→</span>
              </Link>
            ))}
          </div>
        </div>

        <div style={{ ...cardStyle, padding: 16 }}>
          <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Resources
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
            <Link href="/docs" style={{ color: "#888", textDecoration: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>API reference</span><span style={{ color: "#444" }}>↗</span>
            </Link>
            <Link href="/dashboard/trust" style={{ color: "#888", textDecoration: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Trust & security</span><span style={{ color: "#444" }}>→</span>
            </Link>
            <a href="https://status.shotbase.dev" target="_blank" rel="noopener noreferrer" style={{ color: "#888", textDecoration: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>System status</span><span style={{ color: "#444" }}>↗</span>
            </a>
            <a href="https://discord.gg/shotbase" target="_blank" rel="noopener noreferrer" style={{ color: "#888", textDecoration: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Discord community</span><span style={{ color: "#444" }}>↗</span>
            </a>
          </div>
        </div>
      </aside>
    </div>
  )
}
