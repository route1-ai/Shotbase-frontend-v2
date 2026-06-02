## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Accessible Radial Navigation]
**Learning:** When using non-standard layouts like radial or orbital menus, semantic elements and keyboard orchestration are critical. Using `button` for nodes and separating "soft" interactions (hover) from "hard" ones (click/focus) prevents disorientation while maintaining accessibility.
**Action:** Use semantic buttons for interactive nodes, provide clear `:focus-visible` states, and implement keyboard-only behaviors (like auto-centering on Tab but not on hover) to optimize for both mouse and keyboard users.
