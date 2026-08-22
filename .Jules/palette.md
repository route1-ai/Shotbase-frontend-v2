## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-03-30 - [2-Step Inline Destructive Action Confirmation]
**Learning:** Immediate action buttons for destructive operations (such as deleting webhook endpoints) without confirmation lead to accidental loss. Modal dialogs can be disruptive; a 2-step inline confirmation ("Delete" -> "Confirm delete?") with a timed auto-reset timer (3s) provides strong safety without UX friction.
**Action:** Use inline 2-step confirmation with `useRef` timer cleanup and dynamic ARIA labels for destructive card actions.
