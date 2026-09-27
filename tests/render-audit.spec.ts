import { test, expect } from '@playwright/test';

/**
 * FULL ROUTE RENDER REGRESSION AUDIT — TEST ONLY. Read-only: never mutates anything.
 * Crawls every public route (authenticated /dashboard/* requires Clerk test accounts —
 * reported separately) at 390x844, 768x1024, 1440x900 and detects:
 *   blank page, huge empty region, stuck opacity:0 elements, hydration errors,
 *   JS exceptions, horizontal overflow, broken scroll, content inaccessible below
 *   fold, GSAP/ScrollTrigger never-revealing, Lenis scroll traps, broken links.
 * Captures screenshot + console errors for every failure.
 * BASE_URL default http://localhost:3000; set BASE_URL=https://shotbase.dev for live.
 */

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const VIEWPORTS: [string, { width: number; height: number }][] = [
  ['mobile', { width: 390, height: 844 }],
  ['tablet', { width: 768, height: 1024 }],
  ['desktop', { width: 1440, height: 900 }],
];

// Public routes; dashboard routes redirect when signed out (tested separately).
const ROUTES = ['/', '/docs', '/signin', '/signup', '/dashboard', '/dashboard/playground'];

const failures: string[] = [];

async function auditPage(page: import('@playwright/test').Page, route: string, vp: string): Promise<string[]> {
  const issues: string[] = [];
  const consoleErrors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push(`PAGEERROR: ${e.message}`));

  const res = await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 30_000 }).catch(() => null);
  if (!res) { issues.push('navigation failed'); return issues; }
  if ((res.status() ?? 0) >= 500) { issues.push(`HTTP ${res.status()}`); return issues; }

  await page.waitForTimeout(2500); // hydration + reveal animations settle

  const audit = await page.evaluate(() => {
    const out: Record<string, unknown> = {};
    const doc = document.scrollingElement ?? document.documentElement;
    const bodyText = (document.body.innerText ?? '').trim();
    const viewportH = window.innerHeight;
    out.textLength = bodyText.length;
    out.scrollWidth = doc.scrollWidth;
    out.clientWidth = doc.clientWidth;
    out.scrollHeight = doc.scrollHeight;
    out.viewportH = viewportH;

    // blank page
    out.blank = bodyText.length < 10 && document.querySelectorAll('img,canvas,svg,video').length === 0;

    // huge empty region: element at 70%/90% viewport depth is the bare body/html
    const probe = (frac: number) => {
      const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight * frac);
      return !el || el === document.body || el === document.documentElement;
    };
    out.emptyMid = probe(0.7) && probe(0.9);

    // stuck opacity:0 elements with visible-intent content
    const stuck: string[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('*')).slice(0, 1500)) {
      const cs = getComputedStyle(el);
      if (cs.opacity === '0' && el.textContent?.trim() && el.offsetParent !== null) {
        stuck.push(`${el.tagName}.${String(el.className).slice(0, 30)}`);
        if (stuck.length >= 5) break;
      }
    }
    out.stuckOpacity = stuck;

    // horizontal overflow
    out.hOverflow = doc.scrollWidth > doc.clientWidth + 2;

    // broken scroll: page is tall but window cannot scroll at all (overflow trap)
    const beforeY = window.scrollY;
    window.scrollTo(0, 500);
    const midY = window.scrollY;
    window.scrollTo(0, doc.scrollHeight);
    const endY = window.scrollY;
    window.scrollTo(0, beforeY);
    out.scrollStuck = doc.scrollHeight > viewportH + 200 && endY < 100 && midY === 0;

    // content inaccessible below fold: last meaningful element sits below scroll extent
    const last = Array.from(document.querySelectorAll<HTMLElement>('section,main,footer,[class*=section]')).at(-1);
    if (last) {
      const r = last.getBoundingClientRect();
      out.lastBottom = Math.round(r.bottom + window.scrollY);
      out.clippedBelowFold = r.bottom + window.scrollY > doc.scrollHeight + 50;
    }

    // GSAP / ScrollTrigger / Lenis traps
    const w = window as unknown as Record<string, unknown>;
    out.hasGsap = 'gsap' in w || 'ScrollTrigger' in w;
    out.hasLenis = 'lenis' in w || 'Lenis' in w;
    const gsapHidden = Array.from(document.querySelectorAll<HTMLElement>('[class*=gsap],[data-scroll],[data-scrolltrigger]'))
      .filter((el) => { const cs = getComputedStyle(el); return cs.opacity === '0' && el.textContent?.trim(); }).length;
    out.gsapNeverRevealed = gsapHidden;
    return out;
  });

  if (audit.blank) issues.push(`BLANK PAGE (textLength=${audit.textLength})`);
  if (audit.emptyMid && !audit.blank) issues.push(`huge empty region (elementFromPoint body at 70%/90% depth, scrollHeight=${audit.scrollHeight})`);
  if ((audit.stuckOpacity as string[]).length) issues.push(`stuck opacity:0 elements: ${(audit.stuckOpacity as string[]).join(', ')}`);
  if (audit.hOverflow) issues.push(`horizontal overflow (scrollWidth=${audit.scrollWidth} > clientWidth=${audit.clientWidth})`);
  if (audit.scrollStuck) issues.push(`broken scroll / overflow trap (scrollHeight=${audit.scrollHeight}, cannot scroll)`);
  if (audit.clippedBelowFold) issues.push(`content clipped below fold (last bottom=${audit.lastBottom} > scrollHeight=${audit.scrollHeight})`);
  if (audit.gsapNeverRevealed) issues.push(`GSAP/ScrollTrigger content never revealed (${audit.gsapNeverRevealed} hidden nodes)`);
  if (audit.hasLenis && audit.scrollStuck) issues.push('Lenis scroll trap');

  // hydration errors from Shotbase code (ignore third-party noise)
  const hydration = consoleErrors.filter((e) => /hydrat|mismatch|Minified React error #418|#418|#423/.test(e));
  if (hydration.length) issues.push(`hydration errors: ${hydration[0].slice(0, 120)}`);

  const jsErrors = consoleErrors.filter((e) => /PAGEERROR/.test(e));
  if (jsErrors.length) issues.push(`JS exceptions: ${jsErrors.slice(0, 3).join(' | ').slice(0, 200)}`);

  if (issues.length) {
    const shot = `test-results/render-audit-${route.replace(/\//g, '_')}-${vp}.png`;
    await page.screenshot({ path: shot, fullPage: true }).catch(() => {});
    failures.push(`${route} [${vp}]: ${issues.join(' | ')}`);
  }
  return issues;
}

for (const [vp, size] of VIEWPORTS) {
  test.describe(`render audit ${vp}`, () => {
    test.use({ viewport: size });
    for (const route of ROUTES) {
      test(`audit ${route} @${vp}`, async ({ page }) => {
        const issues = await auditPage(page, route, vp);
        // Auth-gated routes are expected to redirect when signed out
        if ((route === '/dashboard' || route === '/dashboard/playground')) {
          if (page.url().match(/sign[-]?in|clerk|accounts/i)) return; // redirect = PASS
        }
        expect(issues, `${route} @${vp}: ${issues.join(' | ')}`).toHaveLength(0);
      });
    }
    // broken links once per viewport (homepage)
    test(`links ${vp}`, async ({ page, request }) => {
      await page.goto(BASE + '/');
      const links = await page.getByRole('link').all();
      const seen = new Set<string>();
      for (const link of links) {
        const href = await link.getAttribute('href');
        if (!href || !href.startsWith('/') || seen.has(href) || href === '#') continue;
        seen.add(href);
        const res = await request.get(BASE + href);
        expect(res.status(), `dead link: ${href} -> ${res.status()}`).toBeLessThan(400);
      }
    });
  });
}

test.afterAll(async () => {
  if (failures.length) console.log(`\n────── RENDER AUDIT FAILURES (${failures.length}) ──────\n${failures.join('\n')}`);
  else console.log('\n────── RENDER AUDIT: no failures ──────');
});
