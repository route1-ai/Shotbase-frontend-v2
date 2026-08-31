## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-08-31 - [Interactive Data Table Keyboard Navigation]
**Learning:** Tables displaying list data that open details drawers on click are often inaccessible to keyboard users unless explicitly given `role="button"`, `tabIndex={0}`, `aria-label`, an `onKeyDown` handler for Enter/Space, and CSS `:focus-visible` ring/background styles. Using Tailwind utility classes (`hover:` and `focus-visible:`) instead of imperative JS event handlers prevents state conflicts when focus and hover states overlap.
**Action:** When making table rows or custom clickable list items interactive, always pair ARIA/keyboard attributes with CSS-based focus-visible styling instead of direct style mutations.
