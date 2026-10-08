## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-10-08 - [2-Step Inline Confirmation and Modal Escape Dismiss]
**Learning:** Destructive actions like revoking live API keys benefit from a timed 2-step inline confirmation ("Revoke" -> "Confirm revoke?") to prevent accidental data loss without disruptive modal dialogs. Modals must also handle the Escape key to satisfy WCAG keyboard navigation standards.
**Action:** Use inline timed confirmation flows with `useRef` auto-resets for destructive table row actions and attach `Escape` key event listeners on modal overlays.
