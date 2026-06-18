## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-06-18 - [Consistent Dashboard Focus States]
**Learning:** In dashboards with heavy inline styling (like the API Explorer), using existing theme constants (e.g., `ACTIVE_BORDER`) for `onFocus` handlers ensures visual consistency across the application and avoids the pitfalls of hardcoded hex values.
**Action:** Reuse established design tokens for custom focus indicators to maintain brand integrity and support theme switching.
