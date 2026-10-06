## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-10-06 - [2-Step Inline Destructive Confirmation]
**Learning:** Instant 1-click execution for high-impact destructive actions (like revoking production API keys) risks accidental data or service loss. An inline 2-step confirmation ("Revoke" -> "Confirm revoke?") with an auto-reset timer (e.g. 3s) prevents misclicks without disruptive modal dialogs.
**Action:** Use inline 2-step confirmation with `aria-live="polite"` and auto-reset timers for list/table row deletion or revocation actions.
