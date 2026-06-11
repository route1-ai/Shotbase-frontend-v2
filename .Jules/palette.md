## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Playground Keyboard Shortcuts and Focus States]
**Learning:** Keyboard shortcuts in complex interactive tools (like the Playground) must be intelligently scoped: global shortcuts (e.g., Cmd+Enter) should always work, while single-key shortcuts (e.g., 'f' for expand) should be disabled when focus is in an input or textarea to prevent unexpected behavior while typing.
**Action:** Implement focus-visible indicators for all interactive elements and ensure single-key shortcuts include an input-focus check.
