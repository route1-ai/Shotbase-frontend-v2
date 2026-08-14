## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-07-20 - [Accessible Masked Clipboard and Color Contrast Audit]
**Learning:** For critical API Key tables, implementing copy feedback that automatically resets when keys are toggled/hidden prevents stale visual states. Additionally, wrapping copy feedback in a persistent parent element with `aria-live="polite"` guarantees screen reader compatibility, and auditing low-contrast text values like #444 on #0a0a0a to comply with WCAG AA standard #888 creates an exceptionally readable and accessible dark UI.
**Action:** Always wrap copy/feedback states in persistent `aria-live="polite"` parents, clean up timeouts on unmount and toggling via refs, and audit contrast on dark theme backgrounds to meet WCAG AA standards.
