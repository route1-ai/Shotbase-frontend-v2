"use client"

import React, { useEffect, useState, useRef } from "react"

const cardStyle: React.CSSProperties = {
  background: "#0a0a0a",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 10,
  padding: 24,
}

// A key row NEVER holds the plaintext secret. Unkey returns the full key exactly
// once at creation; we surface it in a one-time modal and never persist it.
type KeyRow = { id: string; name: string; createdAt: number | null; active: boolean; start?: string | null; lastUsedAt?: number | null }

export default function KeysPage() {
  const [keys, setKeys] = useState<KeyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null)
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
    }
  }, [])

  // Transient plaintext for the "key created" modal ONLY. Cleared on close and
  // never written into `keys` or anywhere persisted.
  const [createdKey, setCreatedKey] = useState<{ key: string; name: string } | null>(null)
  const [copied, setCopied] = useState(false)

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
      if (data.keyId && data.key) {
        // Safe prefix for the table (Unkey `start`, or derived from the plaintext
        // once — never the full secret).
        const start = typeof data.start === "string" ? data.start : String(data.key).slice(0, 11)
        // Persisted row carries ONLY safe metadata — no plaintext.
        setKeys((ks) => [
          { id: data.keyId, name: newName.trim(), createdAt: Date.now(), active: true, start },
          ...ks,
        ])
        // Show the full key exactly once, in the modal.
        setCreatedKey({ key: data.key, name: newName.trim() })
        setCopied(false)
        setShowNew(false)
        setNewName("")
      }
    } finally {
      setCreating(false)
    }
  }

  const copyCreatedKey = async () => {
    if (!createdKey) return
    try {
      await navigator.clipboard.writeText(createdKey.key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const closeCreatedModal = () => {
    // Discard the plaintext from client state — it can never be shown again.
    setCreatedKey(null)
    setCopied(false)
  }

  const revokeKey = async (id: string) => {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
    setConfirmRevokeId(null)
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

  const handleRevokeClick = (id: string) => {
    if (confirmRevokeId === id) {
      revokeKey(id)
    } else {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
      setConfirmRevokeId(id)
      confirmTimerRef.current = setTimeout(() => {
        setConfirmRevokeId(null)
      }, 3000)
    }
  }

  return (
    <div>
      <style>{`
        .keys-table { display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        @media (max-width: 767px) {
          .keys-header { flex-direction: column !important; align-items: stretch !important; gap: 14px; }
          .keys-create-btn { width: 100% !important; }
        }
      `}</style>
      <div className="keys-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 28 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>API Keys</h1>
          <p style={{ color: "#888", fontSize: 13 }}>Manage your API keys. Treat them like passwords — anyone with one can hit the API as you.</p>
        </div>
        <button
          className="keys-create-btn"
          onClick={() => setShowNew(true)}
          style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, fontWeight: 600, color: "#000", background: "#00e87b", border: "none", padding: "10px 18px", borderRadius: 7, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, minHeight: 40 }}
        >
          + Create key
        </button>
      </div>

      {showNew && (
        <div style={{ ...cardStyle, marginBottom: 16, border: "1px solid rgba(0,232,123,0.25)" }}>
          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 14 }}>New API key</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Key name (e.g. Production)"
              onKeyDown={(e) => e.key === "Enter" && createKey()}
              style={{ flex: "1 1 200px", minWidth: 0, fontFamily: "var(--font-ibm-plex)", fontSize: 13, background: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, padding: "9px 14px", color: "#f0f0f0", outline: "none" }}
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
          <table className="keys-table" style={{ width: "100%", borderCollapse: "collapse" }}>
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
                    {/* Only the non-secret prefix is ever shown. The full key is
                        unrecoverable after creation — no reveal control. */}
                    <code style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888" }}>
                      {(k.start || "sk_live") + "••••••••••••"}
                    </code>
                  </td>
                  <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888", padding: "14px 16px 14px 0", whiteSpace: "nowrap" }}>
                    {k.createdAt ? new Date(k.createdAt).toLocaleDateString() : "—"}
                  </td>
                  {/* Last used: real Unkey lastUsedAt (approx). Requests: not
                      provided per-key by Unkey → honest em-dash, never fake 0. */}
                  <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888", padding: "14px 16px 14px 0", whiteSpace: "nowrap" }}>
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "—"}
                  </td>
                  <td style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888", padding: "14px 16px 14px 0" }}>—</td>
                  <td style={{ padding: "14px 0", textAlign: "right" }}>
                    {k.active !== false && (
                      <button
                        type="button"
                        onClick={() => handleRevokeClick(k.id)}
                        disabled={revoking === k.id}
                        aria-label={confirmRevokeId === k.id ? `Confirm revocation of key ${k.name}` : `Revoke key ${k.name}`}
                        style={{
                          fontFamily: "var(--font-ibm-plex)",
                          fontSize: 11,
                          color: revoking === k.id ? "#444" : confirmRevokeId === k.id ? "#ffffff" : "#ff6060",
                          background: confirmRevokeId === k.id ? "rgba(255,60,60,0.2)" : "none",
                          border: "1px solid",
                          borderColor: revoking === k.id ? "rgba(255,255,255,0.07)" : "rgba(255,60,60,0.4)",
                          padding: "5px 12px",
                          borderRadius: 6,
                          cursor: revoking === k.id ? "not-allowed" : "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {revoking === k.id ? "Revoking…" : confirmRevokeId === k.id ? "Confirm revoke?" : "Revoke"}
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
        <span style={{ color: "#00e87b" }}>→</span> Secret keys are shown once at creation. Store them securely — we cannot recover or re-display them.<br />
        <span style={{ color: "#00e87b" }}>→</span> Revoking a key immediately invalidates all requests using it.
      </div>

      {/* ── "API key created" modal — shows the full key exactly once ── */}
      {createdKey && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="API key created"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 100 }}
        >
          <div style={{ ...cardStyle, width: "100%", maxWidth: 520, border: "1px solid rgba(0,232,123,0.35)", padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,232,123,0.12)", border: "1px solid rgba(0,232,123,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e87b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}>API key created</h2>
            </div>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>
              <strong style={{ color: "#f0f0f0" }}>{createdKey.name}</strong> is ready. Copy this key now — <span style={{ color: "#ffcf5c" }}>you won&apos;t be able to see it again.</span>
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <code style={{ flex: 1, fontFamily: "var(--font-ibm-plex)", fontSize: 13, color: "#f0f0f0", background: "#050505", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 7, padding: "11px 14px", overflowX: "auto", whiteSpace: "nowrap" }}>
                {createdKey.key}
              </code>
              <button
                onClick={copyCreatedKey}
                style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, fontWeight: 600, color: copied ? "#00e87b" : "#000", background: copied ? "transparent" : "#00e87b", border: copied ? "1px solid rgba(0,232,123,0.35)" : "none", padding: "11px 16px", borderRadius: 7, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                {copied ? "✓ Copied" : "Copy key"}
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={closeCreatedModal}
                style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 13, fontWeight: 600, color: "#f0f0f0", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.12)", padding: "10px 22px", borderRadius: 7, cursor: "pointer" }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
