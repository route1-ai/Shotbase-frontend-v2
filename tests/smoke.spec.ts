import { test, expect } from '@playwright/test'

/**
 * Smoke + invariants that must hold on every deploy.
 *
 * Run against local dev: `npx playwright test`
 * Run against live prod: `BASE_URL=https://shotbase.dev npx playwright test`
 *
 * Auth-gated flows (signup, dashboard, billing) live in their own files
 * once a Clerk test user is provisioned. For now we only cover public
 * pages — they break the loudest and the fastest to catch.
 */

test.describe('public pages render', () => {
  for (const path of ['/', '/docs', '/playground', '/signin', '/signup']) {
    test(`GET ${path} returns 200`, async ({ page }) => {
      const res = await page.goto(path)
      expect(res?.status(), `expected 200 on ${path}`).toBeLessThan(400)
    })
  }
})

test('auth-gated routes redirect unauthed users to signin (no 404s)', async ({ page }) => {
  for (const path of ['/dashboard', '/onboarding']) {
    const res = await page.goto(path, { waitUntil: 'domcontentloaded' })
    const status = res?.status() ?? 0
    expect(status, `expected redirect (not 404) on ${path}`).toBeLessThan(400)
    // After the redirect chain we should land somewhere that looks like sign-in.
    expect(page.url(), `expected ${path} to land on a sign-in page`).toMatch(
      /\/(signin|sign-in)(\?|$)/
    )
  }
})

test('no dead internal links on the homepage', async ({ page, baseURL }) => {
  await page.goto('/')
  const hrefs = new Set<string>()
  for (const link of await page.getByRole('link').all()) {
    const href = await link.getAttribute('href')
    if (!href) continue
    // Only check internal links; external 404s are not our problem and
    // hammering them on every CI run is rude.
    if (href.startsWith('/') && !href.startsWith('//')) hrefs.add(href)
  }
  for (const href of hrefs) {
    const res = await page.request.get(href, { maxRedirects: 5 })
    expect(res.status(), `dead internal link: ${href}`).toBeLessThan(400)
  }
})
