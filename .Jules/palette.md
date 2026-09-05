## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-03-31 - [Inline Confirmation Pattern for Destructive Webhook Actions]
**Learning:** Instant deletion of configuration items like webhooks leads to accidental data loss. A 2-step inline confirmation pattern ("Delete" -> "Confirm delete?") with a timed auto-reset timer and `aria-live="polite"` region provides a low-friction safeguard without disruptive modal dialogs.
**Action:** Use 2-step timed inline confirmation buttons with `useRef` timer tracking, clean `useEffect` unmount cleanup, and dynamic `aria-label` updates for destructive inline actions.
