## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-07-27 - [Clipboard Copy Error Handling in Web Browsers]
**Learning:** When using `navigator.clipboard.writeText(...)` in modern browsers, always gracefully handle situations where write permission is denied or where the API is unavailable (such as in insecure non-localhost HTTP environments) by appending a `.catch()` block. This prevents unhandled promise rejections from throwing or logging application-level exceptions.
**Action:** Always append `.catch((err) => console.error(...))` to modern clipboard write operations in React components to guarantee robust error tolerance.
