## 2026-06-16 - [Copy-to-Clipboard Consistency and Feedback]
**Learning:** Visual feedback for copy-to-clipboard interactions should toggle the state (e.g., "Copy" to "Copied" with an icon swap) for ~2 seconds to provide a clear success signal. Using pre-defined utility classes like `.ccopy` ensures visual consistency across the dashboard and landing pages.
**Action:** Use standard icons (Copy, Check) and the `.ccopy` class for code snippet interactions. Implement a 2-second timeout for the success state.
