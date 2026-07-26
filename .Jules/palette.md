## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-07-20 - [Synchronous State Resets on UI Transitions]
**Learning:** To reset temporary copy feedback states gracefully when toggling views, performing resets synchronously inside click handlers (e.g., when hiding a secret key) avoids the need for cascading `useEffect` triggers, preventing render cycle performance warnings and ensuring instant visual response.
**Action:** Always clean up timers and reset visual indicator states synchronously during event-driven UI toggles instead of relying on effect synchronization.
