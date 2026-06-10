## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Snap-to-View & Vestibular Accessibility]
**Learning:** For radial or orbital layouts, separating "focus" from "view rotation" is critical for vestibular accessibility. Users navigating via keyboard should be able to see item details on focus without the entire viewport rotating unexpectedly. Rotation should be reserved for explicit "selection" (clicks or Enter/Space).
**Action:** Implement `onFocus` for content expansion and `onClick` for view-centering animations. Ensure interactive nodes are semantic `button` elements with focus-visible indicators.
