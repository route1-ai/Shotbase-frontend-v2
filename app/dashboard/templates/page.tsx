"use client"

import React, { useState } from "react"
import Link from "next/link"

const BORDER = "rgba(255,255,255,0.07)"
const ACTIVE_BG = "rgba(0,232,123,0.08)"
const ACTIVE_BORDER = "rgba(0,232,123,0.25)"

const cardStyle: React.CSSProperties = {
  background: "#0a0a0a",
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  padding: 22,
}

type Template = {
  id: string
  name: string
  description: string
  config: { url: string; format: string; width: number; full_page?: boolean; dark_mode?: boolean; block_ads?: boolean }
  category: "starter" | "social" | "marketing" | "ops"
}

// Curated starter templates. Real user templates will be persisted to Supabase later.
const STARTERS: Template[] = [
  {
    id: "social-og",
    name: "OG card · 1200×630",
    description: "Open Graph card dimensions for Twitter/Slack link previews.",
    config: { url: "https://example.com", format: "png", width: 1200 },
    category: "social",
  },
  {
    id: "social-twitter",
    name: "X / Twitter card · 800×418",
    description: "Twitter summary card aspect ratio.",
    config: { url: "https://example.com", format: "jpeg", width: 800 },
    category: "social",
  },
  {
    id: "marketing-hero",
    name: "Marketing hero · retina 2×",
    description: "Crisp 1440×900 capture at 2× DPR. Perfect for landing-page hero showcases.",
    config: { url: "https://stripe.com", format: "png", width: 1440 },
    category: "marketing",
  },
  {
    id: "marketing-mobile",
    name: "Mobile preview · 390×844",
    description: "iPhone 15 viewport for mobile-only marketing screenshots.",
    config: { url: "https://stripe.com", format: "png", width: 390 },
    category: "marketing",
  },
  {
    id: "marketing-full",
    name: "Full-page capture",
    description: "Scrolls the entire page. Use for site audits or before/after diffs.",
    config: { url: "https://vercel.com", format: "png", width: 1440, full_page: true },
    category: "marketing",
  },
  {
    id: "ops-clean",
    name: "Distraction-free capture",
    description: "Ad blocking + cookie banner removal + popup removal — clean every time.",
    config: { url: "https://nytimes.com", format: "png", width: 1440, block_ads: true },
    category: "ops",
  },
  {
    id: "ops-dark",
    name: "Dark-mode capture",
    description: "Sets prefers-color-scheme: dark before render — works on most modern sites.",
    config: { url: "https://github.com", format: "png", width: 1440, dark_mode: true },
    category: "ops",
  },
  {
    id: "ops-pdf",
    name: "PDF archive",
    description: "Full-page PDF — useful for legal archival or compliance snapshots.",
    config: { url: "https://example.com", format: "pdf", width: 1440, full_page: true },
    category: "ops",
  },
]

const CATEGORIES: { id: Template["category"]; label: string }[] = [
  { id: "starter", label: "All" },
  { id: "social", label: "Social cards" },
  { id: "marketing", label: "Marketing" },
  { id: "ops", label: "Ops & archival" },
]

function paramsFromConfig(c: Template["config"]) {
  const sp = new URLSearchParams()
  sp.set("url", c.url)
  sp.set("format", c.format)
  sp.set("width", String(c.width))
  if (c.full_page) sp.set("full", "1")
  if (c.dark_mode) sp.set("dark", "1")
  if (c.block_ads) sp.set("ads", "1")
  return sp.toString()
}

export default function TemplatesPage() {
  const [filter, setFilter] = useState<"all" | Template["category"]>("all")
  const filtered = filter === "all" ? STARTERS : STARTERS.filter((t) => t.category === filter)

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>Templates</h1>
          <p style={{ color: "#888", fontSize: 13 }}>
            Reusable screenshot configurations. Pick a starter, tweak in Playground, save your own.
          </p>
        </div>
        <button
          disabled
          title="Saving custom templates ships once Supabase persistence lands"
          style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, fontWeight: 600, color: "#666", background: "transparent", border: `1px solid ${BORDER}`, padding: "9px 18px", borderRadius: 7, cursor: "not-allowed" }}
        >
          + Save current config
          <span style={{ marginLeft: 8, fontSize: 9, background: "#1a1a24", color: "#666", padding: "2px 6px", borderRadius: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Soon</span>
        </button>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {[{ id: "all", label: "All" }, ...CATEGORIES.slice(1)].map((c) => {
          const active = filter === c.id
          return (
            <button
              key={c.id}
              onClick={() => setFilter(c.id as any)}
              style={{
                fontFamily: "var(--font-ibm-plex)",
                fontSize: 12,
                padding: "6px 14px",
                background: active ? ACTIVE_BG : "transparent",
                border: `1px solid ${active ? ACTIVE_BORDER : BORDER}`,
                borderRadius: 7,
                color: active ? "#00e87b" : "#888",
                cursor: "pointer",
              }}
            >
              {c.label}
            </button>
          )
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
        {filtered.map((t) => (
          <div key={t.id} style={cardStyle}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{t.name}</div>
              <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888", lineHeight: 1.5 }}>{t.description}</div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, padding: "2px 8px", background: "#111", border: `1px solid ${BORDER}`, borderRadius: 4, color: "#888" }}>
                {t.config.format.toUpperCase()}
              </span>
              <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, padding: "2px 8px", background: "#111", border: `1px solid ${BORDER}`, borderRadius: 4, color: "#888" }}>
                {t.config.width}px
              </span>
              {t.config.full_page && (
                <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, padding: "2px 8px", background: "#111", border: `1px solid ${BORDER}`, borderRadius: 4, color: "#888" }}>full-page</span>
              )}
              {t.config.dark_mode && (
                <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, padding: "2px 8px", background: "#111", border: `1px solid ${BORDER}`, borderRadius: 4, color: "#888" }}>dark</span>
              )}
              {t.config.block_ads && (
                <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, padding: "2px 8px", background: "#111", border: `1px solid ${BORDER}`, borderRadius: 4, color: "#888" }}>no ads</span>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link
                href={`/dashboard/playground?${paramsFromConfig(t.config)}`}
                style={{ flex: 1, fontFamily: "var(--font-ibm-plex)", fontSize: 12, fontWeight: 600, color: "#000", background: "#00e87b", border: "none", padding: "8px 14px", borderRadius: 7, textDecoration: "none", textAlign: "center" }}
              >
                Use in Playground →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
