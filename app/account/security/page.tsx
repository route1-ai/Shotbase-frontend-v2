"use client"

import React, { useState } from "react"
import { useClerk } from "@clerk/nextjs"

export default function SecurityPage() {
  const { signOut } = useClerk()
  const [deleting, setDeleting] = useState(false)

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>Security settings</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 40 }}>Manage your password, sessions, and account security.</p>

      <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 32, marginBottom: 32, maxWidth: 600 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Password</h2>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Your password is managed securely by your authentication provider. You can update it or trigger a password reset through their portal.</p>
        
        <button style={{ background: '#111', color: '#f0f0f0', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          Change password
        </button>
      </div>

      <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 32, marginBottom: 32, maxWidth: 600 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Active sessions</h2>
            <p style={{ color: '#888', fontSize: 13 }}>You're currently logged in on these devices.</p>
          </div>
          <button onClick={() => signOut()} style={{ background: 'none', color: '#888', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
            Sign out all
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ width: 40, height: 40, background: '#111', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 20 }}>💻</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
              Mac OS · Chrome
              <span style={{ fontSize: 10, background: 'rgba(0,232,123,0.1)', color: '#00e87b', padding: '2px 6px', borderRadius: 4, fontWeight: 600, textTransform: 'uppercase' }}>Current</span>
            </div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>San Francisco, USA · Active now</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ width: 40, height: 40, background: '#111', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 20 }}>📱</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>iOS · Safari</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>San Francisco, USA · Last active 2 hours ago</div>
          </div>
          <button style={{ background: 'none', border: 'none', color: '#ff6060', fontSize: 13, cursor: 'pointer', padding: '4px 8px' }}>Revoke</button>
        </div>
      </div>

      <div style={{ border: '1px solid rgba(255,96,96,0.3)', borderRadius: 12, padding: 32, maxWidth: 600 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#ff6060', marginBottom: 8 }}>Danger Zone</h2>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Permanently delete your account and all associated data. This action cannot be undone.</p>
        
        {deleting ? (
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={{ background: '#ff6060', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Yes, delete my account</button>
            <button onClick={() => setDeleting(false)} style={{ background: 'none', color: '#888', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setDeleting(true)} style={{ background: 'rgba(255,96,96,0.1)', color: '#ff6060', border: '1px solid rgba(255,96,96,0.2)', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Delete account
          </button>
        )}
      </div>
    </div>
  )
}
