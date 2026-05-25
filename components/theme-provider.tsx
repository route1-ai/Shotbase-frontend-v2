'use client'

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'

/**
 * Wraps next-themes for the whole app.
 *
 * Phase 1: defaults to `dark` so the existing dark theme is still the visual
 * default. We are only adding token plumbing here — Phases 2+ migrate
 * components off hardcoded hex to the new CSS variables.
 *
 * `attribute="class"` flips a `.dark` class on <html> (matches how the rest
 * of the codebase already opts into dark via Tailwind).
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
