"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useUser, useClerk } from "@clerk/nextjs"

const LOGS = [
  { id: 'req_9xkp2', url: 'https://stripe.com', status: 200, ms: 142, format: 'png', cached: true, ts: '2m ago', size: '284 KB' },
  { id: 'req_8qmn1', url: 'https://vercel.com/dashboard', status: 200, ms: 891, format: 'png', cached: false, ts: '7m ago', size: '512 KB' },
  { id: 'req_7xlt3', url: 'https://linear.app', status: 200, ms: 178, format: 'jpeg', cached: true, ts: '12m ago', size: '198 KB' },
  { id: 'req_6bnq9', url: 'https://github.com/torvalds/linux', status: 200, ms: 1240, format: 'pdf', cached: false, ts: '18m ago', size: '1.1 MB' },
  { id: 'req_5pxk2', url: 'https://news.ycombinator.com', status: 200, ms: 201, format: 'png', cached: false, ts: '31m ago', size: '88 KB' },
  { id: 'req_4mnb7', url: 'https://figma.com', status: 429, ms: 0, format: 'png', cached: false, ts: '44m ago', size: '—' },
  { id: 'req_3xqp1', url: 'https://openai.com', status: 200, ms: 334, format: 'png', cached: false, ts: '1h ago', size: '421 KB' },
  { id: 'req_2kln5', url: 'https://tailwindcss.com/docs', status: 200, ms: 155, format: 'png', cached: true, ts: '2h ago', size: '310 KB' },
]

const KEYS = [
  { id: 'key_prod_9xkp', name: 'Production', key: 'sk-live-9xkp2q8mnt3rLp...', created: 'Apr 12, 2026', last: '2m ago', requests: 4821, active: true },
  { id: 'key_dev_3mnb', name: 'Development', key: 'sk-live-3mnb7qxp2k8rNt...', created: 'Mar 28, 2026', last: '2d ago', requests: 213, active: true },
  { id: 'key_test_1xqp', name: 'Test (revoked)', key: 'sk-live-1xqp5kln2m8rBv...', created: 'Jan 5, 2026', last: '—', requests: 88, active: false },
]

const CHART_DATA = [12,28,19,44,61,38,72,55,90,78,103,88,120,98,134,115,142,128,160,145,172,158,188,174]

const S = {
  sidebar: { width: 220, minHeight: '100vh', background: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex' as const, flexDirection: 'column' as const, flexShrink: 0 },
  main: { flex: 1, display: 'flex' as const, flexDirection: 'column' as const, minWidth: 0 },
  topbar: { height: 56, borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, padding: '0 28px', flexShrink: 0, background: 'rgba(5,5,5,0.7)', backdropFilter: 'blur(10px)', position: 'sticky' as const, top: 0, zIndex: 10 },
  content: { flex: 1, padding: '32px 28px', overflow: 'auto' as const },
  card: { background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 24 },
  metricCard: { background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '20px 24px' },
  tag: (color: string) => ({ display: 'inline-flex' as const, alignItems: 'center' as const, fontFamily: 'var(--font-ibm-plex)', fontSize: 11, padding: '2px 8px', borderRadius: 4, background: color === 'green' ? 'rgba(0,232,123,0.1)' : color === 'red' ? 'rgba(255,60,60,0.1)' : 'rgba(255,255,255,0.05)', color: color === 'green' ? '#00e87b' : color === 'red' ? '#ff6060' : '#888', border: `1px solid ${color === 'green' ? 'rgba(0,232,123,0.2)' : color === 'red' ? 'rgba(255,60,60,0.2)' : 'rgba(255,255,255,0.07)'}` }),
}

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 20px 16px' }}>
      <div style={{ width: 26, height: 26, background: '#00e87b', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="14" height="10" rx="2" stroke="#000" strokeWidth="1.5"/>
          <path d="M4 14h8M8 11v3" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <span style={{ fontFamily: 'var(--font-ibm-plex)', fontWeight: 600, fontSize: 14, color: '#f0f0f0' }}>shotbase</span>
    </div>
  )
}

function NavItem({ icon, label, active, onClick, badge }: any) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 16px', background: active ? 'rgba(0,232,123,0.08)' : 'none', border: 'none', borderRadius: 7, cursor: 'pointer', color: active ? '#00e87b' : '#888', fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: active ? 500 : 400, textAlign: 'left', transition: 'all 0.15s', marginBottom: 2 }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#f0f0f0'; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#888'; }}}>
      <span style={{ opacity: active ? 1 : 0.6 }}>{icon}</span>
      {label}
      {badge && <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-ibm-plex)', fontSize: 10, background: '#00e87b', color: '#000', padding: '1px 6px', borderRadius: 10, fontWeight: 600 }}>{badge}</span>}
    </button>
  )
}

function MiniChart() {
  const max = Math.max(...CHART_DATA)
  const w = 480, h = 80
  const pts = CHART_DATA.map((v, i) => {
    const x = (i / (CHART_DATA.length - 1)) * w
    const y = h - (v / max) * (h - 8)
    return `${x},${y}`
  }).join(' ')
  const area = `0,${h} ${pts} ${w},${h}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 80 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00e87b" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#00e87b" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#cg)"/>
      <polyline points={pts} fill="none" stroke="#00e87b" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

function LogTable({ rows, filter = '' }: any) {
  const filtered = filter ? rows.filter((r: any) => r.url.includes(filter) || r.id.includes(filter) || String(r.status).includes(filter)) : rows
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {['Request ID', 'URL', 'Status', 'Time', 'Format', 'Size', 'When'].map(h => (
            <th key={h} style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#444', fontWeight: 500, textAlign: 'left', padding: '0 0 10px', paddingRight: 16 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filtered.map((r: any, i: number) => (
          <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <td style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#00e87b', padding: '11px 16px 11px 0', whiteSpace: 'nowrap' }}>{r.id}</td>
            <td style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#888', padding: '11px 16px 11px 0', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.url}</td>
            <td style={{ padding: '11px 16px 11px 0' }}>
              <span style={S.tag(r.status === 200 ? 'green' : 'red')}>{r.status}</span>
            </td>
            <td style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#888', padding: '11px 16px 11px 0', whiteSpace: 'nowrap' }}>{r.ms ? `${r.ms}ms` : '—'}</td>
            <td style={{ padding: '11px 16px 11px 0' }}>
              <span style={S.tag('default')}>{r.format}</span>
            </td>
            <td style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#888', padding: '11px 16px 11px 0' }}>{r.size}</td>
            <td style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#444', padding: '11px 0 11px 0', whiteSpace: 'nowrap' }}>{r.ts}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function OverviewPage() {
  const metrics = [
    { label: 'Screenshots this month', value: '4,821', delta: '+12%', sub: '500 free · 4,321 paid' },
    { label: 'Avg response time', value: '187ms', delta: '−23ms', sub: 'vs last 30 days' },
    { label: 'Cache hit rate', value: '64%', delta: '+8%', sub: 'sub-200ms served' },
    { label: 'Success rate', value: '99.4%', delta: 'stable', sub: '28 errors this month' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 6 }}>Overview</h1>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 28 }}>April 2026 · Free plan · Route1AI workspace</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {metrics.map((m, i) => (
          <div key={i} style={S.metricCard}>
            <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{m.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em' }}>{m.value}</span>
              <span style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: m.delta.startsWith('+') || m.delta.startsWith('−') && m.delta.includes('ms') ? (m.delta.startsWith('+') ? '#00e87b' : '#ff9060') : m.delta === 'stable' ? '#444' : '#00e87b' }}>{m.delta}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#444' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ ...S.card, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>Request volume</div>
            <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#444' }}>Last 24 hours · hourly</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['24h', '7d', '30d'].map(t => (
              <button key={t} style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, padding: '5px 10px', background: t === '24h' ? 'rgba(0,232,123,0.1)' : 'none', border: `1px solid ${t === '24h' ? 'rgba(0,232,123,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 6, color: t === '24h' ? '#00e87b' : '#444', cursor: 'pointer' }}>{t}</button>
            ))}
          </div>
        </div>
        <MiniChart/>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-ibm-plex)', fontSize: 10, color: '#444', marginTop: 8 }}>
          {['00:00','04:00','08:00','12:00','16:00','20:00','Now'].map(t => <span key={t}>{t}</span>)}
        </div>
      </div>

      <div style={S.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 500, fontSize: 14 }}>Recent requests</div>
          <button style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, color: '#00e87b', background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
        </div>
        <LogTable rows={LOGS.slice(0, 5)} />
      </div>
    </div>
  )
}

function ApiKeysPage() {
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [keys, setKeys] = useState(KEYS)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [revoking, setRevoking] = useState<string | null>(null)

  const createKey = () => {
    if (!newName.trim()) return
    const newKey = { id: `key_new_${Date.now()}`, name: newName, key: `sk-live-${Math.random().toString(36).slice(2, 10)}...`, created: 'Apr 23, 2026', last: 'Never', requests: 0, active: true }
    setKeys([newKey, ...keys])
    setShowNew(false)
    setNewName('')
  }

  const revokeKey = (id: string) => {
    setRevoking(id)
    setTimeout(() => {
      setKeys(ks => ks.map(k => k.id === id ? { ...k, active: false, name: k.name + ' (revoked)' } : k))
      setRevoking(null)
    }, 800)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 6 }}>API Keys</h1>
          <p style={{ color: '#888', fontSize: 13 }}>Manage your API keys. Keep them secret — treat like passwords.</p>
        </div>
        <button onClick={() => setShowNew(true)} style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, fontWeight: 600, color: '#000', background: '#00e87b', border: 'none', padding: '9px 18px', borderRadius: 7, cursor: 'pointer' }}>+ Create key</button>
      </div>

      {showNew && (
        <div style={{ ...S.card, marginBottom: 16, border: '1px solid rgba(0,232,123,0.2)' }}>
          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 16 }}>New API key</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Key name (e.g. Production)" onKeyDown={e => e.key === 'Enter' && createKey()}
              style={{ flex: 1, fontFamily: 'var(--font-ibm-plex)', fontSize: 13, background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: '9px 14px', color: '#f0f0f0', outline: 'none' }}/>
            <button onClick={createKey} style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, fontWeight: 600, color: '#000', background: '#00e87b', border: 'none', padding: '9px 18px', borderRadius: 7, cursor: 'pointer' }}>Create</button>
            <button onClick={() => setShowNew(false)} style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, color: '#888', background: 'none', border: '1px solid rgba(255,255,255,0.07)', padding: '9px 14px', borderRadius: 7, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={S.card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Name', 'Key', 'Created', 'Last used', 'Requests', ''].map(h => (
                <th key={h} style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#444', fontWeight: 500, textAlign: 'left', padding: '0 0 12px', paddingRight: 16 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keys.map((k, i) => (
              <tr key={k.id} style={{ borderBottom: i < keys.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none', opacity: k.active ? 1 : 0.4 }}>
                <td style={{ padding: '14px 16px 14px 0' }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{k.name}</div>
                </td>
                <td style={{ padding: '14px 16px 14px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <code style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, color: '#888' }}>{revealed[k.id] ? k.key.replace('...', 'xxxxxxxx') : k.key}</code>
                    {k.active && <button onClick={() => setRevealed(r => ({ ...r, [k.id]: !r[k.id] }))} style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 10, color: '#444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{revealed[k.id] ? 'hide' : 'show'}</button>}
                  </div>
                </td>
                <td style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, color: '#888', padding: '14px 16px 14px 0', whiteSpace: 'nowrap' }}>{k.created}</td>
                <td style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, color: '#888', padding: '14px 16px 14px 0', whiteSpace: 'nowrap' }}>{k.last}</td>
                <td style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, color: '#888', padding: '14px 16px 14px 0' }}>{k.requests.toLocaleString()}</td>
                <td style={{ padding: '14px 0', textAlign: 'right' }}>
                  {k.active && (
                    <button onClick={() => revokeKey(k.id)} style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: revoking === k.id ? '#444' : '#ff6060', background: 'none', border: '1px solid', borderColor: revoking === k.id ? 'rgba(255,255,255,0.07)' : 'rgba(255,60,60,0.2)', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s' }}>{revoking === k.id ? 'Revoking…' : 'Revoke'}</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#444', lineHeight: 1.7 }}>
        <span style={{ color: '#00e87b' }}>→</span> Secret keys are shown once. Store them securely — we cannot recover them.<br/>
        <span style={{ color: '#00e87b' }}>→</span> Revoking a key immediately invalidates all requests using it.
      </div>
    </div>
  )
}

function LogsPage() {
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const filtered = LOGS.filter(r => {
    const matchStatus = statusFilter === 'all' || (statusFilter === 'ok' && r.status === 200) || (statusFilter === 'err' && r.status !== 200)
    const matchText = !filter || r.url.includes(filter) || r.id.includes(filter)
    return matchStatus && matchText
  })

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 6 }}>Request Logs</h1>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Real-time request history. 30-day retention on Pro plan.</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter by URL or request ID…"
          style={{ flex: 1, fontFamily: 'var(--font-ibm-plex)', fontSize: 12, background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: '9px 14px', color: '#f0f0f0', outline: 'none' }}/>
        {['all', 'ok', 'err'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, padding: '8px 14px', background: statusFilter === s ? 'rgba(0,232,123,0.1)' : '#0a0a0a', border: `1px solid ${statusFilter === s ? 'rgba(0,232,123,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 7, color: statusFilter === s ? '#00e87b' : '#888', cursor: 'pointer' }}>
            {s === 'all' ? 'All' : s === 'ok' ? '2xx' : 'Errors'}
          </button>
        ))}
        <button style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, padding: '8px 14px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, color: '#888', cursor: 'pointer' }}>↓ Export</button>
      </div>

      <div style={S.card}>
        <LogTable rows={filtered} />
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: 'var(--font-ibm-plex)', fontSize: 12, color: '#444' }}>No logs match your filter.</div>}
      </div>

      <div style={{ marginTop: 12, fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#444', display: 'flex', justifyContent: 'space-between' }}>
        <span>Showing {filtered.length} of {LOGS.length} requests</span>
        <span>Live · updates every 10s</span>
      </div>
    </div>
  )
}

function UserMenu() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [open, setOpen] = useState(false)
  
  const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? "user@example.com"
  const firstLetter = userEmail.charAt(0).toUpperCase()

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#00e87b', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14 }}>
          {firstLetter}
        </div>
      </button>

      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 220, background: '#050505', border: '1px solid #1a1a24', borderRadius: 8, padding: 8, zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #1a1a24', marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: '#f0f0f0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</div>
          </div>
          
          <Link href="/account/profile" style={{ display: 'block', padding: '8px 12px', color: '#888', fontSize: 13, textDecoration: 'none', borderRadius: 4 }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#f0f0f0' }} onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#888' }}>Profile settings</Link>
          <Link href="/account/billing" style={{ display: 'block', padding: '8px 12px', color: '#888', fontSize: 13, textDecoration: 'none', borderRadius: 4 }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#f0f0f0' }} onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#888' }}>Billing</Link>
          
          <div style={{ height: 1, background: '#1a1a24', margin: '8px 0' }} />
          
          <button onClick={() => signOut({ redirectUrl: '/' })} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', color: '#ff6060', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 4 }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,96,96,0.1)' }} onMouseLeave={e => { e.currentTarget.style.background = 'none' }}>Sign out</button>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useUser()
  const [page, setPage] = useState('overview')

  const userEmail =
    user?.emailAddresses?.[0]?.emailAddress ?? "—"

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg> },
    { id: 'keys', label: 'API Keys', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="8" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M9.5 8H15M13 6.5V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
    { id: 'logs', label: 'Logs', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>, badge: '8' },
  ]

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: '#050505', color: '#f0f0f0' }}>
      <div style={S.sidebar}>
        <Logo/>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 16px 16px' }}/>
        <nav style={{ padding: '0 10px', flex: 1 }}>
          {navItems.map(n => <NavItem key={n.id} {...n} active={page === n.id} onClick={() => setPage(n.id)}/>)}
        </nav>

        <div style={{ margin: '16px 14px', padding: '14px', background: '#111', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-ibm-plex)', fontSize: 10, color: '#444', marginBottom: 8 }}>
            <span>Monthly usage</span>
            <span style={{ color: '#00e87b' }}>4,821 / 10,000</span>
          </div>
          <div style={{ height: 4, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '48.2%', background: '#00e87b', borderRadius: 2 }}/>
          </div>
          <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 10, color: '#444', marginTop: 8 }}>Free plan · resets May 1</div>
        </div>

        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #00e87b, #00a855)', flexShrink: 0 }}/>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</div>
            <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 10, color: '#444' }}>Free plan</div>
          </div>
        </div>
      </div>

      <div style={S.main}>
        <div style={S.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#444' }}>shotbase</span>
            <span style={{ color: '#444', fontSize: 13 }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{page === 'overview' ? 'Overview' : page === 'keys' ? 'API Keys' : 'Logs'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/docs" style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, color: '#888', background: 'none', border: '1px solid rgba(255,255,255,0.07)', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>Docs</Link>
            <Link href="/playground" style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, color: '#00e87b', background: 'rgba(0,232,123,0.1)', border: '1px solid rgba(0,232,123,0.2)', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>Playground →</Link>
            <Link href="/" style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, color: '#888', background: 'none', border: '1px solid rgba(255,255,255,0.07)', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>← Marketing site</Link>
            <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.07)', margin: '0 4px' }} />
            <UserMenu />
          </div>
        </div>

        <div style={S.content}>
          {page === 'overview' && <OverviewPage/>}
          {page === 'keys' && <ApiKeysPage/>}
          {page === 'logs' && <LogsPage/>}
        </div>
      </div>
    </div>
  )
}
