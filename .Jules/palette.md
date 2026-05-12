## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover/focus) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-14 - [Tailwind-First Constraint]
**Learning:** In this repository, micro-UX improvements (like Skip to Content links and animation controls) should be implemented using Tailwind utility classes rather than custom CSS in globals.css to maintain design system consistency and simplify maintenance.
**Action:** Prioritize Tailwind's arbitrary values and group/peer modifiers for complex interactions before reaching for global CSS.
