## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-07-22 - [Low-Contrast Hardcoded Grays and A11y Compliance]
**Learning:** In dark-themed tables (e.g., background `#0a0a0a`), utilizing dark hardcoded grays like `#444` for toggles or secondary buttons yields a contrast ratio of ~1.8:1, well below the WCAG AA requirement of 4.5:1. This significantly limits low-vision users.
**Action:** Replace low-contrast hardcoded grays with a compliant theme color like `#888` or the theme-consistent token `hsl(var(--text-muted))` to meet WCAG contrast requirements.
