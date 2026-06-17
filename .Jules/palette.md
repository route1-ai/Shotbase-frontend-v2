## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Keyboard Accessibility and Vestibular Motion]
**Learning:** For interactive radial/orbital layouts, distinguish between "preview" (focus/hover) and "select" (click/enter) actions. triggering view rotation on focus can be extremely disorienting for keyboard users. Only trigger centering animations on explicit intent-to-center actions. Additionally, always map boolean React states to "true"/"false" strings for ARIA attributes to ensure consistent DOM behavior.
**Action:** Use onFocus for non-disorienting state expansion and onClick for animated layout shifts. Explicitly stringify ARIA boolean attributes.
