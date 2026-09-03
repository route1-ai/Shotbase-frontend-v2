## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Destructive Action Inline Confirmation & Webhook Accessibility]
**Learning:** Destructive actions like deleting webhook endpoints risk accidental data loss when executed on a single click. Implementing an inline 2-step confirmation pattern ("Delete" -> "Confirm delete?") with an auto-reset timer and an `aria-live="polite"` container protects users from mistakes without disruptive modal overlays.
**Action:** Use inline 2-step confirmation with auto-reset timers (`useRef`) and polite ARIA announcements for destructive inline table/card actions.
