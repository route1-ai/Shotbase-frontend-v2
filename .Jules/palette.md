## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Accessible Code Snippet Triggers]
**Learning:** Attaching `onClick` handlers directly to `<code>` elements creates non-keyboard-operable interactive controls and misses screen reader announcements when status updates occur.
**Action:** Wrap interactive code snippet copy actions in native `<button type="button">` elements with explicit `aria-label`, `focus-visible` ring indicators, and an `aria-live="polite"` parent container for status feedback.
