## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-03-30 - [2-Step Inline Confirmation for Destructive Actions]
**Learning:** Destructive actions like API key revocation carry high risk of accidental data loss or breaking external integrations if executed immediately on a single click. A 2-step inline confirmation pattern ("Revoke" -> "Confirm revoke?") with a timed auto-reset (3 seconds), proper `useRef` timer tracking, and dynamic `aria-label` updates prevents accidental triggers without disruptive modal overlays.
**Action:** Always implement 2-step inline confirmations with dynamic ARIA labels and auto-reset timer cleanup for destructive or permanent entity actions.
