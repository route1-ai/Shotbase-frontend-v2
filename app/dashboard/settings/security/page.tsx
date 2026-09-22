"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useClerk, useSession, useUser } from "@clerk/nextjs"

// Structural subset of Clerk's SessionWithActivitiesResource (fields we use).
// Defined locally so we don't depend on the @clerk/types package resolving —
// the real value returned by user.getSessions() is assignable to this.
type ActiveSession = {
  id: string
  lastActiveAt: Date
  latestActivity?: {
    browserName?: string
    deviceType?: string
    city?: string
    country?: string
    isMobile?: boolean
  }
  revoke: () => Promise<unknown>
}

const CARD: React.CSSProperties = {
  background: "#0a0a0a",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 12,
  padding: 28,
  marginBottom: 20,
  maxWidth: 680,
}

const SUPPORT_HREF = "mailto:hello@shotbase.dev?subject=Account%20deletion%20request"

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const sec = Math.round(diffMs / 1000)
  if (sec < 60) return "Active now"
  const min = Math.round(sec / 60)
  if (min < 60) return `${min} min ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr} hr ago`
  const day = Math.round(hr / 24)
  if (day < 30) return `${day} day${day === 1 ? "" : "s"} ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function sessionLocation(s: ActiveSession): string {
  const a = s.latestActivity
  const place = [a?.city, a?.country].filter(Boolean).join(", ")
  return place || "Unknown location"
}

function sessionDevice(s: ActiveSession): string {
  const a = s.latestActivity
  const browser = a?.browserName || "Unknown browser"
  const device = a?.deviceType || (a?.isMobile ? "Mobile" : "Desktop")
  return `${browser} · ${device}`
}

export default function SecurityPage() {
  const { signOut, openUserProfile } = useClerk()
  const { user, isLoaded } = useUser()
  const { session: currentSession } = useSession()
  const currentId = currentSession?.id

  const email = user?.primaryEmailAddress?.emailAddress ?? ""

  // ----- Sessions -----
  const [sessions, setSessions] = useState<ActiveSession[] | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [signingOutOthers, setSigningOutOthers] = useState(false)

  const refreshSessions = useCallback(async () => {
    if (!user) return
    try {
      const list = await user.getSessions()
      setSessions(list)
    } catch {
      setSessions([])
    }
  }, [user])

  // Initial load: inline so setState only happens in the async continuation
  // (not synchronously in the effect). Handlers below reuse refreshSessions().
  useEffect(() => {
    if (!isLoaded || !user) return
    let cancelled = false
    user.getSessions()
      .then((list) => { if (!cancelled) setSessions(list) })
      .catch(() => { if (!cancelled) setSessions([]) })
    return () => { cancelled = true }
  }, [isLoaded, user])

  const revokeSession = async (s: ActiveSession) => {
    if (s.id === currentId) return
    setBusyId(s.id)
    try {
      await s.revoke()
      await refreshSessions()
    } catch {
      // leave the row; a failed revoke shouldn't wipe the list
    } finally {
      setBusyId(null)
    }
  }

  const signOutOthers = async () => {
    if (!sessions) return
    const others = sessions.filter((s) => s.id !== currentId)
    if (others.length === 0) return
    setSigningOutOthers(true)
    try {
      await Promise.all(others.map((s) => s.revoke().catch(() => null)))
      await refreshSessions()
    } finally {
      setSigningOutOthers(false)
    }
  }

  const otherCount = sessions ? sessions.filter((s) => s.id !== currentId).length : 0

  // ----- Account deletion gate (mirror server state; show contact-support up
  // front when self-serve deletion is disabled). -----
  const [deletionEnabled, setDeletionEnabled] = useState<boolean | null>(null)
  useEffect(() => {
    fetch("/api/account/delete")
      .then((r) => r.json())
      .then((d) => setDeletionEnabled(d?.enabled === true))
      .catch(() => setDeletionEnabled(false))
  }, [])

  // ----- Deletion confirm flow (only reachable when enabled) -----
  const [deleting, setDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canDelete = confirmText.trim().toLowerCase() === email.toLowerCase() && email.length > 0

  const deleteAccount = async () => {
    if (!canDelete) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/account/delete", { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.ok) {
        await signOut({ redirectUrl: "/" })
        return
      }
      if (data?.code === "DELETION_DISABLED" || data?.code === "DB_UNAVAILABLE") {
        setError("Account deletion isn’t available yet. Please contact support if you need your account removed.")
        setDeletionEnabled(false)
      } else {
        setError(data?.error || "Account deletion failed. Please try again or contact support.")
      }
    } catch {
      setError("Account deletion failed (network). Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const externalMethods = (user?.externalAccounts ?? [])
    .map((a) => a.providerTitle?.() || a.provider)
    .filter(Boolean)

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>Security</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 32 }}>Manage your password, sessions, and account security.</p>

      {/* ----- Password / sign-in method ----- */}
      <div style={CARD}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Password</h2>
        {!isLoaded ? (
          <p style={{ color: "#444", fontSize: 13, fontFamily: "var(--font-ibm-plex)" }}>Loading…</p>
        ) : user?.passwordEnabled ? (
          <>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              Your password is managed securely by Clerk. Update it or reset it in your account portal.
            </p>
            <button
              onClick={() => openUserProfile()}
              style={{ background: "#111", color: "#f0f0f0", border: "1px solid rgba(255,255,255,0.15)", padding: "9px 18px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
            >
              Change password
            </button>
          </>
        ) : (
          <p style={{ color: "#888", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            {externalMethods.length > 0
              ? `You sign in with ${externalMethods.join(", ")} — there's no password on this account. Manage your sign-in method in your account portal.`
              : "You sign in without a password (email code / link). There's nothing to change here."}
            <br />
            <button
              onClick={() => openUserProfile()}
              style={{ marginTop: 14, background: "#111", color: "#f0f0f0", border: "1px solid rgba(255,255,255,0.15)", padding: "9px 18px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
            >
              Manage sign-in
            </button>
          </p>
        )}
      </div>

      {/* ----- Active sessions ----- */}
      <div style={CARD}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Active sessions</h2>
            <p style={{ color: "#888", fontSize: 13 }}>You&apos;re currently signed in on these devices.</p>
          </div>
          <button
            onClick={signOutOthers}
            disabled={otherCount === 0 || signingOutOthers}
            style={{ background: "transparent", color: otherCount === 0 ? "#555" : "#888", border: "1px solid rgba(255,255,255,0.15)", padding: "6px 12px", borderRadius: 6, fontSize: 12, cursor: otherCount === 0 || signingOutOthers ? "not-allowed" : "pointer" }}
          >
            {signingOutOthers ? "Signing out…" : "Sign out other devices"}
          </button>
        </div>

        {sessions === null ? (
          <div style={{ padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.07)", fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#444" }}>Loading sessions…</div>
        ) : sessions.length === 0 ? (
          <div style={{ padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.07)", fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#444" }}>No active sessions found.</div>
        ) : (
          sessions.map((s) => {
            const isCurrent = s.id === currentId
            const mobile = s.latestActivity?.isMobile
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ width: 40, height: 40, background: "#111", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{mobile ? "📱" : "💻"}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {sessionDevice(s)}
                    {isCurrent && (
                      <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 9, background: "rgba(0,232,123,0.1)", color: "#00e87b", padding: "2px 6px", borderRadius: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Current</span>
                    )}
                  </div>
                  <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888", marginTop: 2 }}>
                    {sessionLocation(s)} · {relativeTime(s.lastActiveAt)}
                  </div>
                </div>
                {!isCurrent && (
                  <button
                    onClick={() => revokeSession(s)}
                    disabled={busyId === s.id}
                    style={{ background: "transparent", color: "#ff8f8f", border: "1px solid rgba(255,96,96,0.25)", padding: "6px 12px", borderRadius: 6, fontSize: 12, cursor: busyId === s.id ? "not-allowed" : "pointer", flexShrink: 0 }}
                  >
                    {busyId === s.id ? "Revoking…" : "Revoke"}
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* ----- Danger zone ----- */}
      <div style={{ border: "1px solid rgba(255,96,96,0.3)", borderRadius: 12, padding: 28, maxWidth: 680 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#ff6060", marginBottom: 8 }}>Danger zone</h2>

        {deletionEnabled === false ? (
          // Self-serve deletion is gated off — point to support instead of an
          // email-confirm flow that would just fail server-side.
          <>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
              Self-serve account deletion isn&apos;t available yet. To permanently delete your account, API keys,
              and screenshots, contact support and we&apos;ll remove everything for you.
            </p>
            <a
              href={SUPPORT_HREF}
              style={{ display: "inline-block", background: "rgba(255,96,96,0.08)", color: "#ff6060", border: "1px solid rgba(255,96,96,0.25)", padding: "9px 18px", borderRadius: 7, fontSize: 12, fontWeight: 600, textDecoration: "none" }}
            >
              Contact support to delete your account
            </a>
          </>
        ) : (
          <>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              Permanently delete your account, API keys, screenshots, and audit logs. This action cannot be undone.
            </p>
            {deleting ? (
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 8 }}>
                  Type your email <code style={{ fontFamily: "var(--font-ibm-plex)", color: "#ff8f8f" }}>{email || "(unknown)"}</code> to confirm:
                </label>
                <input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={email}
                  autoComplete="off"
                  style={{ width: "100%", maxWidth: 360, fontFamily: "var(--font-ibm-plex)", fontSize: 13, background: "#111", border: "1px solid rgba(255,96,96,0.25)", borderRadius: 7, padding: "9px 14px", color: "#f0f0f0", outline: "none", marginBottom: 14 }}
                />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={deleteAccount}
                    disabled={!canDelete || submitting}
                    style={{ background: canDelete && !submitting ? "#ff6060" : "#3a2020", color: canDelete && !submitting ? "#000" : "#8a6060", border: "none", padding: "9px 18px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: canDelete && !submitting ? "pointer" : "not-allowed" }}
                  >
                    {submitting ? "Deleting…" : "Yes, permanently delete my account"}
                  </button>
                  <button
                    onClick={() => { setDeleting(false); setConfirmText(""); setError(null) }}
                    disabled={submitting}
                    style={{ background: "transparent", color: "#888", border: "1px solid rgba(255,255,255,0.15)", padding: "9px 18px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: submitting ? "not-allowed" : "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
                {error && (
                  <div style={{ marginTop: 14, fontSize: 12, color: "#ff8f8f", background: "rgba(255,96,96,0.08)", border: "1px solid rgba(255,96,96,0.25)", borderRadius: 7, padding: "10px 14px", lineHeight: 1.5 }}>
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setDeleting(true)}
                disabled={deletionEnabled === null}
                style={{ background: "rgba(255,96,96,0.08)", color: "#ff6060", border: "1px solid rgba(255,96,96,0.25)", padding: "9px 18px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: deletionEnabled === null ? "wait" : "pointer" }}
              >
                Delete account
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
