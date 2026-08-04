## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-08-04 - [Color Contrast & Inline Button Resets in Dark Dashboard UI]
**Learning:** Hardcoded `#444` foreground colors on near-black `#0a0a0a` surfaces fail WCAG AA contrast requirements. Additionally, custom interactive elements (like clipboard copy buttons inside tables) must explicitly define standard inline resets (`background: "none"`, `border: "none"`, `cursor: "pointer"`) to suppress native browser button styling while remaining accessible.
**Action:** Always check the contrast ratio of secondary text or helper labels on near-black dashboards, upgrading `#444` to `#888`. When crafting inline custom buttons in list layouts, pair semantic `<button>` tags with explicit style resets to ensure cross-browser consistency.
