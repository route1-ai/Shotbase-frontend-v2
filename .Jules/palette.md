## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Interactive Table Rows & Side Drawer Keyboard Accessibility]
**Learning:** Interactive table rows (`<tr>`) that trigger side drawers must preserve native table semantics (`role="row"`) while supporting full keyboard interaction (`tabIndex={0}`, `onKeyDown` for Enter/Space, focus-visible styles) and an `Escape` key event listener on the side drawer overlay to allow intuitive keyboard navigation and dismissal for screen reader and keyboard users.
**Action:** Always complement `onClick` handlers on non-standard interactive containers like table rows with `tabIndex={0}`, keydown handlers for Space/Enter, focus-visible visual indicators, and `Escape` key handling on opened drawer/modal panels.
