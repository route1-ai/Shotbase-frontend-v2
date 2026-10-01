"use client"

import React, { useState } from "react"
import Link from "next/link"

const BORDER = "rgba(255,255,255,0.07)"
const ACTIVE_BG = "rgba(0,232,123,0.08)"
const ACTIVE_BORDER = "rgba(0,232,123,0.25)"

const cardStyle: React.CSSProperties = {
  background: "#0a0a0a",
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  padding: 22,
}

type Endpoint = {
  id: string
  method: "POST"
  path: string
  kind: "REST" | "MCP"
  docs: string
  summary: string
  request: string
  response: string
}

// Only endpoints a customer can genuinely call against the public API
// (api.shotbase.dev), verified against backend main route1-ai/shotbase.
// Key management, usage, and logs are INTERNAL dashboard routes, not a public
// API, so they are intentionally not listed here.
const BASE = "https://api.shotbase.dev"

const ENDPOINTS: Endpoint[] = [
  {
    id: "screenshot",
    method: "POST",
    path: "/screenshot",
    kind: "REST",
    docs: "/docs?s=screenshot",
    summary: "Render a URL to PNG/JPEG/WebP/PDF, with optional page text and structured (AI) extraction. The core endpoint.",
    request: `{
  "url": "https://stripe.com",
  "format": "png",          // png | jpeg | webp | pdf
  "width": 1440,
  "height": 900,
  "full_page": false,
  "include_text": false,     // set true to also return page text
  "ai_extract": {            // optional structured extraction
    "headings": true,
    "prices": true
  }
}`,
    response: `// Default: the binary image
//   Content-Type: image/png
//   X-Cache: HIT | MISS
//
// With include_text or ai_extract, the response is JSON:
{
  "format": "png",
  "cached": false,
  "render_time_ms": <number>,
  "text": "…extracted page text…",
  "ai_data": { "headings": [...], "prices": [...] }
}
// If only AI extraction fails, render + text still succeed:
//   "ai_data": null,
//   "ai_error": "AI extraction temporarily unavailable"`,
  },
  {
    id: "mcp",
    method: "POST",
    path: "/api/mcp",
    kind: "MCP",
    docs: "/docs?s=mcp",
    summary: "Model Context Protocol server (JSON-RPC 2.0) exposing the shotbase_capture tool to AI agents. Same API key as REST.",
    request: `POST ${BASE}/api/mcp
Authorization: Bearer sk_YOUR_KEY

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "shotbase_capture",
    "arguments": {
      "url": "https://stripe.com",
      "format": "png"
    }
  }
}`,
    response: `{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      { "type": "image", "mimeType": "image/png", "data": "<base64>" }
    ]
  }
}`,
  },
]

const KIND_STYLE: Record<Endpoint["kind"], React.CSSProperties> = {
  REST: { background: "rgba(0,232,123,0.1)", color: "#00e87b", border: "1px solid rgba(0,232,123,0.25)" },
  MCP: { background: "rgba(120,140,255,0.08)", color: "#8a9eff", border: "1px solid rgba(120,140,255,0.25)" },
}

export default function ApiExplorerPage() {
  const [selectedId, setSelectedId] = useState<string>("screenshot")
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const selected = ENDPOINTS.find((e) => e.id === selectedId) ?? ENDPOINTS[0]

  const copyToClipboard = async (field: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 1500)
    } catch {
      // Best-effort fallback if clipboard write is restricted
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>API Explorer</h1>
          <p style={{ color: "#888", fontSize: 13 }}>
            The public Shotbase API on <code style={{ fontFamily: "var(--font-ibm-plex)", color: "#aaa" }}>{BASE}</code>. Full reference in the <Link href="/docs" style={{ color: "#00e87b", textDecoration: "none" }}>docs</Link>.
          </p>
        </div>
      </div>

      {/* ≤820px (covers tablet 768, where the sidebar still occupies 240px):
          stack the endpoint list above the detail panel and let code blocks
          scroll internally instead of forcing horizontal overflow. */}
      <style>{`
        .apix-grid > * { min-width: 0; }
        .apix-grid pre { max-width: 100%; }
        @media (max-width: 820px) {
          .apix-grid { grid-template-columns: minmax(0, 1fr) !important; }
        }
      `}</style>
      <div className="apix-grid" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
        {/* Endpoint list */}
        <div style={cardStyle}>
          <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Endpoints
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {ENDPOINTS.map((e) => {
              const active = e.id === selectedId
              return (
                <button
                  key={e.id}
                  onClick={() => {
                    setSelectedId(e.id)
                    setCopiedField(null)
                  }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, width: "100%", background: active ? ACTIVE_BG : "transparent", border: `1px solid ${active ? ACTIVE_BORDER : "transparent"}`, borderRadius: 6, padding: "8px 10px", cursor: "pointer", color: "inherit", textAlign: "left" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 9, fontWeight: 700, color: "#00e87b", minWidth: 38 }}>{e.method}</span>
                    <code style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: active ? "#f0f0f0" : "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.path}</code>
                  </div>
                  <span style={{ ...KIND_STYLE[e.kind], fontFamily: "var(--font-ibm-plex)", fontSize: 8, padding: "1px 5px", borderRadius: 3, fontWeight: 600, letterSpacing: "0.05em", flexShrink: 0 }}>{e.kind}</span>
                </button>
              )
            })}
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${BORDER}`, fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#555", lineHeight: 1.6 }}>
            Managing keys, usage and logs happens in the dashboard — they are not part of the public API.
          </div>
        </div>

        {/* Detail panel */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, fontWeight: 700, color: "#00e87b", padding: "3px 10px", background: "#111", borderRadius: 5 }}>{selected.method}</span>
            <code style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 14, color: "#f0f0f0", fontWeight: 500 }}>{selected.path}</code>
            <span style={{ ...KIND_STYLE[selected.kind], fontFamily: "var(--font-ibm-plex)", fontSize: 9, padding: "2px 7px", borderRadius: 3, fontWeight: 600, letterSpacing: "0.05em" }}>{selected.kind}</span>
          </div>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 18 }}>{selected.summary}</p>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em" }}>Request</div>
              <button
                type="button"
                onClick={() => copyToClipboard("req", selected.request)}
                aria-label="Copy request payload"
                aria-live="polite"
                style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: copiedField === "req" ? "#00e87b" : "#888", background: "none", border: "none", cursor: "pointer", padding: "2px 6px" }}
              >
                {copiedField === "req" ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <pre style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, background: "#050505", border: `1px solid ${BORDER}`, padding: 12, borderRadius: 7, color: "#888", margin: 0, overflow: "auto", lineHeight: 1.6 }}>{selected.request}</pre>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em" }}>Response</div>
              <button
                type="button"
                onClick={() => copyToClipboard("res", selected.response)}
                aria-label="Copy response payload"
                aria-live="polite"
                style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: copiedField === "res" ? "#00e87b" : "#888", background: "none", border: "none", cursor: "pointer", padding: "2px 6px" }}
              >
                {copiedField === "res" ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <pre style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, background: "#050505", border: `1px solid ${BORDER}`, padding: 12, borderRadius: 7, color: "#888", margin: 0, overflow: "auto", lineHeight: 1.6 }}>{selected.response}</pre>
          </div>

          <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
            {selected.id === "screenshot" && (
              <Link href="/dashboard/playground" style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, fontWeight: 600, color: "#000", background: "#00e87b", border: "none", padding: "8px 16px", borderRadius: 7, textDecoration: "none" }}>
                ▶ Try in Playground
              </Link>
            )}
            <Link href={selected.docs} style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888", background: "transparent", border: `1px solid ${BORDER}`, padding: "8px 16px", borderRadius: 7, textDecoration: "none" }}>
              Full reference →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
