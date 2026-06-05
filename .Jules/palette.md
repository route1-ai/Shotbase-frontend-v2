## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-06-05 - [Safe Keyboard Shortcut Implementation]
**Learning:** Global keyboard shortcuts can easily interfere with standard browser functions (like Cmd+F) or user input if not properly guarded. Consolidating shortcut logic and checking for active modifier keys and input focus is essential for accessible and predictable UX.
**Action:** Always check for `metaKey`, `ctrlKey`, and `altKey` to avoid blocking system shortcuts, and verify that `document.activeElement` is not an input or textarea before triggering custom key behaviors.
