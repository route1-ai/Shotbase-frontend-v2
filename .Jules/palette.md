## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Accessible Switch Pattern]
**Learning:** Custom toggle components built with div/button often lack necessary ARIA roles for screen readers. Using `role="switch"` along with `aria-checked` provides the correct semantic context for these interactive elements.
**Action:** When implementing custom toggles, ensure they use `role="switch"`, `aria-checked`, and have a descriptive `aria-label`.
