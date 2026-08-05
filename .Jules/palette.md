## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-08-05 - [Contrast Guidelines and Temporary Copy State]
**Learning:** Low contrast (e.g., `#444` on a `#0a0a0a` background) is a severe accessibility blocker (1.8:1 contrast). Utilizing compliant colors like `#888` on dark backgrounds (4.7:1 contrast) immediately satisfies WCAG AA guidelines. Furthermore, when implementing clipboard copies inside collapsible or toggleable rows (like API keys), synchronously resetting copy confirmation state (`copiedId`) and clearing timers when the element is hidden prevents stale or broken UI feedback states.
**Action:** Ensure all secondary text on dark surfaces utilizes at least `#888` for readability, and clear copy states synchronously on hide.
