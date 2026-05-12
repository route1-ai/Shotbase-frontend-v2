## 2024-10-24 - [Responsive Navbar & Accessibility Polishing]
**Learning:** In landing pages with dense navigation and primary CTAs, using `flex-shrink: 0` and `white-space: nowrap` on the logo and CTA is critical to prevent "layout squashing" on small mobile devices (320px-390px). Standard Tailwind `hidden md:flex` patterns often fail at "in-between" tablet sizes (768px-1024px) if the link count is high.
**Action:** Always verify navbar integrity at 375px and 820px (iPad Air) specifically. Use a dedicated `.navbar` utility class to centralize responsive padding rather than repeating it in every section.

## 2024-10-24 - [WCAG 2.2.2 compliance for Marquees]
**Learning:** Infinite scroll marquees are a common UX delight but fail accessibility guidelines if they cannot be paused.
**Action:** Implement `animation-play-state: paused` on `:hover` and `:focus-within` for all marquee components to ensure users with motion sensitivity or those using screen readers can interact with the content.
