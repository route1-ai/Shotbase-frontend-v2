## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Interactive Orbital Timeline Accessibility]
**Learning:** For complex radial/orbital layouts, semantic interactivity is crucial. Converting non-semantic elements to buttons, implementing 'snap-to-view' rotation on intentful selection (click/focus), and adding an 'Escape' key listener for closing detail cards makes the experience both accessible and delightful.
**Action:** Use buttons for orbital nodes, sync rotation with focus/click for better ergonomics, and always provide a keyboard exit path for centered modal-like cards.
