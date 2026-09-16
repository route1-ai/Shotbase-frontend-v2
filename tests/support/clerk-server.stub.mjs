// Test stub for '@clerk/nextjs/server'. auth() returns whatever userId the test
// has placed in __TEST_CLERK_USER_ID__ (or null to simulate a signed-out user).
// This lets us exercise the REAL route handler without a Next runtime.
export async function auth() {
  const userId = process.env.__TEST_CLERK_USER_ID__ || null
  return { userId }
}
export async function currentUser() {
  return null
}
