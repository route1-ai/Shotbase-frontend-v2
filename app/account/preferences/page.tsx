"use client"

import React, { useState, useEffect } from "react"

export default function PreferencesPage() {
  const [format, setFormat] = useState("png")
  const [width, setWidth] = useState("1280")
  const [emails, setEmails] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const prefs = localStorage.getItem('shotbase_prefs')
    if (prefs) {
      try {
        const parsed = JSON.parse(prefs)
        if (parsed.format) setFormat(parsed.format)
        if (parsed.width) setWidth(parsed.width)
        if (parsed.emails !== undefined) setEmails(parsed.emails)
      } catch (e) {}
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('shotbase_prefs', JSON.stringify({ format, width, emails }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>Preferences</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 40 }}>Customize your Shotbase API defaults and dashboard experience.</p>

      <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 32, maxWidth: 600, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24 }}>API Defaults</h2>
        
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Default format</label>
          <div style={{ display: 'flex', gap: 12 }}>
            {['png', 'jpeg', 'webp'].map(f => (
              <button 
                key={f}
                onClick={() => setFormat(f)}
                style={{ 
                  flex: 1, 
                  padding: '10px', 
                  background: format === f ? 'rgba(0,232,123,0.1)' : '#111', 
                  border: `1px solid ${format === f ? 'rgba(0,232,123,0.3)' : 'rgba(255,255,255,0.1)'}`, 
                  color: format === f ? '#00e87b' : '#888', 
                  borderRadius: 8, 
                  fontSize: 13, 
                  fontWeight: format === f ? 600 : 400,
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#444', marginTop: 8 }}>Used when no format is specified in the API request.</div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Default viewport width</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input 
              type="number" 
              value={width}
              onChange={e => setWidth(e.target.value)}
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#f0f0f0', fontSize: 14, outline: 'none', width: 120 }}
            />
            <span style={{ color: '#888', fontSize: 13 }}>pixels</span>
          </div>
        </div>
      </div>

      <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 32, maxWidth: 600, marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24 }}>Dashboard</h2>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Email notifications</div>
            <div style={{ fontSize: 13, color: '#888' }}>Receive updates on API usage limits and billing.</div>
          </div>
          <button 
            onClick={() => setEmails(!emails)}
            style={{ 
              width: 44, 
              height: 24, 
              background: emails ? '#00e87b' : '#333', 
              borderRadius: 12, 
              position: 'relative', 
              border: 'none', 
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <div style={{ 
              position: 'absolute', 
              top: 2, 
              left: emails ? 22 : 2, 
              width: 20, 
              height: 20, 
              background: emails ? '#000' : '#fff', 
              borderRadius: '50%',
              transition: 'left 0.2s, background 0.2s'
            }} />
          </button>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Theme</div>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>Select your dashboard appearance.</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ padding: '12px 24px', background: '#050505', border: '1px solid #00e87b', borderRadius: 8, color: '#00e87b', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#00e87b' }} />
              Dark Mode
            </div>
            <div style={{ padding: '12px 24px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, cursor: 'not-allowed' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid #444' }} />
              Light Mode (Coming Soon)
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={handleSave}
        style={{ background: '#00e87b', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
      >
        {saved ? 'Saved!' : 'Save preferences'}
      </button>
    </div>
  )
}
