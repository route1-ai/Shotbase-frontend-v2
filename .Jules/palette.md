## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-05-12 - [Absolute Button Overflows and Container Safety]
**Learning:** Placing absolute-positioned "Copy to Clipboard" buttons over code blocks or `<pre>` containers requires adding explicit `padding-right` to the container to prevent scrolled text from rendering underneath the buttons, which looks unpolished and reduces usability.
**Action:** Always pair absolute positioning of buttons with corresponding padding on the underlying text or code block container.
