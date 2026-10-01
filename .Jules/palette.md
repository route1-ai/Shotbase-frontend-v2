## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Interactive Table Rows and Side Drawer Accessibility]
**Learning:** Interactive table rows that trigger detail drawers are inaccessible to keyboard users unless explicitly given `tabIndex={0}`, `role="button"`, focus indicators, and `Enter`/`Space` handlers. Furthermore, side drawers must support `Escape` key dismissal to provide intuitive modal/overlay UX.
**Action:** Always add keyboard navigation (`tabIndex={0}`, `role="button"`, `Enter`/`Space` keydown handlers, `:focus-visible` styling) to interactive table rows and attach `Escape` keydown listeners on side detail drawers.
