## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Accessible Marquees and Keyboard Traps]
**Learning:** Making a marquee focusable (to support pausing on focus) can create a "keyboard trap" or an "empty focus" experience for screen reader users if the internal list is hidden with `aria-hidden="true"`.
**Action:** When making a marquee container focusable with `tabIndex={0}`, ensure the `aria-label` describing the content is placed directly on the focusable element itself, and use `role="region"` with `aria-roledescription="marquee"` for better semantic context.
