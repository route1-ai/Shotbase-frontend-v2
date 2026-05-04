"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const active = pathname === href
  
  return (
    <Link href={href} style={{ display: 'block', padding: '10px 16px', background: active ? 'rgba(0,232,123,0.08)' : 'none', color: active ? '#00e87b' : '#888', borderRadius: 8, fontSize: 13, textDecoration: 'none', transition: 'all 0.15s', fontWeight: active ? 500 : 400, marginBottom: 4 }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#f0f0f0'; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#888'; }}}>
      {label}
    </Link>
  )
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: '#050505', color: '#f0f0f0' }}>
      <div style={{ width: 260, borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', padding: '24px 16px' }}>
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#888', fontSize: 13, textDecoration: 'none', marginBottom: 32, padding: '0 8px' }} onMouseEnter={e => e.currentTarget.style.color = '#f0f0f0'} onMouseLeave={e => e.currentTarget.style.color = '#888'}>
          ← Back to Dashboard
        </Link>
        
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#444', fontWeight: 600, padding: '0 8px', marginBottom: 12 }}>Account Settings</div>
        
        <nav>
          <NavItem href="/account/profile" label="Profile" />
          <NavItem href="/account/billing" label="Billing" />
          <NavItem href="/account/security" label="Security" />
          <NavItem href="/account/preferences" label="Preferences" />
        </nav>
      </div>
      
      <div style={{ flex: 1, padding: '48px 64px', maxWidth: 800 }}>
        {children}
      </div>
    </div>
  )
}
