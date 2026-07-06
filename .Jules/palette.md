## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-07-06 - [Keyboard Accessibility for Orbital Timeline]
**Learning:** Complex interactive components like orbital timelines are often mouse-centric and inaccessible. Converting nodes to semantic buttons and implementing standard keyboard patterns (Focus to open, Escape to close, Blur to hide) makes these "delight" features usable for everyone.
**Action:** Always use semantic `button` elements for interactive nodes in complex visualizations and implement focus-management (Escape/Blur) to ensure the UI remains navigable via keyboard.
