import { test, expect } from '@playwright/test';

/**
 * READ-ONLY smoke suite against live shotbase.dev.
 * Every test here only navigates and reads — nothing submits forms, signs up,
 * or hits the screenshot/Railway backend, so it can't pollute real data.
 */

// Public pages that should render for an anonymous visitor.
const PUBLIC_PAGES = ['/', '/docs', '/signin', '/signup'];

for (const path of PUBLIC_PAGES) {
  test(`public page loads: ${path}`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status(), `${path} returned ${res?.status()}`).toBeLessThan(400);
    // Real HTML rendered, not a blank/error shell.
    await expect(page.locator('body')).not.toBeEmpty();
  });
}

test('homepage shows real content', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/shotbase/i);
});

test('auth-gated route redirects anonymous user to sign in', async ({ page }) => {
  await page.goto('/dashboard');
  // Clerk should bounce an unauthenticated visitor to /signin (or a Clerk URL).
  await expect(page).toHaveURL(/sign[-]?in|clerk|accounts/i);
});

test('no dead internal links on homepage', async ({ page, request }) => {
  await page.goto('/');
  const links = await page.getByRole('link').all();
  const seen = new Set<string>();

  for (const link of links) {
    const href = await link.getAttribute('href');
    if (!href || !href.startsWith('/') || seen.has(href)) continue;
    seen.add(href);
    const res = await request.get(href);
    expect(res.status(), `dead link: ${href} -> ${res.status()}`).toBeLessThan(400);
  }
});

test('homepage has no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(errors, `console errors:\n${errors.join('\n')}`).toHaveLength(0);
});
