## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-06-20 - [Accessible Orbital Navigation]
**Learning:** The 'Snap-to-View' interaction pattern for orbital/radial layouts should separate focus and selection behaviors. Triggering detail panels on focus supports non-disorienting keyboard navigation, while reserving explicit clicks (mouse or Enter/Space) for centering rotation maintains visual delight without interrupting user flow.
**Action:** Implement 'onFocus' for content discovery and 'onClick' for layout-shifting animations in radial components.
