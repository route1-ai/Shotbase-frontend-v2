## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees always should support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-07-02 - [Dynamic Key Copy & Accessible Dark Dashboard Contrast]
**Learning:** On API Key management dashboards where secrets are only available once upon creation, dynamically rendering the "Copy" action only when the plain-text secret is present in React state keeps the UI clean and contextual. Furthermore, solid-black backgrounds require labels to have at least a #888 color hex to satisfy WCAG AA contrast ratios (4.5:1), as native styling often defaults to unreadable #444 colors.
**Action:** Render "Copy" utilities conditionally based on secret presence in state, wrap them in aria-live="polite" containers, and always audit and raise low-contrast dark greys to WCAG-compliant standards.
