## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-07-09 - [Radial Component Keyboard Accessibility]
**Learning:** Complex interactive UI components like radial timelines require explicit keyboard support (tabIndex, ARIA roles, key listeners for Escape/Enter/Space) and visible focus indicators to be accessible. Relying on hover/mouse events alone excludes keyboard and screen reader users.
**Action:** Ensure all interactive custom components are focusable, have descriptive ARIA labels, and support standard keyboard interactions for activation and dismissal.
