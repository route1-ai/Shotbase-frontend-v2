"use client"

import React, { useEffect, useState } from "react"

const cardStyle: React.CSSProperties = {
  background: "#0a0a0a",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 10,
  padding: 24,
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

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "ok" | "err">("all")

  useEffect(() => {
    fetch("/api/logs")
      .then((r) => r.json())
      .then((d) => {
        setLogs(d.logs || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = logs.filter((r: any) => {
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "ok" && r.status === 200) ||
      (statusFilter === "err" && r.status !== 200)
    const matchText = !filter || (r.url || "").includes(filter) || (r.id || "").includes(filter)
    return matchStatus && matchText
  })

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>Request Logs</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 22 }}>
        Real-time request history. 30-day retention on Pro plan.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by URL or request ID…"
          style={{ flex: 1, fontFamily: "var(--font-ibm-plex)", fontSize: 12, background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, padding: "9px 14px", color: "#f0f0f0", outline: "none" }}
        />
        {(["all", "ok", "err"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, padding: "8px 14px", background: statusFilter === s ? "rgba(0,232,123,0.1)" : "#0a0a0a", border: `1px solid ${statusFilter === s ? "rgba(0,232,123,0.25)" : "rgba(255,255,255,0.07)"}`, borderRadius: 7, color: statusFilter === s ? "#00e87b" : "#888", cursor: "pointer", transition: "all 0.15s" }}
          >
            {s === "all" ? "All" : s === "ok" ? "2xx" : "Errors"}
          </button>
        ))}
        <button
          style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, padding: "8px 14px", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, color: "#888", cursor: "pointer" }}
        >
          ↓ Export CSV
        </button>
      </div>

      <div style={cardStyle}>
        {loading ? (
          <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#444", padding: "32px 0", textAlign: "center" }}>Loading logs…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#444" }}>
            {logs.length === 0 ? "No requests yet." : "No logs match your filter."}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Request ID", "URL", "Status", "Time", "Format", "Size", "When"].map((h) => (
                  <th key={h} style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", fontWeight: 500, textAlign: "left", padding: "0 16px 10px 0" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: any, i: number) => (
                <tr key={r.id || i} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                  <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#00e87b", padding: "11px 16px 11px 0", whiteSpace: "nowrap" }}>{r.id}</td>
                  <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#888", padding: "11px 16px 11px 0", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.url}</td>
                  <td style={{ padding: "11px 16px 11px 0" }}><span style={tag(r.status)}>{r.status}</span></td>
                  <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#888", padding: "11px 16px 11px 0", whiteSpace: "nowrap" }}>{r.ms ? `${r.ms}ms` : "—"}</td>
                  <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#888", padding: "11px 16px 11px 0" }}>{r.format || "—"}</td>
                  <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#888", padding: "11px 16px 11px 0" }}>{r.size || "—"}</td>
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
    </div>
  )
}
