"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Copy, Check } from "lucide-react"

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
  method: "POST" | "GET" | "DELETE"
  path: string
  summary: string
  status: "live" | "beta" | "soon"
  request?: string
  response?: string
}

const ENDPOINTS: Endpoint[] = [
  {
    id: "screenshot",
    method: "POST",
    path: "/v1/screenshot",
    summary: "Render a URL to PNG/JPEG/WebP/PDF. The core endpoint.",
    status: "live",
    request: `{
  "url": "https://stripe.com",
  "format": "png",
  "width": 1440,
  "full_page": false,
  "remove_popups": true,
  "block_ads": false,
  "dark_mode": false,
  "device_scale_factor": 1
}`,
    response: `// Binary image stream — Content-Type: image/png
// Headers:
//   X-Render-Time: 241ms
//   X-Cache: MISS
//   X-Request-Id: req_2HNz3yKp`,
  },
  {
    id: "extract",
    method: "POST",
    path: "/v1/extract",
    summary: "Capture a URL AND extract structured data via LLM in one call. The wedge.",
    status: "beta",
    request: `{
  "url": "https://stripe.com/pricing",
  "schema": {
    "plans": [{
      "name": "string",
      "price_monthly": "number",
      "features": ["string"]
    }]
  }
}`,
    response: `{
  "screenshot_url": "https://shotbase-cdn.../req_...png",
  "data": { "plans": [...] },
  "took_ms": 1840
}`,
  },
  {
    id: "markdown",
    method: "POST",
    path: "/v1/markdown",
    summary: "Convert a URL to clean Markdown — ideal for RAG pipelines.",
    status: "soon",
    request: `{ "url": "https://stripe.com/blog/post" }`,
    response: `{ "markdown": "# Title\\n\\n...", "title": "...", "took_ms": 920 }`,
  },
  {
    id: "keys-create",
    method: "POST",
    path: "/v1/keys",
    summary: "Mint a new API key. Returns the secret once.",
    status: "live",
    request: `{ "name": "Production", "scopes": ["screenshot:write"] }`,
    response: `{ "id": "key_...", "key": "sk_prod_...", "created_at": "..." }`,
  },
  {
    id: "keys-list",
    method: "GET",
    path: "/v1/keys",
    summary: "List your keys (secrets masked).",
    status: "live",
  },
  {
    id: "keys-revoke",
    method: "DELETE",
    path: "/v1/keys/{id}",
    summary: "Permanently revoke a key.",
    status: "live",
  },
  {
    id: "usage",
    method: "GET",
    path: "/v1/usage",
    summary: "Current period: requests, plan, limit.",
    status: "live",
  },
  {
    id: "logs",
    method: "GET",
    path: "/v1/logs",
    summary: "Paginated request history with filtering.",
    status: "live",
  },
]

const STATUS_STYLE: Record<Endpoint["status"], React.CSSProperties> = {
  live: { background: "rgba(0,232,123,0.1)", color: "#00e87b", border: "1px solid rgba(0,232,123,0.25)" },
  beta: { background: "rgba(120,140,255,0.08)", color: "#8a9eff", border: "1px solid rgba(120,140,255,0.25)" },
  soon: { background: "#1a1a24", color: "#666", border: `1px solid ${BORDER}` },
}

const METHOD_COLOR: Record<Endpoint["method"], string> = {
  POST: "#00e87b",
  GET: "#8a9eff",
  DELETE: "#ff6060",
}

export default function ApiExplorerPage() {
  const [selectedId, setSelectedId] = useState<string>("screenshot")
  const [copiedBlock, setCopiedBlock] = useState<"request" | "response" | null>(null)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selected = ENDPOINTS.find((e) => e.id === selectedId) ?? ENDPOINTS[0]

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  const resetCopyState = () => {
    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current)
      copyTimerRef.current = null
    }
    setCopiedBlock(null)
  }

  const handleSelectEndpoint = (id: string) => {
    resetCopyState()
    setSelectedId(id)
  }

  const handleCopy = (text: string, block: "request" | "response") => {
    resetCopyState()
    navigator.clipboard.writeText(text).then(() => {
      setCopiedBlock(block)
      copyTimerRef.current = setTimeout(() => {
        setCopiedBlock(null)
        copyTimerRef.current = null
      }, 2000)
    }).catch(() => {})
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>API Explorer</h1>
          <p style={{ color: "#888", fontSize: 13 }}>
            Browse and try every Shotbase endpoint in-product. Full reference at <Link href="/docs" style={{ color: "#00e87b", textDecoration: "none" }}>/docs</Link>.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
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
                  type="button"
                  onClick={() => handleSelectEndpoint(e.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    width: "100%",
                    background: active ? ACTIVE_BG : "transparent",
                    border: `1px solid ${active ? ACTIVE_BORDER : "transparent"}`,
                    borderRadius: 6,
                    padding: "8px 10px",
                    cursor: "pointer",
                    color: "inherit",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 9, fontWeight: 700, color: METHOD_COLOR[e.method], minWidth: 38 }}>
                      {e.method}
                    </span>
                    <code style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: active ? "#f0f0f0" : "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.path}
                    </code>
                  </div>
                  {e.status !== "live" && (
                    <span style={{ ...STATUS_STYLE[e.status], fontFamily: "var(--font-ibm-plex)", fontSize: 8, padding: "1px 5px", borderRadius: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>
                      {e.status}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, fontWeight: 700, color: METHOD_COLOR[selected.method], padding: "3px 10px", background: "#111", borderRadius: 5 }}>
              {selected.method}
            </span>
            <code style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 14, color: "#f0f0f0", fontWeight: 500 }}>
              {selected.path}
            </code>
            <span style={{ ...STATUS_STYLE[selected.status], fontFamily: "var(--font-ibm-plex)", fontSize: 9, padding: "2px 7px", borderRadius: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {selected.status}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 18 }}>{selected.summary}</p>

          {selected.request && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                Request body
              </div>
              <div style={{ position: "relative" }}>
                <pre style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, background: "#050505", border: `1px solid ${BORDER}`, padding: "12px 64px 12px 12px", borderRadius: 7, color: "#888", margin: 0, overflow: "auto", lineHeight: 1.6 }}>
                  {selected.request}
                </pre>
                <div aria-live="polite" style={{ position: "absolute", top: 8, right: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleCopy(selected.request!, "request")}
                    aria-label="Copy request body"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontFamily: "var(--font-ibm-plex)",
                      fontSize: 11,
                      color: copiedBlock === "request" ? "#00e87b" : "#888",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: `1px solid ${copiedBlock === "request" ? "rgba(0, 232, 123, 0.3)" : BORDER}`,
                      padding: "4px 8px",
                      borderRadius: 5,
                      cursor: "pointer",
                    }}
                  >
                    {copiedBlock === "request" ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedBlock === "request" ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {selected.response && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                Response
              </div>
              <div style={{ position: "relative" }}>
                <pre style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, background: "#050505", border: `1px solid ${BORDER}`, padding: "12px 64px 12px 12px", borderRadius: 7, color: "#888", margin: 0, overflow: "auto", lineHeight: 1.6 }}>
                  {selected.response}
                </pre>
                <div aria-live="polite" style={{ position: "absolute", top: 8, right: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleCopy(selected.response!, "response")}
                    aria-label="Copy response body"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontFamily: "var(--font-ibm-plex)",
                      fontSize: 11,
                      color: copiedBlock === "response" ? "#00e87b" : "#888",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: `1px solid ${copiedBlock === "response" ? "rgba(0, 232, 123, 0.3)" : BORDER}`,
                      padding: "4px 8px",
                      borderRadius: 5,
                      cursor: "pointer",
                    }}
                  >
                    {copiedBlock === "response" ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedBlock === "response" ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
            {selected.id === "screenshot" && (
              <Link
                href="/dashboard/playground"
                style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, fontWeight: 600, color: "#000", background: "#00e87b", border: "none", padding: "8px 16px", borderRadius: 7, textDecoration: "none" }}
              >
                ▶ Try in Playground
              </Link>
            )}
            <Link
              href="/docs"
              style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888", background: "transparent", border: `1px solid ${BORDER}`, padding: "8px 16px", borderRadius: 7, textDecoration: "none" }}
            >
              Full reference →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
