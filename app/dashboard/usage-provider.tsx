"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { usePathname } from "next/navigation"

// ── Single source of truth for account usage ────────────────────────────────
// Both the sidebar QuotaWidget and the /dashboard/usage page read from this one
// provider instead of each fetching /api/usage independently. Previously the
// sidebar widget lived in the persistent dashboard layout and fetched once on
// mount (never revalidating), so it drifted stale versus the usage page (which
// re-fetches on every navigation). Sharing one state guarantees they can never
// show different numbers, and the provider revalidates on navigation + tab
// focus so the number stays fresh.

export type Meter = { used: number; limit: number }
export type Usage =
  | { available: true; plan: string; captures: Meter; ai_extractions: Meter }
  | { available: false }

function isMeter(m: unknown): m is Meter {
  return !!m && typeof (m as Meter).used === "number" && typeof (m as Meter).limit === "number"
}

// Fetch + normalize the usage response. Returns data (never sets state), so the
// caller can `.then(setState)` in an effect without a synchronous setState.
async function loadUsage(): Promise<Usage> {
  try {
    const res = await fetch("/api/usage", { cache: "no-store" })
    const u = await res.json()
    if (u && u.available === true && isMeter(u.captures) && isMeter(u.ai_extractions)) {
      return { available: true, plan: u.plan || "free", captures: u.captures, ai_extractions: u.ai_extractions }
    }
    return { available: false }
  } catch {
    return { available: false }
  }
}

// null = still loading (first fetch in flight); otherwise the resolved usage.
const UsageContext = createContext<Usage | null>(null)

export function UsageProvider({ children }: { children: React.ReactNode }) {
  const [usage, setUsage] = useState<Usage | null>(null)
  const pathname = usePathname()

  // Revalidate on first mount and on every dashboard navigation. setState only
  // happens in the async continuation, never synchronously in the effect body.
  useEffect(() => {
    let cancelled = false
    loadUsage().then((u) => { if (!cancelled) setUsage(u) })
    return () => { cancelled = true }
  }, [pathname])

  // Revalidate when the tab regains focus / becomes visible — covers captures
  // made while the user sits on a single page without navigating.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") loadUsage().then(setUsage)
    }
    window.addEventListener("focus", onVisible)
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      window.removeEventListener("focus", onVisible)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  return <UsageContext.Provider value={usage}>{children}</UsageContext.Provider>
}

// Returns the shared usage: null while the first fetch is in flight, otherwise
// { available: true, ... } or { available: false }.
export function useUsage(): Usage | null {
  return useContext(UsageContext)
}
