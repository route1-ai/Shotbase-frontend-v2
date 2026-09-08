## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-03-31 - [Inline Destructive Action Confirmations]
**Learning:** Destructive actions (e.g. deleting endpoints or API keys) should use 2-step inline confirmation states ("Delete" -> "Confirm delete?") with auto-reset timers (e.g., 3s) rather than abrupt single-click deletions or disruptive modal dialogs.
**Action:** Implement inline confirmation toggles with dynamic `aria-label` updates and timer unmount cleanups for non-modal destructive UI actions.
