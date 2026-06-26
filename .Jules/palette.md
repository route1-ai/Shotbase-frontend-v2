## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-06-26 - [Accessible Orbital Navigation]
**Learning:** Complex radial/orbital interfaces are often implemented as decorative mouse-only elements. Converting these to semantic buttons with dedicated focus states, Escape-to-close listeners, and focus-out blur handling makes them usable for keyboard and screen reader users without compromising the visual design.
**Action:** Always refactor interactive decorative nodes into buttons and implement 'Escape' and 'onBlur' handlers to manage expanded detail states.
