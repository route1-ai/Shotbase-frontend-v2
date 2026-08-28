## 2026-03-30 - [2-Step Inline Confirmation for Destructive Actions]
**Learning:** Destructive actions like deleting webhook endpoints or API keys should use inline confirmation buttons with auto-reset timers (e.g. 3s) and `aria-live="polite"` feedback containers to prevent accidental deletions without disruptive modal dialogs.
**Action:** Implement 2-step inline confirmation buttons with `useRef` timer management, unmount cleanup, and proper ARIA labels for destructive list actions.

## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.
