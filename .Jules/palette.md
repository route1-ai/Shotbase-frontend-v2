## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-07-18 - [Overlapping absolute copy button prevention]
**Learning:** When adding an absolute-positioned Copy to Clipboard button over scrollable pre/code blocks, the code text can overflow and render directly underneath the button, causing poor visual contrast and clipping.
**Action:** Wrap the code block in a relative container and apply generous right-side padding (e.g., paddingRight: 64px) to the scrollable element to prevent overlap.
