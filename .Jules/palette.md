## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [Orbital Layout Accessibility]
**Learning:** The "Snap-to-View" interaction pattern in radial layouts should separate exploration (focus/hover) from intentional centering (click/activation). This avoids disorienting vestibular triggers during keyboard tab navigation while still providing immediate content feedback.
**Action:** Use `onFocus` to open detail panels for keyboard users, but reserve view-rotating logic (`centerViewOnNode`) for explicit `onClick` events.
