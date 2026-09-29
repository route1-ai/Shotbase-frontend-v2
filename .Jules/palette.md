## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-20 - [Interactive Table Rows and Side Drawer Keyboard Navigation]
**Learning:** When interactive table rows (`<tr>`) trigger detail side drawers, preserving native `role="row"` with explicit `tabIndex={0}`, focus visual indicators (`focus-visible:ring-1`), `aria-label`, and `Escape` key drawer dismissal provides full keyboard and screen reader accessibility without breaking table semantics.
**Action:** Always pair interactive table rows with keyboard listeners (`Enter`/`Space`) and attach an `Escape` key listener on side drawer overlay containers.
