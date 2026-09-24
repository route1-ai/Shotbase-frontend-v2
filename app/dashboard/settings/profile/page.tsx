"use client"

import React, { useState } from "react"
import { useUser } from "@clerk/nextjs"

export default function ProfilePage() {
  const { user } = useUser()
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [syncedUser, setSyncedUser] = useState<typeof user>(null)

  if (user !== syncedUser) {
    setSyncedUser(user)
    if (user) {
      setName(user.fullName || "")
      setCompany((user.unsafeMetadata?.company as string) || "")
    }
  }

  const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? "Loading..."

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setSaved(false)
    try {
      const parts = name.trim().split(/\s+/)
      const firstName = parts[0] || ""
      const lastName = parts.slice(1).join(" ")
      await user.update({
        firstName,
        lastName,
        unsafeMetadata: { ...user.unsafeMetadata, company },
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>Profile</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 32 }}>Personal information and company details.</p>

      <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 28, maxWidth: 560 }}>
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="email-address" style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Email address</label>
          <input
            id="email-address"
            type="email"
            value={userEmail}
            readOnly
            aria-readonly="true"
            aria-describedby="email-help"
            style={{ width: "100%", background: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "10px 14px", color: "#888", fontSize: 13, outline: "none", cursor: "not-allowed" }}
          />
          <div id="email-help" style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#888", marginTop: 6 }}>
            Managed by your authentication provider.
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label htmlFor="full-name" style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Full name</label>
          <input
            id="full-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jane Doe"
            style={{ width: "100%", background: "#050505", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 14px", color: "#f0f0f0", fontSize: 13, outline: "none" }}
          />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label htmlFor="company-name" style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Company</label>
          <input
            id="company-name"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Acme Corp"
            style={{ width: "100%", background: "#050505", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 14px", color: "#f0f0f0", fontSize: 13, outline: "none" }}
          />
        </div>

        <div aria-live="polite">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            aria-label={saving ? "Saving profile changes" : saved ? "Profile changes saved" : "Save profile changes"}
            style={{ background: saved ? "#009950" : "#00e87b", color: "#000", border: "none", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, transition: "background 0.15s" }}
          >
            {saving ? "Saving…" : saved ? "✓ Saved" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  )
}
