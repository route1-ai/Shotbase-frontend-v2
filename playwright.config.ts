import { defineConfig, devices } from '@playwright/test';

/**
 * E2E smoke tests run against LIVE production by default (https://shotbase.dev).
 * Override with BASE_URL env var to point at a preview or localhost:
 *   BASE_URL=http://localhost:3000 npx playwright test
 *
 * No `webServer` block on purpose — the site is already deployed, so we don't
 * boot a local dev server. Tests here are READ-ONLY (no signup/form submits)
 * so they never write junk into real Supabase/Clerk data.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL ?? 'https://shotbase.dev',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
