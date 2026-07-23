## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-07-23 - [Keyboard Accessibility for Orbital Elements]
**Learning:** For complex interactive visualizations (like radial timelines or orbital charts), keyboard navigation requires both HTML markup (role="button", tabIndex={0}, aria-label) and explicit window listeners for the "Escape" key to gracefully dismiss opened info panels. Visual indicators are most clear when default focus outlines are hidden and custom focus-visible borders are applied to inner circular visual elements to prevent layout shift.
**Action:** Map focus outlines to inner elements of interactive visual nodes with focus-visible, and ensure keyboard interactions cover Focus, Space/Enter activation, and Escape dismissals.
