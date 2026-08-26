## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-08-26 - [Interactive Table Rows & Modal Drawer Keyboard Accessibility]
**Learning:** Making table rows interactive buttons for detail side drawers requires assigning `role="button"`, `tabIndex={0}`, `aria-label`, focus visual states, and `onKeyDown` handlers (Enter/Space) to satisfy keyboard and screen reader accessibility guidelines. Additionally, modal side drawers should always register an `Escape` key event listener with proper cleanup.
**Action:** When adding click actions to non-native button elements like `<tr>`, provide full keyboard navigation support and ensure drawers handle `Escape` key dismiss.
