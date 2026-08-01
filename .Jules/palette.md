## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-08-01 - [Contrast and Clean Timeout Management on Dark Backgrounds]
**Learning:** Gray elements like #444 on dark backgrounds (#0a0a0a) fail WCAG 2.1 AA 4.5:1 contrast requirements. Upgrading secondary/muted text to #888 resolves this elegantly. Additionally, always synchronize local state resets (such as clearing "Copied!" feedback) with state toggle handlers to avoid stale UI indicators.
**Action:** Keep helper/muted elements at or above #888 for dark background modes, and synchronously reset temporary UI feedback when elements are toggled or unmounted.
