## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-20 - [Snap-to-View Pattern for Orbital Layouts]
**Learning:** The "Snap-to-View" pattern provides a delightful yet non-disorienting experience for radial/orbital layouts. Separating focus and selection behaviors is key: `onFocus` opens detail panels to support fast keyboard scanning without movement, while explicit `onClick` (via mouse or Enter/Space) triggers the centering rotation for visual focus.
**Action:** In radial interfaces, use `onFocus` for information disclosure and `onClick` for layout repositioning. Ensure `onBlur` on the container resumes any paused animations when focus leaves the component.
