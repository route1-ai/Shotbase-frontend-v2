## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Orbital Navigation Accessibility]
**Learning:** Interactive radial or orbital layouts often lack native keyboard support when implemented with `div` elements. Converting nodes to `button` elements and implementing `onFocus`/`onBlur` along with `aria-expanded` makes these visually complex components accessible to screen readers and keyboard-only users.
**Action:** Use semantic `button` elements for interactive nodes in custom layouts and ensure global shortcuts (like Escape) are available to close expanded detail panels.
