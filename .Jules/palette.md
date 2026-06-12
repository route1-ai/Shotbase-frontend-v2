## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [A11y Refactor for Interactive Visualizations]
**Learning:** Complex interactive visualizations like the Radial Orbital Timeline must separate focus and activation behaviors to support accessible keyboard navigation. Focus should trigger data visibility (content expansion) while explicit activation (Click/Enter) should trigger visual delight (rotation), preventing user disorientation during tabbing.
**Action:** Always refactor interactive SVG/CSS visualization nodes into semantic buttons with appropriate ARIA labels and focus-visible states. Include an explicit close button for any modal-like detail views to ensure users aren't trapped in an expanded state.
