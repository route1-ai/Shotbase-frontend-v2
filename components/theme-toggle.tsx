'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun, SunMoon } from 'lucide-react'
import { useShotbaseTheme, type ThemeMode } from '@/components/theme-provider'
import { nextFlipLabel } from '@/lib/theme-time'

type Variant = 'icon' | 'pill'

interface ThemeToggleProps {
  /** Visual variant: bare icon button (default) or labeled pill. */
  variant?: Variant
  /** Optional className to merge into the outer element. */
  className?: string
}

const CYCLE: Record<ThemeMode, ThemeMode> = {
  light: 'dark',
  dark: 'auto',
  auto: 'light',
}

function iconFor(mode: ThemeMode) {
  if (mode === 'auto') return SunMoon
  if (mode === 'dark') return Moon
  return Sun
}

function labelFor(mode: ThemeMode) {
  if (mode === 'auto') return 'Auto'
  if (mode === 'dark') return 'Dark'
  return 'Light'
}

/**
 * Three-state theme cycle: light → dark → auto → light.
 *
 * Auto mode flips between light and dark based on the user's local
 * clock (06:00–17:59 light, otherwise dark). The tooltip shows when
 * the next automatic flip happens.
 *
 * Renders a same-shape placeholder during SSR / pre-hydration to
 * avoid layout shift and hydration mismatch warnings.
 */
export function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { mode, resolved, setMode, mounted } = useShotbaseTheme()
  const [tooltip, setTooltip] = useState('')

  // Refresh the "flips at 6:00 PM" hint while Auto is selected.
  useEffect(() => {
    if (!mounted) return
    const build = () => {
      if (mode === 'auto') {
        setTooltip(`Auto • currently ${resolved} — flips at ${nextFlipLabel()}`)
      } else if (mode === 'dark') {
        setTooltip('Dark theme — click for Auto')
      } else {
        setTooltip('Light theme — click for Dark')
      }
    }
    build()
    const id = window.setInterval(build, 60 * 1000)
    return () => window.clearInterval(id)
  }, [mode, resolved, mounted])

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={
          variant === 'pill'
            ? `inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs ${className}`
            : `inline-flex h-8 w-8 items-center justify-center rounded-md border ${className}`
        }
        style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--text-muted))' }}
        suppressHydrationWarning
      >
        <span className="block h-4 w-4" aria-hidden />
      </button>
    )
  }

  const Icon = iconFor(mode)
  const label = labelFor(mode)
  const next = CYCLE[mode]

  const cycle = () => setMode(next)

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={cycle}
        aria-label={`Theme: ${label}. Click to switch to ${labelFor(next)}`}
        title={tooltip}
        className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition-colors ${className}`}
        style={{
          borderColor: 'hsl(var(--border))',
          color: 'hsl(var(--text-secondary))',
        }}
      >
        <Icon size={14} strokeWidth={1.6} />
        <span className="font-mono uppercase tracking-wider">{label}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${label}. Click to switch to ${labelFor(next)}`}
      title={tooltip}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:opacity-100 ${className}`}
      style={{
        borderColor: 'hsl(var(--border))',
        color: 'hsl(var(--text-secondary))',
      }}
    >
      <Icon size={14} strokeWidth={1.6} />
    </button>
  )
}
