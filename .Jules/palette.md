## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Interactive Orbital Accessibility]
**Learning:** For complex orbital or interactive components, converting nodes to buttons and adding an Escape key listener provides a baseline of accessibility that mouse-only implementations lack. It ensures keyboard users can navigate, trigger, and dismiss interactive states predictably.
**Action:** When building custom interactive components, prioritize semantic buttons for nodes and implement standard keyboard shortcuts like "Escape" for state dismissal.
