## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-10-04 - [Accessible Custom Toggle Switches and Keyboard Focus]
**Learning:** Custom toggle switch controls built with `<button>` elements in React require `role="switch"`, `aria-checked={value}`, and `aria-label={label}` for screen readers to correctly announce toggle state. Furthermore, sub-components should be declared outside the parent component scope to prevent re-creation on re-render and preserve focus state during keyboard interaction.
**Action:** Always extract custom toggle sub-components outside parent render functions, attach switch ARIA attributes, and include visible focus rings (`focus-visible:ring-1`) for keyboard navigation.
