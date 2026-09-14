## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-09-14 - [Inline Delete Confirmation & Scope Constraints]
**Learning:** For destructive actions like deleting webhook endpoints, a 2-step inline confirmation pattern ("Delete" -> "Confirm delete?") with a 3-second auto-reset timer prevents accidental data loss without disruptive modal popups. Dynamic `aria-label` text and `aria-live="polite"` ensure assistive technologies announce state updates seamlessly.
**Action:** Use inline 2-step confirmations with `useRef` timer cleanups for list item deletions, and strictly keep Palette pull requests focused on UI code (<50 lines) without touching dependency files (`package.json`/`package-lock.json`).
