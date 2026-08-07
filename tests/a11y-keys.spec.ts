import { test, expect } from '@playwright/test';

test('API Keys page renders list with Eye/EyeOff icons and supports Copying revealed keys', async ({ page }) => {
  // Mock /api/keys/list API response
  await page.route('**/api/keys/list', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        keys: [
          {
            id: 'key_123',
            name: 'Production Key',
            key: 'sk_prod_1234567890abcdef',
            createdAt: Date.now() - 86400000,
            active: true,
            last: '2026-05-15',
            requests: 1250,
          }
        ]
      }),
    });
  });

  // Navigate to API Keys page
  await page.goto('/dashboard/keys');

  // Verify header and page content
  await expect(page.locator('h1')).toContainText('API Keys');

  // Key should initially be masked
  const keyCell = page.locator('code');
  await expect(keyCell).toContainText('sk_prod_••••••••••••••••••••••••');

  // Find the Show API Key button (with Eye icon aria-label)
  const showBtn = page.getByRole('button', { name: 'Show API key' });
  await expect(showBtn).toBeVisible();

  // Click to reveal key
  await showBtn.click();

  // Key should now be revealed
  await expect(keyCell).toContainText('sk_prod_1234567890abcdef');

  // The show button should now be "Hide API key"
  const hideBtn = page.getByRole('button', { name: 'Hide API key' });
  await expect(hideBtn).toBeVisible();

  // Copy button should now be visible beside revealed key
  const copyBtn = page.getByRole('button', { name: 'Copy API key' });
  await expect(copyBtn).toBeVisible();

  // Setup clipboard mock inside browser context to track text copied
  await page.evaluate(() => {
    (window as any).copiedText = '';
    navigator.clipboard.writeText = async (text) => {
      (window as any).copiedText = text;
    };
  });

  // Click Copy
  await copyBtn.click();

  // Verify the copied status is announced / has Check icon
  const copiedBtn = page.getByRole('button', { name: 'API key copied' });
  await expect(copiedBtn).toBeVisible();

  // Check custom clipboard text
  const copiedText = await page.evaluate(() => (window as any).copiedText);
  expect(copiedText).toBe('sk_prod_1234567890abcdef');

  // Generate screenshot of our shiny, highly accessible micro-UX interface
  await page.screenshot({ path: 'test-results/api-keys-ux-success.png' });
});
