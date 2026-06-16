## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-06-16 - [Keyboard Accessibility and Snap-to-View Interaction]
**Learning:** The "Snap-to-View" interaction pattern for orbital/radial layouts separates focus and selection behaviors: `onFocus` opens detail panels to support non-disorienting keyboard navigation, while explicit `onClick` (from mouse or Enter/Space) triggers centering rotation for visual delight.
**Action:** Use semantic `button` elements for interactive nodes, provide clear `:focus-visible` styles, and implement `Escape` key listeners for modal/overlay content to ensure a robust accessible experience.
