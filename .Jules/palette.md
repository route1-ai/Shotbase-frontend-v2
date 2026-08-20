## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-03-31 - [2-Step Inline Confirmation for Destructive Actions]
**Learning:** For destructive actions like deleting webhook endpoints, inline two-step confirmation ("Delete" -> "Confirm delete?") with a timed auto-reset (e.g. 3 seconds) prevents accidental data loss without disrupting user flow with heavy modal dialogs.
**Action:** Use inline state transitions with timer cleanup (`useRef` + `useEffect`) and dynamic `aria-label` screen reader announcements for lightweight destructive action confirmation.
