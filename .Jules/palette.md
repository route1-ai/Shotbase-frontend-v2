## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Keyboard Accessibility for Interactive Orbits]
**Learning:** Interactive visualizations like radial timelines often lack keyboard support. Converting non-semantic elements to buttons and adding `focus-visible` styles is crucial. However, triggering significant viewport changes (like rotation) on focus is jarring for keyboard users; these should only occur on explicit clicks or activation.
**Action:** Use semantic `button` elements for interactive nodes. Trigger content expansion on focus/hover, but reserve major animations or layout shifts (like rotation/centering) for explicit click events to respect WCAG 3.2.1.
