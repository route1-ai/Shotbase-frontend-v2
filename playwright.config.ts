import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E config for Shotbase.
 *
 * Local: `npm run dev` is started automatically (reused if already running).
 * CI:    builds + starts the production server so the prerendered routes
 *        match what shotbase.dev actually serves.
 * Prod:  set BASE_URL=https://shotbase.dev to run smoke tests against live.
 *
 * See https://playwright.dev/docs/test-configuration
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const RUN_AGAINST_REMOTE = BASE_URL !== 'http://localhost:3000'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html'], ['github']] : 'html',

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Only spin up a local server when targeting localhost. If BASE_URL points
  // at a deployed origin (preview / prod), skip the webServer entirely.
  webServer: RUN_AGAINST_REMOTE
    ? undefined
    : {
        command: process.env.CI ? 'npm run start' : 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 180 * 1000,
      },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Add firefox / webkit later if cross-browser coverage matters.
  ],
})
