## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-06-12 - [Accessible Orbital Interactions]
**Learning:** Complex interactive components like orbital timelines often rely on mouse-only events (hover). To make them accessible, container elements should be refactored to semantic buttons, hover logic must be mirrored with focus handlers, and an 'Escape' key listener should be provided to allow users to easily dismiss expanded overlay content.
**Action:** Always use `<button type="button">` for interactive nodes, ensure `onFocus` triggers the same state as `onMouseEnter`, and implement an 'Escape' key listener for any component that maintains an "active" or "expanded" overlay state.
