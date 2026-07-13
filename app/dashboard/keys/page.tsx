"use client"

import React, { useEffect, useState, useRef } from "react"
import { Copy, Check, Eye, EyeOff } from "lucide-react"

interface APIKey { id: string; name: string; key?: string; createdAt?: number; active?: boolean; last?: string; requests?: number; }

const cardStyle: React.CSSProperties = {
  background: "#0a0a0a",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 10,
  padding: 24,
}

export default function KeysPage() {
  const [keys, setKeys] = useState<APIKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [revoking, setRevoking] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => { if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current) }
  }, [])

  const copyToClipboard = async (id: string, text: string) => {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    try { await navigator.clipboard.writeText(text); setCopiedId(id); copyTimeoutRef.current = setTimeout(() => setCopiedId(null), 2000) }
    catch (err) { console.error("Failed to copy:", err) }
  }

  useEffect(() => {
    fetch("/api/keys/list")
      .then((r) => r.json())
      .then((data) => {
        setKeys(data.keys || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const createKey = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/keys/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      })
      const data = await res.json()
      if (data.keyId) {
        setKeys((ks) => [
          { id: data.keyId, name: newName.trim(), key: data.key, createdAt: Date.now(), active: true },
          ...ks,
        ])
        setRevealed((r) => ({ ...r, [data.keyId]: true }))
        setShowNew(false)
        setNewName("")
      }
    } finally {
      setCreating(false)
    }
  }

  const revokeKey = async (id: string) => {
    setRevoking(id)
    try {
      const res = await fetch("/api/keys/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId: id }),
      })
      if (res.ok) setKeys((ks) => ks.filter((k) => k.id !== id))
    } finally {
      setRevoking(null)
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>API Keys</h1>
          <p style={{ color: "#888", fontSize: 13 }}>Manage your API keys. Treat them like passwords — anyone with one can hit the API as you.</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, fontWeight: 600, color: "#000", background: "#00e87b", border: "none", padding: "9px 18px", borderRadius: 7, cursor: "pointer" }}
        >
          + Create key
        </button>
      </div>

      {showNew && (
        <div style={{ ...cardStyle, marginBottom: 16, border: "1px solid rgba(0,232,123,0.25)" }}>
          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 14 }}>New API key</div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Key name (e.g. Production)"
              onKeyDown={(e) => e.key === "Enter" && createKey()}
              style={{ flex: 1, fontFamily: "var(--font-ibm-plex)", fontSize: 13, background: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, padding: "9px 14px", color: "#f0f0f0", outline: "none" }}
            />
            <button
              onClick={createKey}
              disabled={creating || !newName.trim()}
              style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, fontWeight: 600, color: "#000", background: creating || !newName.trim() ? "#333" : "#00e87b", border: "none", padding: "9px 18px", borderRadius: 7, cursor: creating || !newName.trim() ? "not-allowed" : "pointer" }}
            >
              {creating ? "Creating…" : "Create"}
            </button>
            <button
              onClick={() => { setShowNew(false); setNewName("") }}
              style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888", background: "none", border: "1px solid rgba(255,255,255,0.07)", padding: "9px 14px", borderRadius: 7, cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={cardStyle}>
        {loading ? (
          <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#444", padding: "32px 0", textAlign: "center" }}>Loading keys…</div>
        ) : keys.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>No keys yet</div>
            <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#444" }}>Create one to start making requests.</div>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Name", "Key", "Created", "Last used", "Requests", ""].map((h) => (
                  <th key={h} style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", fontWeight: 500, textAlign: "left", padding: "0 16px 12px 0" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map((k, i) => (
                <tr key={k.id} style={{ borderBottom: i < keys.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none", opacity: k.active === false ? 0.4 : 1 }}>
                  <td style={{ padding: "14px 16px 14px 0" }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{k.name}</div>
                  </td>
                  <td style={{ padding: "14px 16px 14px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <code style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888" }}>
                        {revealed[k.id] ? k.key || "sk_prod_xxxxxxxxxxxxxxxxxxxxxxxx" : "sk_prod_••••••••••••••••••••••••"}
                      </code>
                      <button onClick={() => setRevealed((r) => ({ ...r, [k.id]: !r[k.id] }))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: revealed[k.id] ? "hsl(var(--brand))" : "#444", display: "flex", alignItems: "center" }} aria-label={revealed[k.id] ? "Hide API key" : "Show API key"}>{revealed[k.id] ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                      {revealed[k.id] && k.key && (
                        <button onClick={() => copyToClipboard(k.id, k.key!)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: copiedId === k.id ? "hsl(var(--brand))" : "#444", display: "flex", alignItems: "center" }} aria-label="Copy API key to clipboard">{copiedId === k.id ? <Check size={14} /> : <Copy size={14} />}</button>
                      )}
                    </div>
                  </td>
                  <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888", padding: "14px 16px 14px 0", whiteSpace: "nowrap" }}>
                    {k.createdAt ? new Date(k.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888", padding: "14px 16px 14px 0", whiteSpace: "nowrap" }}>{k.last || "—"}</td>
                  <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888", padding: "14px 16px 14px 0" }}>{k.requests ? k.requests.toLocaleString() : "0"}</td>
                  <td style={{ padding: "14px 0", textAlign: "right" }}>
                    {k.active !== false && (
                      <button
                        onClick={() => revokeKey(k.id)}
                        disabled={revoking === k.id}
                        aria-label={`Revoke key ${k.name}`}
                        style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: revoking === k.id ? "#444" : "#ff6060", background: "none", border: "1px solid", borderColor: revoking === k.id ? "rgba(255,255,255,0.07)" : "rgba(255,60,60,0.2)", padding: "5px 12px", borderRadius: 6, cursor: revoking === k.id ? "not-allowed" : "pointer" }}
                      >
                        {revoking === k.id ? "Revoking…" : "Revoke"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: 16, fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444", lineHeight: 1.7 }}>
        <span style={{ color: "#00e87b" }}>→</span> Secret keys are shown once. Store them securely — we cannot recover them.<br />
        <span style={{ color: "#00e87b" }}>→</span> Revoking a key immediately invalidates all requests using it.
      </div>
    </div>
  )
}
