## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Accessible Custom Interactive Components]
**Learning:** Custom interactive components (like radial timelines or orbital menus) often rely on `onMouseEnter` for interactivity, which excludes keyboard users. Refactoring these to semantic `button` elements with `onClick` handlers and `:focus-visible` styles ensures they are both accessible and visually distinct during navigation.
**Action:** When encountering non-semantic interactive `div`s, refactor to `button` with a CSS reset and implement `aria-expanded`, `aria-label`, and an 'Escape' key listener to provide a robust keyboard experience.
