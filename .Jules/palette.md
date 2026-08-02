## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [API Key Copy Interaction and Safety Cleanups]
**Learning:** When displaying hidden/masked API credentials, allowing the user to copy them to the clipboard directly from the "show" (revealed) state significantly reduces visual clutter and prevents copying placeholder mask characters (e.g., bullet dots) accidentally. Additionally, synchronizing the copy confirmation reset when the user conceals the API key avoids confusing stale state representations in the UI.
**Action:** Always provide an explicit copy button alongside revealed credentials, and synchronously reset any copy success timers or states when the parent block is collapsed or hidden.
