import { test, expect } from '@playwright/test';

/**
 * WEB-01..06 — Public-site link inventory (READ-ONLY; runs against local dev by default,
 * or live site with BASE_URL. Never submits forms or mutates anything).
 */

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';

test('WEB-01 inventory all links and fail on dead/placeholder hrefs', async ({ request }) => {
  const res = await request.get(BASE + '/');
  expect(res.status()).toBeLessThan(400);
  const html = await res.text();

  const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
  expect(hrefs.length, 'homepage should contain links').toBeGreaterThan(0);

  const dead = hrefs.filter((h) => h === '' || h === '#' || h.startsWith('javascript:'));
  expect(dead, `placeholder/broken hrefs: ${dead.join(', ')}`).toHaveLength(0);

  const internal = [...new Set(hrefs.filter((h) => h.startsWith('/')))];
  for (const href of internal) {
    const r = await request.get(BASE + href);
    expect(r.status(), `dead internal link: ${href} -> ${r.status()}`).toBeLessThan(400);
  }
});

test('WEB-02 key routes exist: /docs /signin /signup', async ({ request }) => {
  for (const path of ['/docs', '/signin', '/signup']) {
    const res = await request.get(BASE + path);
    expect(res.status(), `${path} -> ${res.status()}`).toBeLessThan(400);
  }
});

test('WEB-03 no non-existent route returns HTML success (catch-all 404 works)', async ({ request }) => {
  const res = await request.get(BASE + '/definitely-not-a-route-' + Date.now());
  expect(res.status()).toBe(404);
});

test('WEB-04 internal anchors referenced on homepage exist in the page', async ({ request }) => {
  const html = await (await request.get(BASE + '/')).text();
  const anchors = [...new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]))];
  for (const id of anchors) {
    expect(html.includes(`id="${id}"`), `broken anchor: #${id}`).toBe(true);
  }
});
