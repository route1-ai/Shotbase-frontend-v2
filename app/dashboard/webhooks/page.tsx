"use client"

import React, { useState } from "react"

const BORDER = "rgba(255,255,255,0.07)"
const ACTIVE_BG = "rgba(0,232,123,0.1)"
const ACTIVE_BORDER = "rgba(0,232,123,0.25)"

const cardStyle: React.CSSProperties = {
  background: "#0a0a0a",
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  padding: 22,
}

type Endpoint = {
  id: string
  url: string
  events: string[]
  active: boolean
  secret: string
  lastDelivery?: { status: number; ts: string }
}

const EVENT_TYPES = [
  { id: "screenshot.completed", label: "Screenshot completed", sub: "Fires when a render finishes successfully" },
  { id: "screenshot.failed",    label: "Screenshot failed",    sub: "Fires when a render returns 4xx/5xx" },
  { id: "extract.completed",    label: "Extract completed",    sub: "Fires when /extract returns structured data" },
  { id: "quota.exceeded",       label: "Quota exceeded",       sub: "Fires when monthly quota is hit" },
  { id: "key.created",          label: "API key created",      sub: "Fires when a new key is minted" },
  { id: "key.revoked",          label: "API key revoked",      sub: "Fires when a key is revoked" },
]

export default function WebhooksPage() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newUrl, setNewUrl] = useState("")
  const [newEvents, setNewEvents] = useState<string[]>(["screenshot.completed", "screenshot.failed"])
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)

  const toggleEvent = (id: string) =>
    setNewEvents((es) => (es.includes(id) ? es.filter((e) => e !== id) : [...es, id]))

  const create = () => {
    if (!newUrl.trim() || newEvents.length === 0) return
    const id = `we_${Math.random().toString(36).slice(2, 10)}`
    const secret = `whsec_${Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join("")}`
    setEndpoints((es) => [
      { id, url: newUrl.trim(), events: newEvents, active: true, secret },
      ...es,
    ])
    setRevealed((r) => ({ ...r, [id]: true }))
    setNewUrl("")
    setNewEvents(["screenshot.completed", "screenshot.failed"])
    setShowCreate(false)
  }

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 1500)
    } catch {}
  }

  const remove = (id: string) => setEndpoints((es) => es.filter((e) => e.id !== id))

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>Webhooks</h1>
          <p style={{ color: "#888", fontSize: 13 }}>
            Receive signed HTTP callbacks for render completion, errors, and quota events. Every delivery is signed with HMAC SHA-256.
          </p>
        </div>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, fontWeight: 600, color: "#000", background: "#00e87b", border: "none", padding: "9px 18px", borderRadius: 7, cursor: "pointer" }}
          >
            + Add endpoint
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{ ...cardStyle, marginBottom: 18, border: `1px solid ${ACTIVE_BORDER}` }}>
          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 14 }}>New webhook endpoint</div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Endpoint URL
            </label>
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://your-app.com/webhooks/shotbase"
              autoFocus
              style={{ width: "100%", fontFamily: "var(--font-ibm-plex)", fontSize: 13, background: "#050505", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "9px 14px", color: "#f0f0f0", outline: "none" }}
            />
            <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444", marginTop: 6 }}>
              Must be HTTPS. We retry failed deliveries with exponential backoff for up to 24 hours.
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Events to send · {newEvents.length} selected
            </label>
            <div style={{ display: "grid", gap: 6 }}>
              {EVENT_TYPES.map((e) => {
                const checked = newEvents.includes(e.id)
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => toggleEvent(e.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      background: checked ? ACTIVE_BG : "#050505",
                      border: `1px solid ${checked ? ACTIVE_BORDER : BORDER}`,
                      borderRadius: 7,
                      padding: "10px 14px",
                      cursor: "pointer",
                      textAlign: "left",
                      color: "inherit",
                      transition: "all 0.15s",
                    }}
                  >
                    <div>
                      <code style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: checked ? "#00e87b" : "#f0f0f0", fontWeight: 500 }}>{e.id}</code>
                      <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#666", marginTop: 2 }}>{e.sub}</div>
                    </div>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        background: checked ? "#00e87b" : "transparent",
                        border: `1px solid ${checked ? "#00e87b" : "rgba(255,255,255,0.15)"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {checked && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2 4-4" stroke="#000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={() => {
                setShowCreate(false)
                setNewUrl("")
              }}
              style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888", background: "transparent", border: `1px solid ${BORDER}`, padding: "9px 18px", borderRadius: 7, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              onClick={create}
              disabled={!newUrl.trim() || newEvents.length === 0}
              style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, fontWeight: 600, color: "#000", background: !newUrl.trim() || newEvents.length === 0 ? "#333" : "#00e87b", border: "none", padding: "9px 18px", borderRadius: 7, cursor: !newUrl.trim() || newEvents.length === 0 ? "not-allowed" : "pointer" }}
            >
              Create endpoint
            </button>
          </div>
        </div>
      )}

      {/* Endpoint list */}
      {endpoints.length === 0 && !showCreate ? (
        <div style={{ ...cardStyle, textAlign: "center", padding: 40 }}>
          <div style={{ width: 56, height: 56, background: "#111", border: `1px solid ${BORDER}`, borderRadius: 12, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5">
              <circle cx="5" cy="17" r="3" />
              <circle cx="19" cy="17" r="3" />
              <circle cx="12" cy="6" r="3" />
              <path d="M10 8L7 14M14 8L17 14" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>No webhook endpoints configured</div>
          <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#666", marginBottom: 16, maxWidth: 380, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
            Add an endpoint to start receiving signed callbacks. Common use cases: log every render, update your DB when a screenshot completes, page on quota events.
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, fontWeight: 600, color: "#000", background: "#00e87b", border: "none", padding: "9px 18px", borderRadius: 7, cursor: "pointer" }}
          >
            + Add endpoint
          </button>
        </div>
      ) : (
        endpoints.length > 0 && (
          <div style={{ display: "grid", gap: 12 }}>
            {endpoints.map((ep) => (
              <div key={ep.id} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: ep.active ? "#00e87b" : "#666" }} />
                      <code style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 13, color: "#f0f0f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ep.url}
                      </code>
                    </div>
                    <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#666" }}>
                      {ep.events.length} event{ep.events.length === 1 ? "" : "s"} · {ep.active ? "Active" : "Disabled"} · {ep.id}
                    </div>
                  </div>
                  <button
                    onClick={() => remove(ep.id)}
                    style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#ff6060", background: "transparent", border: "1px solid rgba(255,60,60,0.2)", padding: "5px 12px", borderRadius: 6, cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                  {ep.events.map((e) => (
                    <span key={e} style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, padding: "3px 8px", background: ACTIVE_BG, color: "#00e87b", border: `1px solid ${ACTIVE_BORDER}`, borderRadius: 4 }}>
                      {e}
                    </span>
                  ))}
                </div>

                <div style={{ background: "#050505", border: `1px solid ${BORDER}`, borderRadius: 7, padding: 12, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Signing secret
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button
                        onClick={() => setRevealed((r) => ({ ...r, [ep.id]: !r[ep.id] }))}
                        style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#666", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        {revealed[ep.id] ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => copy(ep.id, ep.secret)}
                        style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: copied === ep.id ? "#00e87b" : "#666", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        {copied === ep.id ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                  <code style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: revealed[ep.id] ? "#f0f0f0" : "#666", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {revealed[ep.id] ? ep.secret : "whsec_•••••••••••••••••••••••••••••••••"}
                  </code>
                </div>

                <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#666" }}>
                  Last delivery: {ep.lastDelivery ? `${ep.lastDelivery.status} · ${ep.lastDelivery.ts}` : "No deliveries yet"}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Signing verification snippet */}
      {endpoints.length > 0 && (
        <div style={{ ...cardStyle, marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: 500, fontSize: 13 }}>Verifying webhook signatures</div>
            <a href="/docs/webhooks" style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#00e87b", textDecoration: "none" }}>Full docs →</a>
          </div>
          <pre style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, background: "#050505", border: `1px solid ${BORDER}`, padding: 12, borderRadius: 6, color: "#888", margin: 0, overflow: "auto", lineHeight: 1.65 }}>
{`// Every delivery includes a 'Shotbase-Signature' header.
// Verify in Node:
import crypto from 'crypto'

function verifyWebhook(rawBody, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  )
}`}
          </pre>
        </div>
      )}
    </div>
  )
}
