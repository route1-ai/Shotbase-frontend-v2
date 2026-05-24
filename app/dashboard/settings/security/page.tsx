"use client"

import React, { useState } from "react"
import { useClerk } from "@clerk/nextjs"

export default function SecurityPage() {
  const { signOut } = useClerk()
  const [deleting, setDeleting] = useState(false)

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>Security</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 32 }}>Manage your password, sessions, and account security.</p>

      <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 28, marginBottom: 20, maxWidth: 680 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Password</h2>
        <p style={{ color: "#888", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
          Your password is managed securely by Clerk. You can update it or trigger a password reset through their account portal.
        </p>
        <button style={{ background: "#111", color: "#f0f0f0", border: "1px solid rgba(255,255,255,0.15)", padding: "9px 18px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
          Change password
        </button>
      </div>

      <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 28, marginBottom: 20, maxWidth: 680 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Active sessions</h2>
            <p style={{ color: "#888", fontSize: 13 }}>You're currently signed in on these devices.</p>
          </div>
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            style={{ background: "transparent", color: "#888", border: "1px solid rgba(255,255,255,0.15)", padding: "6px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
          >
            Sign out all
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ width: 40, height: 40, background: "#111", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💻</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
              This device
              <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 9, background: "rgba(0,232,123,0.1)", color: "#00e87b", padding: "2px 6px", borderRadius: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Current</span>
            </div>
            <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888", marginTop: 2 }}>Active now</div>
          </div>
        </div>
      </div>

      <div style={{ border: "1px solid rgba(255,96,96,0.3)", borderRadius: 12, padding: 28, maxWidth: 680 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#ff6060", marginBottom: 8 }}>Danger zone</h2>
        <p style={{ color: "#888", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
          Permanently delete your account, API keys, screenshots, and audit logs. This action cannot be undone.
        </p>

        {deleting ? (
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ background: "#ff6060", color: "#000", border: "none", padding: "9px 18px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              Yes, delete my account
            </button>
            <button
              onClick={() => setDeleting(false)}
              style={{ background: "transparent", color: "#888", border: "1px solid rgba(255,255,255,0.15)", padding: "9px 18px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setDeleting(true)}
            style={{ background: "rgba(255,96,96,0.08)", color: "#ff6060", border: "1px solid rgba(255,96,96,0.25)", padding: "9px 18px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            Delete account
          </button>
        )}
      </div>
    </div>
  )
}
