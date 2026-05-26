## 2025-05-14 - [Copy to Clipboard and A11y Polish]
**Learning:** For developer-focused products, providing a "Copy to Clipboard" feature on code snippets is a high-value micro-interaction. Additionally, moving content like marquees should always support pausing (e.g., on hover) to satisfy accessibility guidelines and improve readability.
**Action:** Always include copy-to-clipboard for code blocks and ensure moving elements have a pause mechanism and proper ARIA labeling to avoid redundant screen reader announcements.

## 2025-05-20 - [Accessible Orbital Navigation]
**Learning:** When adding keyboard accessibility to complex radial or orbital UIs, converting non-semantic containers to buttons is essential. To balance delight with usability, keep "delightful" layout shifts (like auto-rotation/snapping) tied to intentional interactions like focus or click, while keeping hover interactions non-disruptive (expansion only).
**Action:** Use semantic buttons for orbital nodes, implement focus-visible styles that mirror hover states, and ensure that automatic layout shifts only trigger on intentional engagement (focus/click) to avoid "motion sickness" for mouse users.
