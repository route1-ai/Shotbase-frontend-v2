## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-07-22 - [Keyboard Accessibility for Radial UI]
**Learning:** Complex radial or orbital UI components often default to mouse-only interactions (hover/click), creating significant accessibility barriers. To fix this, nodes must be made focusable, respond to Enter/Space/Escape, and sync their focus state with the "active" or "expanded" state. Using :focus-visible on the container to target inner elements (e.g., .node:focus-visible .circle) provides a clean visual indicator without cluttering the mouse-driven experience.
**Action:** Always implement keyboard listeners (Enter, Space, Escape) and focus-visible indicators for non-standard interactive layouts like radial timelines or orbital menus.
