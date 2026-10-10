## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-15 - [2-Step Inline Confirmation for Destructive Actions]
**Learning:** Destructive actions like revoking API keys or deleting credentials require safety without disruptive modal dialogs. A 2-step inline confirmation toggle ('Revoke' -> 'Confirm revoke?') with an auto-reset timer (e.g., 3s) and dynamic `aria-label` updates prevents accidental data loss while remaining fast and screen-reader accessible.
**Action:** Use 2-step inline button toggles with timer-backed auto-resets and dynamic `aria-label` updates for destructive inline actions.
