## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-07-02 - [Radial Timeline Keyboard Accessibility]
**Learning:** Interactive visualizations like orbital timelines must be keyboard accessible. Using semantic `<button>` elements instead of `<div>` ensures native focusability. Combining `onFocus` with "center-on-node" logic provides a delightful experience for keyboard users similar to mouse hover.
**Action:** Always use semantic interactive elements for complex UI components and ensure focus states trigger equivalent visibility/logic as hover states.
