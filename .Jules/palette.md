## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Color Contrast Polish and Accessible Copy interaction]
**Learning:** Text elements using `#444` on a near-black (`#0a0a0a`) background have a contrast ratio of only ~1.7:1, violating WCAG 4.5:1 minimum contrast guidelines and rendering copy invisible to many users. Utilizing `#888` boosts the contrast ratio to ~5.3:1, meeting AA level standards. Additionally, wrapping dynamic buttons inside elements with `aria-live="polite"` makes state changes accessible to screen readers.
**Action:** Always test dark-mode text and button labels for color contrast compliance and utilize standard ARIA announcements for dynamic client feedback.
