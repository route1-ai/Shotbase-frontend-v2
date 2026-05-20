## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [ARIA Role and Focus Management]
**Learning:** Adding `tabIndex={0}` to an element with `role="presentation"` or inside `aria-hidden="true"` creates an accessibility conflict. Elements that are focusable MUST have a meaningful role and name for screen readers.
**Action:** Never make "presentational" or "hidden" elements focusable. If an element needs to be paused on focus (like a marquee), ensure it has an appropriate interactive role or its focusable children are properly labeled.
