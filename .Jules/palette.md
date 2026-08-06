## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [API Key Copy UX & WCAG Contrast Polish]
**Learning:** For security-sensitive secret keys visible only once upon creation, offering a highly focused, accessible copy-to-clipboard button wrapped in `aria-live="polite"` prevents failed manual copying. Additionally, eliminating low-contrast text elements (#444 on #0a0a0a) ensures WCAG 4.5:1 minimum contrast compliance.
**Action:** Provide dynamic inline "Copy" actions with clear "Copied!" green feedback only when the plain-text key is present, and aggressively audit background-to-text contrast ratios to guarantee readability for visually impaired users.
