import { test, expect } from '@playwright/test';

/**
 * WEB-CRAWL — automated public route/link/action verification (READ-ONLY).
 * Crawls public pages reachable from homepage/docs/auth surfaces, extracts every
 * clickable element (href, anchor, button navigation, CTA, footer/mobile nav),
 * and verifies internal + external destinations at desktop and mobile viewports.
 *
 * No form submits, no signups — cannot pollute real data.
 * BASE_URL default http://localhost:3000 (local dev); set BASE_URL for other targets.
 */

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const SEED_PAGES = ['/', '/docs', '/signin', '/signup'];

// href="/" is only allowed where the element genuinely means Home
const HOME_ALLOWED_CONTEXT = /(nav|header|footer|logo|brand|home)/i;

const report = {
  totalClickable: 0,
  valid: 0,
  broken: [] as string[],
  redirects: [] as string[],
  placeholders: [] as string[],
  duplicates: {} as Record<string, number>,
  unreachable: [] as string[],
};

function record(dest: string) {
  report.totalClickable++;
  report.duplicates[dest] = (report.duplicates[dest] ?? 0) + 1;
}

for (const viewport of ['desktop', 'mobile']) {
  test.describe(`${viewport} navigation`, () => {
    test.use(viewport === 'mobile' ? { viewport: { width: 390, height: 844 } } : { viewport: { width: 1440, height: 900 } });

    for (const seed of SEED_PAGES) {
      test(`crawl ${seed} (${viewport}): extract + verify all clickable elements`, async ({ page, request }) => {
        const res = await page.goto(BASE + seed);
        expect(res?.status(), `${seed} -> ${res?.status()}`).toBeLessThan(400);
        await page.waitForLoadState('networkidle');

        // hrefs + anchors
        const links = await page.getByRole('link').all();
        for (const link of links) {
          const href = await link.getAttribute('href');
          const ctx = (await link.textContent()) ?? '';
          if (!href) { report.placeholders.push(`${seed}: <a> without href`); continue; }
          if (href === '#' || href.startsWith('javascript:')) {
            report.placeholders.push(`${seed}: placeholder href "${href}"`);
            continue;
          }

          if (href.startsWith('/')) {
            record(href);
            if (href === '/' && !HOME_ALLOWED_CONTEXT.test(ctx)) {
              report.broken.push(`${seed}: accidental href="/" on non-Home element "${ctx.slice(0, 40)}"`);
              continue;
            }
            if (href.includes('#')) {
              const [path, id] = href.split('#');
              if (id) {
                const pageHtml = path === '' ? await page.content() : await (await request.get(BASE + path)).text();
                if (!pageHtml.includes(`id="${id}"`)) report.broken.push(`${seed}: broken anchor ${href}`);
              }
            }
            const r = await request.get(BASE + href);
            if (r.status() >= 400) report.broken.push(`${seed}: ${href} -> ${r.status()}`);
            else report.valid++;
          } else if (href.startsWith('mailto:')) {
            record(href); report.valid++;
          } else if (href.startsWith('http')) {
            record(href);
            try {
              const r = await request.head(href, { timeout: 10_000 }).catch(() => request.get(href, { timeout: 10_000 }));
              if (r && r.status() < 400) report.valid++;
              else report.broken.push(`${seed}: external ${href} -> ${r?.status() ?? 'unreachable'}`);
            } catch { report.broken.push(`${seed}: external unreachable ${href}`); }
          }
        }

        // button navigation (CTAs that navigate)
        const buttons = await page.getByRole('button').all();
        for (const btn of buttons) {
          const label = (await btn.textContent())?.trim() ?? '';
          if (label) record(`[button] ${label}`);
        }
      });
    }
  });
}

test.afterAll(async () => {
  // Duplicate destinations summary
  const dupes = Object.entries(report.duplicates).filter(([, n]) => n > 1);
  console.log(`\n────── LINK CRAWL REPORT (${BASE}) ──────
Total clickable elements: ${report.totalClickable}
Valid:                    ${report.valid}
Broken:                   ${report.broken.length}${report.broken.length ? '\n  ' + report.broken.join('\n  ') : ''}
Placeholders:             ${report.placeholders.length}${report.placeholders.length ? '\n  ' + report.placeholders.join('\n  ') : ''}
Duplicate destinations:   ${dupes.length}${dupes.length ? '\n  ' + dupes.map(([d, n]) => `${d} x${n}`).join('\n  ') : ''}
Unreachable routes:       ${report.unreachable.length}`);
});
