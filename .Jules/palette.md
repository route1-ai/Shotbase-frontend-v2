## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-10-05 - [Keyboard Accessibility for Activity Log Table Rows & Side Drawer]
**Learning:** Table rows (`<tr>`) that trigger side detail drawers should retain native row semantics (`role="row"`) while supporting full keyboard focus (`tabIndex={0}`), keyboard selection (`onKeyDown` for Enter & Space), and focus feedback. Side drawers must attach an 'Escape' key listener to allow seamless keyboard dismissal.
**Action:** When making data rows interactive, always provide `tabIndex={0}`, keyboard handlers, focus feedback, and ensure overlay drawers listen for 'Escape'.
