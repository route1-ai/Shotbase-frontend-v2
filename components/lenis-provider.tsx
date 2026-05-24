"use client"

import { ReactLenis } from "lenis/react"
import { usePathname } from "next/navigation"
import { ReactNode } from "react"

/**
 * Smooth-scroll the landing/marketing pages with Lenis — but NEVER on
 * routes that have their own internal scroll containers (dashboard, auth,
 * onboarding, in-product docs).
 *
 * Lenis configured with `root` hijacks the document-level wheel events and
 * animates body scroll. That fights with `<main overflowY: auto>` inside
 * the dashboard shell: wheel events get preventDefault'd by Lenis before
 * they can reach main, so users see no scrolling and have to manually drag
 * inner scrollbars.
 */
const NO_LENIS_PREFIXES = ["/dashboard", "/onboarding", "/signin", "/signup", "/docs"]

export function LenisProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || ""
  const skipLenis = NO_LENIS_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))

  if (skipLenis) return <>{children}</>

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  )
}
