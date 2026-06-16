## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-06-16 - [Copy-to-Clipboard Consistency and Feedback]
**Learning:** Visual feedback for copy-to-clipboard interactions should toggle the state (e.g., "Copy" to "Copied" with an icon swap) for ~2 seconds to provide a clear success signal. Using pre-defined utility classes like `.ccopy` ensures visual consistency across the dashboard and landing pages.
**Action:** Use standard icons (Copy, Check) and the `.ccopy` class for code snippet interactions. Implement a 2-second timeout for the success state.
