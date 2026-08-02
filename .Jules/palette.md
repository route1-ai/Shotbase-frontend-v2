## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [API Key Copy Flow and Toggled State Sync]
**Learning:** For collapsible or hidden API keys, the Copy feedback state must be synchronously cleared if the key is hidden using the toggle button to avoid stale visual states. Additionally, using `#888` instead of `#444` for secondary controls on `#0a0a0a` backgrounds is critical to satisfying WCAG 4.5:1 contrast guidelines.
**Action:** Always clear timeout timers and reset copy confirmation states immediately upon toggling elements to a hidden state, and use WCAG-compliant `#888` secondary controls on very dark canvases.
