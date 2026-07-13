## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Standardized API Key Management UX]
**Learning:** For sensitive developer credentials like API keys, a standardized micro-UX pattern consisting of a "Show/Hide" toggle (using Eye/EyeOff icons) and a "Copy to Clipboard" button with immediate visual feedback (switching to a Check icon) significantly improves both security perception and usability. Mandatory ARIA labels on these icon-only buttons are essential for screen reader accessibility.
**Action:** Implement Show/Hide + Copy with success feedback (Check icon + brand color) for all credential management views, ensuring consistent ARIA labeling.
