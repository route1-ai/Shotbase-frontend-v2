"use client"

import React, { useState, useRef, useEffect } from "react"

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
    name: "LangChain",
    blurb: "Drop Shotbase into any LangChain or LangGraph agent as a tool.",
    install: "npm install @shotbase/langchain",
    docs: "/docs/integrations/langchain",
    status: "soon",
    initial: "L",
  },
  {
    name: "Vercel AI SDK",
    blurb: "Provider package that plugs into the AI SDK v6+ tool system.",
    install: "npm install @shotbase/ai-sdk",
    docs: "/docs/integrations/vercel-ai-sdk",
    status: "soon",
    initial: "V",
  },
  {
    name: "Claude Skill",
    blurb: "Pre-installed in every Claude Code session via the Anthropic Skills registry.",
    install: "Submitted to anthropic-skills",
    docs: "/docs/integrations/claude-skill",
    status: "soon",
    initial: "C",
  },
  {
    name: "MCP Server",
    blurb: "Connect any MCP-compatible agent (Claude Code, Cursor, Continue).",
    install: "npx -y @shotbase/mcp",
    docs: "/docs/integrations/mcp",
    status: "soon",
    initial: "M",
  },
  {
    name: "Stagehand / Browser Use",
    blurb: "Action plugin for AI browser-automation frameworks.",
    install: "npm install @shotbase/stagehand",
    docs: "/docs/integrations/stagehand",
    status: "soon",
    initial: "S",
  },
  {
    name: "n8n",
    blurb: "Community node for no-code workflow builders.",
    install: "n8n-nodes-shotbase",
    docs: "/docs/integrations/n8n",
    status: "soon",
    initial: "N",
  },
  {
    name: "Python SDK",
    blurb: "Idiomatic Python client with async support.",
    install: "pip install shotbase",
    docs: "/docs/sdks/python",
    status: "soon",
    initial: "Py",
  },
  {
    name: "TypeScript SDK",
    blurb: "Type-safe client for Node, Bun, and the edge.",
    install: "npm install @shotbase/sdk",
    docs: "/docs/sdks/typescript",
    status: "soon",
    initial: "Ts",
  },
]

function Card({ i }: { i: Integration }) {
  const [copied, setCopied] = useState(false)
  const [hover, setHover] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(i.install)
      setCopied(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopied(false), 1500)
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
        <div style={{ flex: 1, minWidth: 0 }} aria-live="polite">
          <button
            type="button"
            onClick={copy}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            title={`Copy ${i.name} installation command`}
            aria-label={copied ? "Copied!" : `Copy ${i.name} installation command`}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              fontFamily: "var(--font-ibm-plex)",
              fontSize: 11,
              background: "#050505",
              border: isFocused ? "1px solid rgba(0,232,123,0.5)" : "1px solid rgba(255,255,255,0.07)",
              boxShadow: isFocused ? "0 0 0 1px rgba(0,232,123,0.25)" : "none",
              borderRadius: 6,
              padding: "8px 12px",
              color: copied ? "#00e87b" : "#888",
              cursor: "pointer",
              transition: "color 0.15s, border-color 0.15s",
              outline: "none",
            }}
          >
            <code style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
              {copied ? "✓ Copied" : i.install}
            </code>
          </button>
        </div>
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
        Native plugins for every AI agent framework + first-class SDKs. Pick your stack — Shotbase fits.
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
