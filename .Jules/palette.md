## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-03-31 - [Inline 2-Step Confirmation for Destructive Actions]
**Learning:** Destructive inline actions (such as deleting webhook endpoints or API keys) should feature a 2-step confirmation with a timed auto-reset (3s) rather than immediate deletion or disruptive modal popups. Dynamic ARIA labels reflecting confirmation states ensure screen readers accurately announce the pending action.
**Action:** Apply a timed 2-step inline confirmation pattern (`Delete` -> `Confirm delete?`) with `useRef` timer tracking, `useEffect` unmount cleanup, and dynamic `aria-label` updates on destructive list actions.
