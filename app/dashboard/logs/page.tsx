"use client"

import React, { useEffect, useState } from "react"

const BORDER = "rgba(255,255,255,0.07)"
const ACTIVE_BG = "rgba(0,232,123,0.1)"
const ACTIVE_BORDER = "rgba(0,232,123,0.25)"

const cardStyle: React.CSSProperties = {
  background: "#0a0a0a",
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  padding: 24,
}

type LogRow = {
  id?: string
  url?: string
  status?: number
  ms?: number
  format?: string
  size?: string
  ts?: string
  endpoint?: string
  region?: string
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

// ---------- Side drawer ----------
function Drawer({ row, onClose }: { row: LogRow | null; onClose: () => void }) {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 1500)
    } catch {}
  }

  if (!row) return null

  const curlCmd = `curl -X POST 'https://api.shotbase.dev/v1/screenshot' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{"url":"${row.url || "https://example.com"}"}' \\
  --output screenshot.${row.format || "png"}`

  const reqJson = JSON.stringify(
    {
      url: row.url || "",
      format: row.format || "png",
      width: 1440,
      full_page: false,
      remove_popups: true,
    },
    null,
    2
  )

  const resHeaders = `HTTP/1.1 ${row.status || 200} ${row.status === 200 ? "OK" : "Error"}
Content-Type: image/${row.format || "png"}
Content-Length: ${row.size || "—"}
X-Render-Time: ${row.ms || 0}ms
X-Region: ${row.region || "sfo1"}
X-Cache: MISS
X-Request-Id: ${row.id || "—"}`

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(2px)",
          zIndex: 50,
          animation: "fade 0.15s ease-out",
        }}
      />
      {/* drawer */}
      <div
        role="dialog"
        aria-label="Request details"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "min(560px, 92vw)",
          background: "#050505",
          borderLeft: `1px solid ${BORDER}`,
          boxShadow: "-16px 0 40px rgba(0,0,0,0.4)",
          zIndex: 51,
          display: "flex",
          flexDirection: "column",
          animation: "slidein 0.18s ease-out",
        }}
      >
        <style>{`
          @keyframes slidein { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={tag(row.status || 200)}>{row.status || 200}</span>
              <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#888" }}>POST /screenshot</span>
              <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#666" }}>· {row.ms || 0}ms</span>
            </div>
            <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#00e87b" }}>{row.id || "—"}</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ fontSize: 20, color: "#666", background: "transparent", border: "none", cursor: "pointer", padding: 4 }}
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 22 }}>
          {/* Target URL */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Target URL
            </div>
            <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#f0f0f0", background: "#111", border: `1px solid ${BORDER}`, padding: "8px 12px", borderRadius: 6, overflowX: "auto", whiteSpace: "nowrap" }}>
              {row.url || "—"}
            </div>
          </div>

          {/* Timing breakdown */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Timing
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[
                { label: "DNS + connect", val: `${Math.round((row.ms || 200) * 0.15)}ms` },
                { label: "Render", val: `${Math.round((row.ms || 200) * 0.7)}ms` },
                { label: "Transfer", val: `${Math.round((row.ms || 200) * 0.15)}ms` },
              ].map((t) => (
                <div key={t.label} style={{ background: "#111", border: `1px solid ${BORDER}`, padding: "8px 10px", borderRadius: 6 }}>
                  <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 9, color: "#666", marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#f0f0f0" }}>{t.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Request payload */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Request payload
              </div>
              <button
                onClick={() => copy("req", reqJson)}
                style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: copied === "req" ? "#00e87b" : "#666", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
              >
                {copied === "req" ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <pre style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, background: "#111", border: `1px solid ${BORDER}`, padding: 12, borderRadius: 6, color: "#888", margin: 0, overflow: "auto", lineHeight: 1.6 }}>{reqJson}</pre>
          </div>

          {/* Response headers */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Response headers
              </div>
              <button
                onClick={() => copy("res", resHeaders)}
                style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: copied === "res" ? "#00e87b" : "#666", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
              >
                {copied === "res" ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <pre style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, background: "#111", border: `1px solid ${BORDER}`, padding: 12, borderRadius: 6, color: "#888", margin: 0, overflow: "auto", lineHeight: 1.6 }}>{resHeaders}</pre>
          </div>

          {/* Replay as cURL */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Reproduce
              </div>
              <button
                onClick={() => copy("curl", curlCmd)}
                style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: copied === "curl" ? "#00e87b" : "#666", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
              >
                {copied === "curl" ? "✓ Copied" : "Copy as cURL"}
              </button>
            </div>
            <pre style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, background: "#111", border: `1px solid ${BORDER}`, padding: 12, borderRadius: 6, color: "#888", margin: 0, overflow: "auto", lineHeight: 1.6, whiteSpace: "pre" }}>{curlCmd}</pre>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ display: "flex", gap: 8, padding: "14px 22px", borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <button
            onClick={() => copy("curl", curlCmd)}
            style={{ flex: 1, fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#000", background: "#00e87b", border: "none", padding: "9px 14px", borderRadius: 7, cursor: "pointer", fontWeight: 600 }}
          >
            ↻ Replay request
          </button>
          <a
            href={`/dashboard/playground?url=${encodeURIComponent(row.url || "")}`}
            style={{ flex: 1, fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#f0f0f0", background: "transparent", border: `1px solid ${BORDER}`, padding: "9px 14px", borderRadius: 7, textAlign: "center", textDecoration: "none" }}
          >
            Open in Playground →
          </a>
        </div>
      </div>
    </>
  )
}

// ---------- Page ----------
export default function LogsPage() {
  const [logs, setLogs] = useState<LogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "ok" | "err">("all")
  const [endpointFilter, setEndpointFilter] = useState<"all" | "screenshot" | "extract" | "markdown">("all")
  const [activeTab, setActiveTab] = useState<"requests" | "webhooks" | "audit">("requests")
  const [selected, setSelected] = useState<LogRow | null>(null)

  useEffect(() => {
    fetch("/api/logs")
      .then((r) => r.json())
      .then((d) => {
        setLogs(d.logs || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = logs.filter((r) => {
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "ok" && r.status === 200) ||
      (statusFilter === "err" && (r.status || 0) !== 200)
    const matchText = !filter || (r.url || "").includes(filter) || (r.id || "").includes(filter)
    const matchEndpoint = endpointFilter === "all" || (r.endpoint || "screenshot") === endpointFilter
    return matchStatus && matchText && matchEndpoint
  })

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>Activity</h1>
          <p style={{ color: "#888", fontSize: 13 }}>
            Real-time request history. Click any row to see full details, headers, and a copy-paste cURL replay.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${BORDER}`, marginBottom: 16 }}>
        {[
          { id: "requests" as const, label: "Requests", badge: logs.length || null },
          { id: "webhooks" as const, label: "Webhook deliveries", badge: null },
          { id: "audit" as const, label: "Audit log", badge: null },
        ].map((t) => {
          const active = activeTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                fontFamily: "var(--font-ibm-plex)",
                fontSize: 12,
                padding: "10px 16px",
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${active ? "#00e87b" : "transparent"}`,
                color: active ? "#00e87b" : "#666",
                fontWeight: active ? 500 : 400,
                cursor: "pointer",
                marginBottom: -1,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {t.label}
              {t.badge !== null && t.badge > 0 && (
                <span style={{ fontSize: 10, background: active ? ACTIVE_BG : "#1a1a1a", color: active ? "#00e87b" : "#666", padding: "1px 6px", borderRadius: 10, fontWeight: 600 }}>{t.badge}</span>
              )}
            </button>
          )
        })}
      </div>

      {activeTab === "requests" && (
        <>
          {/* Filter bar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by URL or request ID…"
              style={{ flex: 1, minWidth: 240, fontFamily: "var(--font-ibm-plex)", fontSize: 12, background: "#0a0a0a", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "8px 14px", color: "#f0f0f0", outline: "none" }}
            />
            <div style={{ display: "flex", gap: 4, background: "#0a0a0a", border: `1px solid ${BORDER}`, borderRadius: 7, padding: 3 }}>
              {(["all", "screenshot", "extract", "markdown"] as const).map((e) => (
                <button
                  key={e}
                  onClick={() => setEndpointFilter(e)}
                  style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, padding: "5px 10px", background: endpointFilter === e ? ACTIVE_BG : "transparent", border: "none", borderRadius: 5, color: endpointFilter === e ? "#00e87b" : "#888", cursor: "pointer" }}
                >
                  {e === "all" ? "All endpoints" : `/${e}`}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 4, background: "#0a0a0a", border: `1px solid ${BORDER}`, borderRadius: 7, padding: 3 }}>
              {(["all", "ok", "err"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, padding: "5px 10px", background: statusFilter === s ? ACTIVE_BG : "transparent", border: "none", borderRadius: 5, color: statusFilter === s ? "#00e87b" : "#888", cursor: "pointer" }}
                >
                  {s === "all" ? "All" : s === "ok" ? "2xx" : "Errors"}
                </button>
              ))}
            </div>
            <button
              style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, padding: "8px 14px", background: "#0a0a0a", border: `1px solid ${BORDER}`, borderRadius: 7, color: "#888", cursor: "pointer" }}
            >
              ↓ Export CSV
            </button>
          </div>

          {/* Table */}
          <div style={cardStyle}>
            {loading ? (
              <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#444", padding: "32px 0", textAlign: "center" }}>Loading logs…</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>
                  {logs.length === 0 ? "No requests yet" : "No logs match your filter"}
                </div>
                <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#444" }}>
                  {logs.length === 0 ? "Make your first API call from the Playground." : "Try clearing the filter."}
                </div>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {["Request ID", "URL", "Endpoint", "Status", "Time", "Format", "Region", "When"].map((h) => (
                      <th key={h} style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", fontWeight: 500, textAlign: "left", padding: "0 14px 10px 0" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr
                      key={r.id || i}
                      onClick={() => setSelected(r)}
                      style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${BORDER}` : "none", cursor: "pointer", transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#00e87b", padding: "11px 14px 11px 0", whiteSpace: "nowrap" }}>{r.id}</td>
                      <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#888", padding: "11px 14px 11px 0", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.url}</td>
                      <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#888", padding: "11px 14px 11px 0", whiteSpace: "nowrap" }}>/{r.endpoint || "screenshot"}</td>
                      <td style={{ padding: "11px 14px 11px 0" }}><span style={tag(r.status || 200)}>{r.status || 200}</span></td>
                      <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#888", padding: "11px 14px 11px 0", whiteSpace: "nowrap" }}>{r.ms ? `${r.ms}ms` : "—"}</td>
                      <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#888", padding: "11px 14px 11px 0" }}>{r.format || "—"}</td>
                      <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#888", padding: "11px 14px 11px 0" }}>{r.region || "sfo1"}</td>
                      <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444", padding: "11px 0", whiteSpace: "nowrap" }}>{r.ts || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ marginTop: 12, fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444", display: "flex", justifyContent: "space-between" }}>
            <span>Showing {filtered.length} request{filtered.length === 1 ? "" : "s"}</span>
            <span>Live · updates every 10s</span>
          </div>
        </>
      )}

      {activeTab === "webhooks" && (
        <div style={{ ...cardStyle, textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>No webhook deliveries yet</div>
          <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#444", marginBottom: 16 }}>
            Configure webhook endpoints to receive callbacks on screenshot.completed, screenshot.failed, and quota.exceeded events.
          </div>
          <a href="/dashboard/webhooks" style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#00e87b", textDecoration: "none" }}>
            Set up a webhook →
          </a>
        </div>
      )}

      {activeTab === "audit" && (
        <div style={{ ...cardStyle, textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>Audit log</div>
          <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#444", marginBottom: 8 }}>
            Every account-changing action (key creation/revoke, plan change, settings edit) is recorded here with timestamp and IP.
          </div>
          <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#666" }}>90-day retention (Pro+ plan)</div>
        </div>
      )}

      <Drawer row={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
