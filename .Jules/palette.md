## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-07-06 - [Synchronous State Resets for Copy Actions on Collapsible Elements]
**Learning:** When implementing temporary copy feedback on collapsible or toggled elements (such as show/hide secret API keys), leaving the copy confirmation active when the element is hidden creates a stale and confusing state if the element is later expanded. Synchronously resetting the state and clearing active timeouts on collapse prevents this issue.
**Action:** Synchronously clear timeouts and reset copied item states inside the toggle/close handlers for any expandable or collapsible components with copy actions.
