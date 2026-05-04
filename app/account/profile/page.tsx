"use client"

import React, { useState } from "react"
import { useUser } from "@clerk/nextjs"

export default function ProfilePage() {
  const { user } = useUser()
  const [name, setName] = useState(user?.fullName || "")
  const [company, setCompany] = useState("")
  const [saving, setSaving] = useState(false)

  const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? "Loading..."

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
    }, 800)
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>Profile settings</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 40 }}>Manage your personal information and company details.</p>

      <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 32, maxWidth: 500 }}>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Email address</label>
          <input 
            type="email" 
            value={userEmail} 
            readOnly 
            style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '12px 16px', color: '#888', fontSize: 14, outline: 'none', cursor: 'not-allowed' }}
          />
          <div style={{ fontSize: 12, color: '#444', marginTop: 8 }}>Your email is managed by your authentication provider.</div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Full name</label>
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Jane Doe"
            style={{ width: '100%', background: '#050505', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '12px 16px', color: '#f0f0f0', fontSize: 14, outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Company</label>
          <input 
            type="text" 
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="e.g. Acme Corp"
            style={{ width: '100%', background: '#050505', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '12px 16px', color: '#f0f0f0', fontSize: 14, outline: 'none' }}
          />
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          style={{ background: '#00e87b', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
