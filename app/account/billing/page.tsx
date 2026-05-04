"use client"

import React from "react"

export default function BillingPage() {
  const currentUsage = 4821
  const limit = 10000
  const percentage = (currentUsage / limit) * 100

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>Billing & Usage</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 40 }}>Manage your subscription and monitor API usage.</p>

      <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 32, marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#00e87b', fontWeight: 600, marginBottom: 8 }}>Current Plan</div>
            <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Free</div>
            <div style={{ color: '#888', fontSize: 14 }}>10,000 requests / month</div>
          </div>
          <button style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#f0f0f0', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            Manage billing
          </button>
        </div>

        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Screenshots used</div>
          <div style={{ fontSize: 14, color: '#888' }}><span style={{ color: '#f0f0f0', fontWeight: 500 }}>{currentUsage.toLocaleString()}</span> / {limit.toLocaleString()}</div>
        </div>
        
        <div style={{ height: 8, background: '#1a1a24', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ height: '100%', width: `${percentage}%`, background: '#00e87b', borderRadius: 4 }} />
        </div>
        
        <div style={{ fontSize: 12, color: '#444' }}>Usage resets on May 1, 2026</div>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Available Plans</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div style={{ background: '#050505', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Starter</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>$29<span style={{ fontSize: 14, color: '#888', fontWeight: 400 }}>/mo</span></div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', fontSize: 13, color: '#888', flex: 1 }}>
            <li style={{ marginBottom: 8 }}>✓ 50,000 requests</li>
            <li style={{ marginBottom: 8 }}>✓ Email support</li>
            <li>✓ 7-day log retention</li>
          </ul>
          <button style={{ width: '100%', background: '#111', color: '#f0f0f0', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Upgrade to Starter</button>
        </div>

        <div style={{ background: '#050505', border: '1px solid rgba(0,232,123,0.3)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -10, right: 24, background: '#00e87b', color: '#000', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Popular</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Pro</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>$99<span style={{ fontSize: 14, color: '#888', fontWeight: 400 }}>/mo</span></div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', fontSize: 13, color: '#888', flex: 1 }}>
            <li style={{ marginBottom: 8, color: '#f0f0f0' }}>✓ 250,000 requests</li>
            <li style={{ marginBottom: 8 }}>✓ Priority support</li>
            <li style={{ marginBottom: 8 }}>✓ 30-day log retention</li>
            <li>✓ Custom webhooks</li>
          </ul>
          <button style={{ width: '100%', background: '#00e87b', color: '#000', border: 'none', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Upgrade to Pro</button>
        </div>

        <div style={{ background: '#050505', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Scale</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>$399<span style={{ fontSize: 14, color: '#888', fontWeight: 400 }}>/mo</span></div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', fontSize: 13, color: '#888', flex: 1 }}>
            <li style={{ marginBottom: 8 }}>✓ 1,500,000 requests</li>
            <li style={{ marginBottom: 8 }}>✓ 24/7 Slack support</li>
            <li style={{ marginBottom: 8 }}>✓ 90-day log retention</li>
            <li>✓ Dedicated IPs</li>
          </ul>
          <button style={{ width: '100%', background: '#111', color: '#f0f0f0', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Upgrade to Scale</button>
        </div>
      </div>
    </div>
  )
}
