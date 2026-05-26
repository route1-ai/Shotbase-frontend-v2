'use client'

import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
  type ThemeProviderProps,
} from 'next-themes'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getTimeOfDayTheme, type Resolved } from '@/lib/theme-time'

/* ─── Public API ──────────────────────────────────────────────────────
   Two layers:

   1. next-themes handles the actual `.dark` class on <html> and
      localStorage for `light` / `dark`. We let it do its job.

   2. We layer an "auto" mode on top — when the user picks Auto, we
      store a separate flag in localStorage and drive next-themes'
      theme based on the local clock. Re-evaluates every 5 minutes
      and whenever the tab regains focus.

   Users now have three explicit choices:
     light  — always light
     dark   — always dark
     auto   — light 06:00–17:59, dark otherwise (local time)
   ────────────────────────────────────────────────────────────────── */

export type ThemeMode = 'light' | 'dark' | 'auto'

interface ShotbaseThemeContext {
  /** What the user picked. */
  mode: ThemeMode
  /** What is actually being rendered right now (`auto` → light or dark). */
  resolved: Resolved
  setMode: (mode: ThemeMode) => void
  /** True until the provider has hydrated from localStorage. */
  mounted: boolean
}

const Ctx = createContext<ShotbaseThemeContext | null>(null)

export function useShotbaseTheme(): ShotbaseThemeContext {
  const ctx = useContext(Ctx)
  if (!ctx) {
    throw new Error('useShotbaseTheme must be used inside <ThemeProvider>')
  }
  return ctx
}

const AUTO_KEY = 'shotbase-auto-mode'
const REEVAL_INTERVAL_MS = 5 * 60 * 1000 // 5 min

/**
 * Inner bridge — must live inside the next-themes provider so it can
 * call useTheme(). Reads the auto-mode flag from localStorage, drives
 * next-themes when in auto mode, and exposes our 3-state API.
 */
function AutoBridge({ children }: { children: React.ReactNode }) {
  const { theme: nextTheme, setTheme: setNextTheme, resolvedTheme } = useNextTheme()
  const [auto, setAuto] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Hydrate the auto flag on mount.
  useEffect(() => {
    let isAuto = false
    try {
      isAuto = localStorage.getItem(AUTO_KEY) === '1'
    } catch {
      // localStorage can throw in some embedded contexts.
    }
    setAuto(isAuto)
    if (isAuto) {
      setNextTheme(getTimeOfDayTheme())
    }
    setMounted(true)
  }, [setNextTheme])

  // While auto is on: re-evaluate every 5 minutes + on tab refocus.
  useEffect(() => {
    if (!auto) return

    const tick = () => setNextTheme(getTimeOfDayTheme())

    const intervalId = window.setInterval(tick, REEVAL_INTERVAL_MS)
    const onVisibility = () => {
      if (!document.hidden) tick()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [auto, setNextTheme])

  const setMode = useCallback(
    (mode: ThemeMode) => {
      try {
        if (mode === 'auto') {
          localStorage.setItem(AUTO_KEY, '1')
        } else {
          localStorage.removeItem(AUTO_KEY)
        }
      } catch {
        // Ignore — storage failure shouldn't break the toggle.
      }
      setAuto(mode === 'auto')
      setNextTheme(mode === 'auto' ? getTimeOfDayTheme() : mode)
    },
    [setNextTheme]
  )

  // Pre-hydration we default to dark so SSR matches.
  const resolved: Resolved =
    (resolvedTheme === 'light' || resolvedTheme === 'dark'
      ? resolvedTheme
      : nextTheme === 'light'
      ? 'light'
      : 'dark') as Resolved

  const mode: ThemeMode = auto ? 'auto' : (resolved as ThemeMode)

  return (
    <Ctx.Provider value={{ mode, resolved, setMode, mounted }}>
      {children}
    </Ctx.Provider>
  )
}

/**
 * Wraps the whole app. Keep `themes={['light', 'dark']}` — we explicitly
 * drop next-themes' built-in `system` mode because our auto mode replaces
 * it (and means something different: clock-based, not OS-based).
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      themes={['light', 'dark']}
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      <AutoBridge>{children}</AutoBridge>
    </NextThemesProvider>
  )
}
