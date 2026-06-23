## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Accessible Focus Indicators in Dashboard]
**Learning:** In dashboard views with dense, custom-styled interactive lists (like the API Explorer), native focus rings can be clipped or visually jarring. Using `onFocus` and `onBlur` state to apply theme-consistent `outline` styles with `outlineOffset: -1` provides a superior, accessible experience.
**Action:** Implement explicit focus management with `onFocus`/`onBlur` for sidebar-like navigation elements and use brand-aligned tokens like `ACTIVE_BORDER` for focus indicators.
