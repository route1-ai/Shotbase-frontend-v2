## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Interactive A11y Redundancy]
**Learning:** When converting passive elements (like divs) to interactive ones (buttons) for accessibility, solely relying on `onFocus` for keyboard users can be insufficient for mobile or touch devices.
**Action:** Always pair `onFocus` with `onClick` for interactive components to ensure consistent behavior across all input methods.
