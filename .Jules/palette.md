## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-05-24 - [Semantic Form Controls and ARIA States]
**Learning:** For complex web-based tools like playgrounds, semantic HTML (using `<label>` for inputs) and explicit ARIA states (`role="switch"`, `role="tablist"`, `aria-pressed`) are essential for providing a predictable and accessible experience for users of assistive technologies.
**Action:** Always link form inputs to semantic `<label>` elements using unique IDs and ensure interactive components (toggles, tabs, toggle buttons) communicate their roles and current states via ARIA.
