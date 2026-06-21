## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [API Explorer UX & A11y]
**Learning:** In dashboard views with heavy inline styling, default browser outlines can be visually jarring. Using `onFocus` and `onBlur` handlers to manage a focused state and applying theme tokens like `ACTIVE_BORDER` provides an accessible yet branded focus indicator. Additionally, `aria-pressed` is essential for indicating the selected state in list-based navigation.
**Action:** Use `onFocus`/`onBlur` for custom focus states and always include `aria-pressed` for selection buttons.
