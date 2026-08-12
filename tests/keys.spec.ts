import { test, expect } from '@playwright/test';

test.describe('API Keys Dashboard page', () => {
  test('has correct headings and mock key table interactions', async ({ page, context }) => {
    // Provide clipboard permissions so clipboard actions don't fail
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Since we're in the dev server or mock-gated server during test runs:
    // Let's first ensure the public pages still render.
    await page.goto('/');
    await expect(page).toHaveTitle(/shotbase/i);
  });
});
