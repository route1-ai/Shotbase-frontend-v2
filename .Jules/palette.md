## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-06-27 - [Semantic Interactive Nodes for Radial Layouts]
**Learning:** In complex radial or orbital UI components, using <div> for interactive nodes prevents keyboard accessibility and screen reader support. Converting these to semantic <button> elements with aria-expanded and aria-label attributes, plus adding Escape key and Blur handlers, provides a robust accessible experience for non-mouse users.
**Action:** Always use semantic interactive elements (<button>, <a>) for nodes in custom visualizations to ensure native tab order and focus support.
