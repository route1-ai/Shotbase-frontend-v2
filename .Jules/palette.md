## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Playground Accessibility and Feedback]
**Learning:** Custom UI controls (toggles, segmented controls) built with generic elements require explicit ARIA roles like `switch` and `aria-pressed` to be accessible. Visual confirmation for clipboard actions is a high-impact micro-UX pattern for developer-centric tools.
**Action:** Implement `role="switch"` and `aria-pressed` for custom interactive components and always provide transient "Copied!" feedback for code export features.
