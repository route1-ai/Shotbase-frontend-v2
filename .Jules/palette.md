## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2026-07-01 - [Contrast Polish and API Keys Clipboard Copying]
**Learning:** Gray text elements styled with #444 are completely illegible on true black backgrounds (#0a0a0a). Upgrading these to #888 matches contrast guidelines without compromising dark aesthetics. Adding copy-to-clipboard functionality dynamically on raw plain-text secret values (using aria-live wrappers and clear visual icon indicators) provides a highly pleasant and accessible developer experience.
**Action:** Keep visual text and labels readable with high-contrast colors (#888 on dark-themed boards), specify valid type="button" attributes for copy and secondary buttons, and wrap interactive feedback triggers in polite aria-live status structures.
