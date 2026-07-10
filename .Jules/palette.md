## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-07-10 - [Complex Component Focus Management]
**Learning:** For custom interactive components like the RadialOrbitalTimeline, using an `onBlur` handler on the parent container with a check on `e.relatedTarget` (via `containerRef.current.contains`) is a robust way to manage "focus exit" states without prematurely closing the component when moving focus between internal children.
**Action:** Use the `relatedTarget` check in `onBlur` to handle state resets for focus-sensitive custom UI regions.
