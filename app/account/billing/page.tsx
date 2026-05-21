"use client"

import React, { useState, useEffect } from "react"

export default function BillingPage() {
  const [usage, setUsage] = useState({ count: 0, plan: 'Free', limit: 10000 })
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/usage').then(r => r.json()).then(u => {
      if (u) setUsage({ count: u.count || 0, plan: u.plan || 'Free', limit: u.limit || 10000 })
    })
  }, [])

  const handlePortal = async () => {
    setLoadingPortal(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const { url, error } = await res.json()
      if (url) window.location.href = url
      else if (error) alert(error)
    } finally {
      setLoadingPortal(false)
    }
  }

  const handleCheckout = async (tier: string) => {
    setLoadingCheckout(tier)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      })
      const { url, error } = await res.json()
      if (url) window.location.href = url
      else if (error) alert(error)
    } finally {
      setLoadingCheckout(null)
    }
  }

  const percentage = (usage.count / usage.limit) * 100

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>Billing & Usage</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 40 }}>Manage your subscription and monitor API usage.</p>

      <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 32, marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#00e87b', fontWeight: 600, marginBottom: 8 }}>Current Plan</div>
            <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>{usage.plan}</div>
            <div style={{ color: '#888', fontSize: 14 }}>{usage.limit.toLocaleString()} requests / month</div>
          </div>
          <button 
            onClick={handlePortal}
            disabled={loadingPortal}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#f0f0f0', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: loadingPortal ? 'not-allowed' : 'pointer', opacity: loadingPortal ? 0.7 : 1 }}>
            {loadingPortal ? 'Loading...' : 'Manage billing'}
          </button>
        </div>

        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Screenshots used</div>
          <div style={{ fontSize: 14, color: '#888' }}><span style={{ color: '#f0f0f0', fontWeight: 500 }}>{usage.count.toLocaleString()}</span> / {usage.limit.toLocaleString()}</div>
        </div>
        
        <div style={{ height: 8, background: '#1a1a24', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ height: '100%', width: `${Math.min(100, percentage)}%`, background: '#00e87b', borderRadius: 4 }} />
        </div>
        
        <div style={{ fontSize: 12, color: '#444' }}>Usage resets on May 1, 2026</div>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Available Plans</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div style={{ background: '#050505', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Starter</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>$9<span style={{ fontSize: 14, color: '#888', fontWeight: 400 }}>/mo</span></div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', fontSize: 13, color: '#888', flex: 1 }}>
            <li style={{ marginBottom: 8 }}>✓ 50,000 requests</li>
            <li style={{ marginBottom: 8 }}>✓ Email support</li>
            <li>✓ 7-day log retention</li>
          </ul>
          <button 
            onClick={() => handleCheckout('starter')}
            disabled={loadingCheckout === 'starter'}
            style={{ width: '100%', background: '#111', color: '#f0f0f0', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: loadingCheckout === 'starter' ? 'not-allowed' : 'pointer', opacity: loadingCheckout === 'starter' ? 0.7 : 1 }}>
            {loadingCheckout === 'starter' ? 'Redirecting...' : 'Upgrade to Starter'}
          </button>
        </div>

        <div style={{ background: '#050505', border: '1px solid rgba(0,232,123,0.3)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -10, right: 24, background: '#00e87b', color: '#000', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Popular</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Pro</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>$19<span style={{ fontSize: 14, color: '#888', fontWeight: 400 }}>/mo</span></div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', fontSize: 13, color: '#888', flex: 1 }}>
            <li style={{ marginBottom: 8, color: '#f0f0f0' }}>✓ 250,000 requests</li>
            <li style={{ marginBottom: 8 }}>✓ Priority support</li>
            <li style={{ marginBottom: 8 }}>✓ 30-day log retention</li>
            <li>✓ Custom webhooks</li>
          </ul>
          <button 
            onClick={() => handleCheckout('pro')}
            disabled={loadingCheckout === 'pro'}
            style={{ width: '100%', background: '#00e87b', color: '#000', border: 'none', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: loadingCheckout === 'pro' ? 'not-allowed' : 'pointer', opacity: loadingCheckout === 'pro' ? 0.7 : 1 }}>
            {loadingCheckout === 'pro' ? 'Redirecting...' : 'Upgrade to Pro'}
          </button>
        </div>

        <div style={{ background: '#050505', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Scale</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>$49<span style={{ fontSize: 14, color: '#888', fontWeight: 400 }}>/mo</span></div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', fontSize: 13, color: '#888', flex: 1 }}>
            <li style={{ marginBottom: 8 }}>✓ 1,500,000 requests</li>
            <li style={{ marginBottom: 8 }}>✓ 24/7 Slack support</li>
            <li style={{ marginBottom: 8 }}>✓ 90-day log retention</li>
            <li>✓ Dedicated IPs</li>
          </ul>
          <button 
            onClick={() => handleCheckout('scale')}
            disabled={loadingCheckout === 'scale'}
            style={{ width: '100%', background: '#111', color: '#f0f0f0', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: loadingCheckout === 'scale' ? 'not-allowed' : 'pointer', opacity: loadingCheckout === 'scale' ? 0.7 : 1 }}>
            {loadingCheckout === 'scale' ? 'Redirecting...' : 'Upgrade to Scale'}
          </button>
        </div>
      </div>
    </div>
  )
}
