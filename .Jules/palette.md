## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Semantic Button Copy Elements]
**Learning:** Using non-semantic elements like `<code>` directly as clickable copy targets creates severe accessibility issues for keyboard and screen reader users. Wrapping them in a semantic `<button type="button">` with `aria-live="polite"` persistent wrapper, proper focus states, and specific `aria-label` is crucial for screen-reader readability and full keyboard interactability.
**Action:** Always wrap code copy elements inside a semantic `<button type="button">` with accessible outlines and aria-live status updates.
