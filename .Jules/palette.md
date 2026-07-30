## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Screen Reader aria-live Reliability and Dark Contrast Compliance]
**Learning:** Placing `aria-live="polite"` directly on dynamic buttons can be unreliable across various screen reader engines. Placing it on a persistent parent container wrapping the dynamic button/text ensures dynamic changes (like "copy" to "copied!") are always announced. Additionally, for dark dashboards (e.g., `#0a0a0a` background), secondary interactive elements must avoid low-contrast grays (such as `#444`) and instead use higher-contrast neutral tones like `#888` to satisfy WCAG AA standards.
**Action:** Always wrap dynamic state indicators in persistent `aria-live` wrappers and verify that neutral text elements on dark themes conform to the 4.5:1 minimum contrast requirement.
