## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-08-09 - [Accessible Code Copy Elements]
**Learning:** Code snippets that allow click-to-copy but are rendered using non-interactive containers (like `<code>` or `<span>`) must be made focusable and keyboard-triggerable. Without `tabIndex={0}`, `role="button"`, and explicit key listeners for Enter/Space, keyboard-only users cannot access the copy action.
**Action:** When implementing click-to-copy on non-button containers, always add keyboard accessibility (focus states, role, ARIA labels, key down triggers) and ensure focus states are visually clear.
