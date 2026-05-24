"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"

// ----- Shell tokens -----
const SIDEBAR_W = 240
const SIDEBAR_W_COLLAPSED = 56
const TOPBAR_H = 56
const BORDER = "rgba(255,255,255,0.07)"
const HOVER_BG = "rgba(255,255,255,0.04)"
const ACTIVE_BG = "rgba(0,232,123,0.08)"
const ACTIVE_FG = "#00e87b"
const IDLE_FG = "#888"

// ----- Nav structure (PLAN.md §3.5) -----
type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  external?: boolean
}

const ICON = {
  overview: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>,
  playground: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4.5 3.5l7 4.5-7 4.5V3.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  keys: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.3"/><path d="M9.5 8H14.5M12.5 6.5V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  integrations: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 2v3M12 2v3M2 6h12M4 14h8a2 2 0 002-2V6H2v6a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  logs: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  webhooks: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="4" cy="11" r="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="4" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M6.5 5.5L5 9M9.5 5.5L11 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  usage: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 13V8M6 13V3M10 13v-7M14 13v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  templates: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>,
  explorer: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4l3 4-3 4M8 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  insights: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12l4-5 3 3 5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="14" cy="3" r="1.5" fill="currentColor"/></svg>,
  trust: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5l5 2v4.5c0 2.8-2.2 5.3-5 6-2.8-.7-5-3.2-5-6V3.5l5-2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  docs: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2.5h7l3 3v8H3v-11zM10 2.5v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5.5 8h5M5.5 11h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  discord: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 13c1 .5 2 .8 3 1l.6-1.2c-1-.3-1.6-.6-2-.8.2 0 .4-.2.6-.3 2 1 4 1 6 0 .2.1.4.3.6.3-.4.2-1 .5-2 .8L10 14c1-.2 2-.5 3-1 .5-3-.5-6-2-7.5L9 6.5h-2L6 5.5C4.5 7 3.5 10 3 13z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  external: <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}><path d="M3 1h6v6M9 1L1 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M8 1v2M8 13v2M14 8h-2M3 8H1M12.2 3.8l-1.4 1.4M5.2 10.8l-1.4 1.4M12.2 12.2l-1.4-1.4M5.2 5.2L3.8 3.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  chevron: (open: boolean) => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }}>
      <path d="M3 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "OVERVIEW",
    items: [
      { href: "/dashboard", label: "Overview", icon: ICON.overview },
      { href: "/dashboard/playground", label: "Playground", icon: ICON.playground },
    ],
  },
  {
    label: "DEVELOP",
    items: [
      { href: "/dashboard/keys", label: "Keys", icon: ICON.keys },
      { href: "/dashboard/integrations", label: "Integrations", icon: ICON.integrations },
      { href: "/dashboard/templates", label: "Templates", icon: ICON.templates },
      { href: "/dashboard/api-explorer", label: "API Explorer", icon: ICON.explorer },
    ],
  },
  {
    label: "MONITOR",
    items: [
      { href: "/dashboard/logs", label: "Activity", icon: ICON.logs },
      { href: "/dashboard/webhooks", label: "Webhooks", icon: ICON.webhooks },
      { href: "/dashboard/usage", label: "Usage", icon: ICON.usage },
      { href: "/dashboard/insights", label: "Insights", icon: ICON.insights },
    ],
  },
  {
    label: "RESOURCES",
    items: [
      { href: "/dashboard/trust", label: "Trust Center", icon: ICON.trust },
      { href: "/docs", label: "Docs", icon: ICON.docs, external: true },
      { href: "https://discord.gg/shotbase", label: "Discord", icon: ICON.discord, external: true },
    ],
  },
]

const SETTINGS_ITEMS: NavItem[] = [
  { href: "/dashboard/settings/profile", label: "Profile", icon: <span /> },
  { href: "/dashboard/settings/billing", label: "Billing", icon: <span /> },
  { href: "/dashboard/settings/security", label: "Security", icon: <span /> },
  { href: "/dashboard/settings/notifications", label: "Notifications", icon: <span /> },
]

// Breadcrumb labels (kept in sync with the IA above)
const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/keys": "Keys",
  "/dashboard/integrations": "Integrations",
  "/dashboard/logs": "Logs",
  "/dashboard/webhooks": "Webhooks",
  "/dashboard/usage": "Usage",
  "/dashboard/trust": "Trust Center",
  "/dashboard/settings": "Settings",
  "/dashboard/settings/profile": "Profile",
  "/dashboard/settings/billing": "Billing",
  "/dashboard/settings/security": "Security",
  "/dashboard/settings/notifications": "Notifications",
}

function SidebarLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem
  active: boolean
  collapsed: boolean
}) {
  const [hover, setHover] = useState(false)
  const fg = active ? ACTIVE_FG : hover ? "#f0f0f0" : IDLE_FG
  const bg = active ? ACTIVE_BG : hover ? HOVER_BG : "transparent"

  const inner = (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: collapsed ? "9px 0" : "9px 12px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: 7,
        color: fg,
        background: bg,
        fontFamily: "var(--font-inter)",
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        transition: "background 0.15s, color 0.15s",
        cursor: "pointer",
        textDecoration: "none",
        marginBottom: 2,
      }}
      title={collapsed ? item.label : undefined}
    >
      <span style={{ display: "flex", opacity: active ? 1 : 0.75 }}>{item.icon}</span>
      {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
      {!collapsed && item.external && <span style={{ color: "#444" }}>{ICON.external}</span>}
    </div>
  )

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
        {inner}
      </a>
    )
  }
  return (
    <Link href={item.href} style={{ textDecoration: "none" }}>
      {inner}
    </Link>
  )
}

function SettingsGroup({ collapsed, pathname }: { collapsed: boolean; pathname: string }) {
  const isInsideSettings = pathname.startsWith("/dashboard/settings")
  const [open, setOpen] = useState(isInsideSettings)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    if (isInsideSettings) setOpen(true)
  }, [isInsideSettings])

  if (collapsed) {
    return (
      <Link
        href="/dashboard/settings/profile"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "9px 0",
          borderRadius: 7,
          color: isInsideSettings ? ACTIVE_FG : IDLE_FG,
          background: isInsideSettings ? ACTIVE_BG : "transparent",
          textDecoration: "none",
          marginBottom: 2,
        }}
        title="Settings"
      >
        {ICON.settings}
      </Link>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "9px 12px",
          width: "100%",
          borderRadius: 7,
          color: isInsideSettings ? ACTIVE_FG : hover ? "#f0f0f0" : IDLE_FG,
          background: isInsideSettings ? ACTIVE_BG : hover ? HOVER_BG : "transparent",
          fontFamily: "var(--font-inter)",
          fontSize: 13,
          fontWeight: isInsideSettings ? 500 : 400,
          border: "none",
          cursor: "pointer",
          transition: "background 0.15s, color 0.15s",
          textAlign: "left",
          marginBottom: 2,
        }}
      >
        <span style={{ display: "flex", opacity: isInsideSettings ? 1 : 0.75 }}>{ICON.settings}</span>
        <span style={{ flex: 1 }}>Settings</span>
        {ICON.chevron(open)}
      </button>
      {open && (
        <div style={{ paddingLeft: 22, marginTop: 2 }}>
          {SETTINGS_ITEMS.map((s) => {
            const active = pathname === s.href || pathname.startsWith(s.href + "/")
            return (
              <SidebarLink key={s.href} item={s} active={active} collapsed={false} />
            )
          })}
          <div style={{ padding: "8px 12px", fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444", display: "flex", alignItems: "center", gap: 8 }}>
            Team
            <span style={{ fontSize: 9, background: "#1a1a24", padding: "2px 6px", borderRadius: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em" }}>Soon</span>
          </div>
        </div>
      )}
    </div>
  )
}

function UserMenu() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [open, setOpen] = useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "user@example.com"
  const firstLetter = email.charAt(0).toUpperCase()

  // Close on outside click and on Escape.
  // Using a document-level mousedown listener instead of a "fixed" backdrop
  // div, because the top bar uses `backdrop-filter: blur(20px)` which creates
  // a new stacking context — a `position: fixed` child can't escape it, so a
  // backdrop only covers the 56px header and clicking below it does nothing.
  useEffect(() => {
    if (!open) return
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onMouseDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onMouseDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0 }}
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#00e87b", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 14 }}>
          {firstLetter}
        </div>
      </button>
      {open && (
        <div role="menu" style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, width: 240, background: "#0a0a0a", border: `1px solid ${BORDER}`, borderRadius: 10, padding: 8, zIndex: 100, boxShadow: "0 8px 24px rgba(0,0,0,0.6)" }}>
          <div style={{ padding: "10px 12px", borderBottom: `1px solid ${BORDER}`, marginBottom: 6 }}>
            <div style={{ fontSize: 12, color: "#f0f0f0", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</div>
          </div>
          <Link role="menuitem" href="/dashboard/settings/profile" onClick={() => setOpen(false)} style={{ display: "block", padding: "8px 12px", color: "#888", fontSize: 13, textDecoration: "none", borderRadius: 6 }} onMouseEnter={(e) => { e.currentTarget.style.background = HOVER_BG; e.currentTarget.style.color = "#f0f0f0" }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#888" }}>Profile settings</Link>
          <Link role="menuitem" href="/dashboard/settings/billing" onClick={() => setOpen(false)} style={{ display: "block", padding: "8px 12px", color: "#888", fontSize: 13, textDecoration: "none", borderRadius: 6 }} onMouseEnter={(e) => { e.currentTarget.style.background = HOVER_BG; e.currentTarget.style.color = "#f0f0f0" }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#888" }}>Billing</Link>
          <Link role="menuitem" href="/" onClick={() => setOpen(false)} style={{ display: "block", padding: "8px 12px", color: "#888", fontSize: 13, textDecoration: "none", borderRadius: 6 }} onMouseEnter={(e) => { e.currentTarget.style.background = HOVER_BG; e.currentTarget.style.color = "#f0f0f0" }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#888" }}>Back to marketing site</Link>
          <div style={{ height: 1, background: BORDER, margin: "6px 0" }} />
          <button role="menuitem" onClick={() => signOut({ redirectUrl: "/" })} style={{ width: "100%", textAlign: "left", padding: "8px 12px", color: "#ff6060", fontSize: 13, background: "none", border: "none", cursor: "pointer", borderRadius: 6 }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,96,96,0.08)" }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}>Sign out</button>
        </div>
      )}
    </div>
  )
}

function QuotaWidget() {
  const [usage, setUsage] = useState({ count: 0, plan: "Free", limit: 10000 })
  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((u) => {
        if (u) setUsage({ count: u.count || 0, plan: u.plan || "Free", limit: u.limit || 10000 })
      })
      .catch(() => {})
  }, [])
  const pct = Math.min(100, (usage.count / Math.max(1, usage.limit)) * 100)
  const overHalf = pct > 50
  return (
    <Link
      href="/dashboard/usage"
      style={{
        margin: "10px 14px 6px",
        padding: 12,
        background: "#111",
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        display: "block",
        textDecoration: "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#666", marginBottom: 6 }}>
        <span>{usage.plan} plan</span>
        <span style={{ color: pct > 80 ? "#ff9060" : "#00e87b" }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: pct > 80 ? "#ff9060" : "#00e87b", borderRadius: 2 }} />
      </div>
      <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: overHalf ? "#888" : "#444" }}>
        {usage.count.toLocaleString()} / {usage.limit.toLocaleString()} requests
      </div>
    </Link>
  )
}

function Logo({ collapsed }: { collapsed: boolean }) {
  return (
    <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "20px 14px 16px" : "20px 16px 16px", textDecoration: "none", justifyContent: collapsed ? "center" : "flex-start" }}>
      <div style={{ width: 26, height: 26, background: "#00e87b", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {/* Viewfinder / capture-bracket mark — four corner brackets + shutter dot. */}
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2.5 4.5V2.5H4.5"   stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11.5 2.5H13.5V4.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2.5 11.5V13.5H4.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11.5 13.5H13.5V11.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="8" cy="8" r="1.7" fill="#000" />
        </svg>
      </div>
      {!collapsed && (
        <span style={{ fontFamily: "var(--font-ibm-plex)", fontWeight: 600, fontSize: 14, color: "#f0f0f0" }}>shotbase</span>
      )}
    </Link>
  )
}

function Breadcrumbs({ pathname }: { pathname: string }) {
  const parts: { href: string; label: string }[] = []
  // Walk down the path and emit breadcrumb segments
  const segments = pathname.split("/").filter(Boolean)
  let acc = ""
  for (const s of segments) {
    acc += "/" + s
    if (ROUTE_LABELS[acc]) parts.push({ href: acc, label: ROUTE_LABELS[acc] })
  }
  if (parts.length === 0 && pathname === "/dashboard") parts.push({ href: "/dashboard", label: "Overview" })

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-ibm-plex)", fontSize: 13 }}>
      <span style={{ color: "#444" }}>shotbase</span>
      {parts.map((p, i) => (
        <React.Fragment key={p.href}>
          <span style={{ color: "#444" }}>/</span>
          <Link href={p.href} style={{ color: i === parts.length - 1 ? "#f0f0f0" : "#888", textDecoration: "none", fontWeight: i === parts.length - 1 ? 500 : 400 }}>
            {p.label}
          </Link>
        </React.Fragment>
      ))}
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/dashboard"
  const [collapsed, setCollapsed] = useState(false)

  // Restore collapsed state from localStorage on mount
  useEffect(() => {
    const v = typeof window !== "undefined" ? window.localStorage.getItem("shotbase_sidebar_collapsed") : null
    if (v === "1") setCollapsed(true)
  }, [])
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("shotbase_sidebar_collapsed", collapsed ? "1" : "0")
    }
  }, [collapsed])

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname === href || pathname.startsWith(href + "/")
  }

  const w = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh", background: "#050505", color: "#f0f0f0" }}>
      {/* ----- Sidebar ----- */}
      <aside
        style={{
          width: w,
          minHeight: "100vh",
          background: "#0a0a0a",
          borderRight: `1px solid ${BORDER}`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          transition: "width 0.18s ease",
          position: "sticky",
          top: 0,
          alignSelf: "flex-start",
          height: "100vh",
        }}
      >
        <Logo collapsed={collapsed} />
        <div style={{ height: 1, background: BORDER, margin: "0 14px 8px" }} />

        <nav style={{ flex: 1, padding: collapsed ? "0 10px" : "0 12px", overflowY: "auto" }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} style={{ marginBottom: 14 }}>
              {!collapsed && (
                <div
                  style={{
                    fontFamily: "var(--font-ibm-plex)",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#444",
                    fontWeight: 600,
                    padding: "8px 12px 6px",
                  }}
                >
                  {group.label}
                </div>
              )}
              {collapsed && <div style={{ height: 12 }} />}
              {group.items.map((item) => (
                <SidebarLink key={item.href + item.label} item={item} active={isActive(item.href)} collapsed={collapsed} />
              ))}
            </div>
          ))}
        </nav>

        {!collapsed && <QuotaWidget />}

        <div style={{ borderTop: `1px solid ${BORDER}`, padding: collapsed ? "8px 10px" : "10px 12px" }}>
          <SettingsGroup collapsed={collapsed} pathname={pathname} />
        </div>

        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            margin: collapsed ? "8px auto" : "8px 12px",
            padding: "6px 10px",
            background: "transparent",
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            color: "#666",
            cursor: "pointer",
            fontSize: 11,
            fontFamily: "var(--font-ibm-plex)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
            <path d="M6.5 1L2.5 5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {!collapsed && <span>Collapse</span>}
        </button>
      </aside>

      {/* ----- Main column ----- */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header
          style={{
            height: TOPBAR_H,
            borderBottom: `1px solid ${BORDER}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            flexShrink: 0,
            background: "rgba(5,5,5,0.85)",
            backdropFilter: "blur(20px)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Breadcrumbs pathname={pathname} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a
              href="https://status.shotbase.dev"
              target="_blank"
              rel="noopener noreferrer"
              title="System status — opens status page"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-ibm-plex)",
                fontSize: 11,
                color: "#888",
                padding: "5px 10px",
                border: `1px solid ${BORDER}`,
                borderRadius: 6,
                textDecoration: "none",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00e87b" }} />
              Operational
            </a>
            <span
              title="Press ⌘K (or Ctrl+K) anywhere — coming in next polish PR"
              style={{
                display: "none",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-ibm-plex)",
                fontSize: 11,
                color: "#666",
                padding: "5px 10px",
                border: `1px solid ${BORDER}`,
                borderRadius: 6,
              }}
            >
              ⌘K
            </span>
            <UserMenu />
          </div>
        </header>

        <main
          style={{
            flex: 1,
            // Playground is full-bleed inside the dashboard shell — no padding.
            padding: pathname.startsWith("/dashboard/playground") ? 0 : "32px 28px",
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
