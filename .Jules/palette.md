## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-07-19 - [Synch-Reset on Multi-tab Copy Interactions]
**Learning:** When implementing temporary visual "Copied!" feedback states for multiple tabs or toggle panels, resetting state values using a `useEffect` reactive dependency (e.g., `useEffect(..., [selectedId])`) can cause cascading render cycles in React 19/Turbopack, triggering ESLint warnings.
**Action:** Perform the visual state resets directly and synchronously inside the tab or selection click handlers instead of relying on a reactive effect hook to reset selection-specific copy values.
