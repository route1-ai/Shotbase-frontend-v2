"use client"

import React from "react"

type Status = "available" | "soon"
type Integration = {
  name: string
  blurb: string
  install: string
  docs: string
  status: Status
  initial?: string
}

const INTEGRATIONS: Integration[] = [
  {
    name: "REST API",
    blurb: "Call the API directly from any language — curl, fetch, Python requests. Auth with your API key.",
    install: "POST https://api.shotbase.dev/screenshot",
    docs: "/docs",
    status: "available",
    initial: "{}",
  },
  {
    name: "MCP Server",
    blurb: "Connect any MCP-compatible agent (Claude Code, Cursor, Continue). Exposes the shotbase_capture tool.",
    install: 'claude mcp add --transport http shotbase https://api.shotbase.dev/api/mcp --header "Authorization: Bearer sk_..."',
    docs: "/docs",
    status: "available",
    initial: "M",
  },
]

function Card({ i }: { i: Integration }) {
  const [copied, setCopied] = React.useState(false)
  const [hover, setHover] = React.useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(i.install)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#0a0a0a",
        border: `1px solid ${hover ? "rgba(0,232,123,0.25)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "border-color 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, background: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-ibm-plex)", fontSize: 14, fontWeight: 600, color: "#00e87b", flexShrink: 0 }}>
          {i.initial || i.name.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{i.name}</span>
            {i.status === "soon" && (
              <span style={{ fontSize: 9, background: "#1a1a24", padding: "2px 6px", borderRadius: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Soon</span>
            )}
          </div>
        </div>
      </div>
      <p style={{ fontSize: 12, color: "#888", lineHeight: 1.5, margin: 0 }}>{i.blurb}</p>
      <div style={{ display: "flex", gap: 8 }}>
        <code
          onClick={copy}
          title="Click to copy"
          style={{
            flex: 1,
            fontFamily: "var(--font-ibm-plex)",
            fontSize: 11,
            background: "#050505",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 6,
            padding: "8px 12px",
            color: copied ? "#00e87b" : "#888",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            cursor: "pointer",
            transition: "color 0.15s",
          }}
        >
          {copied ? "✓ Copied" : i.install}
        </code>
        <a
          href={i.docs}
          style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#888", background: "transparent", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, padding: "8px 12px", textDecoration: "none", whiteSpace: "nowrap" }}
        >
          Docs ↗
        </a>
      </div>
    </div>
  )
}

export default function IntegrationsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>Integrations</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>
        Use Shotbase over the REST API or MCP — from any language or agent framework. No SDK required.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
        {INTEGRATIONS.map((i) => (
          <Card key={i.name} i={i} />
        ))}
      </div>

      <div style={{ marginTop: 24, fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444" }}>
        <span style={{ color: "#00e87b" }}>→</span> Missing your framework? <a href="mailto:hello@shotbase.dev" style={{ color: "#888" }}>Tell us what to build next.</a>
      </div>
    </div>
  )
}
