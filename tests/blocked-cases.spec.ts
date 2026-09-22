import { test } from '@playwright/test';

/**
 * BLOCKED-CASES — frontend flows that require test-mode fixtures/accounts that do not
 * exist in this environment. Every test here is a documented blocker (matrix section 10),
 * skipped so the suite stays green without hiding the gap.
 * Do NOT run against real production accounts.
 */

test.skip('FE-01 API key list renders in dashboard', async () => {
  // BLOCKED: needs Clerk test account + running backend
});

test.skip('FE-02 API key create returns a working key', async () => {
  // BLOCKED: needs Clerk test account + Unkey test API
});

test.skip('FE-03 API key revoke invalidates the key server-side', async () => {
  // BLOCKED: needs Clerk test account + Unkey test API
});

test.skip('FE-04 wrong-user revoke is rejected', async () => {
  // BLOCKED: needs two Clerk test accounts
});

test.skip('FE-06..08 pricing page shows known Starter/Pro/Scale prices', async () => {
  // BLOCKED: prices not documented anywhere in repo docs; needs product confirmation
});

test.skip('FE-09 unknown price is never treated as Pro', async () => {
  // BLOCKED: needs Stripe test fixtures
});

test.skip('FE-10 subscription upgrade propagates to Unkey meta.plan', async () => {
  // BLOCKED: needs Stripe CLI + test-mode keys + backend webhook
});

test.skip('FE-11 subscription downgrade propagates to Unkey meta.plan', async () => {
  // BLOCKED: needs Stripe CLI + test-mode keys
});

test.skip('FE-12 cancellation downgrades plan', async () => {
  // BLOCKED: needs Stripe CLI + test-mode keys
});

test.skip('FE-14 playground quota-reached state', async () => {
  // BLOCKED: needs quota feature (does not exist in backend yet)
});
