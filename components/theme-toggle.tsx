'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor } from 'lucide-react'

type Variant = 'icon' | 'pill'

interface ThemeToggleProps {
  /** Visual variant: bare icon button (default) or labeled pill. */
  variant?: Variant
  /** Optional className to merge into the outer element. */
  className?: string
}

/**
 * Cycles light → dark → system on click.
 *
 * Renders a placeholder during SSR / pre-hydration to avoid the hydration
 * mismatch that next-themes warns about (the server has no idea which theme
 * the user has stored). Once mounted, the real icon swaps in.
 */
export function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Pre-mount: render a same-shape spacer so layout doesn't shift.
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={
          variant === 'pill'
            ? `inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-1.5 text-xs text-[#888899] ${className}`
            : `inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-[#888899] ${className}`
        }
        suppressHydrationWarning
      >
        <span className="block h-4 w-4" aria-hidden />
      </button>
    )
  }

  const next = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'

  // Pick which icon to show. While `theme === 'system'`, surface the
  // resolved theme's icon so the button reflects what's actually rendered.
  const active = theme === 'system' ? resolvedTheme : theme
  const Icon =
    theme === 'system' ? Monitor : active === 'dark' ? Moon : Sun

  const label =
    theme === 'system' ? 'System' : active === 'dark' ? 'Dark' : 'Light'

  const cycle = () => setTheme(next)

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={cycle}
        aria-label={`Switch theme (current: ${label})`}
        title={`Theme: ${label} — click to cycle`}
        className={`inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-1.5 text-xs text-[#c8c8d4] transition-colors hover:border-white/20 hover:text-[#ececec] ${className}`}
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
      aria-label={`Switch theme (current: ${label})`}
      title={`Theme: ${label} — click to cycle`}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-[#c8c8d4] transition-colors hover:border-white/20 hover:text-[#ececec] ${className}`}
    >
      <Icon size={14} strokeWidth={1.6} />
    </button>
  )
}
