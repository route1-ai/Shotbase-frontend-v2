## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-06-28 - [Interactive Component Accessibility]
**Learning:** When using interactive nodes in complex layouts like the `RadialOrbitalTimeline`, using semantic `<button>` elements instead of `<div>` is essential for keyboard focusability. It requires a CSS reset of default button styles (background, border, padding) and synchronizing `onFocus` with `onMouseEnter` to provide a consistent experience.
**Action:** Always prefer semantic interactive elements (`button`, `a`) for clickable nodes and ensure they have appropriate focus indicators and ARIA attributes like `aria-expanded`.
