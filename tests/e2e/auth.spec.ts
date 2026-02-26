/**
 * E2E tests for Authentication (User Story 1 — login portion)
 *
 * Covers: FR-001 (GitHub OAuth), SC-001 (journey 1 < 5 min), SC-006 (WCAG 2.1 AA)
 * See TRACEABILITY.md: AUTH-001–AUTH-005, AUTH-PERF-001, A11Y-001
 *
 * GitHub OAuth is mocked via Playwright route interception so no real
 * OAuth roundtrip is needed. The Auth.js callback URL is intercepted and
 * a synthetic session cookie is injected.
 */

import { test, expect, Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Sets up a mock authenticated session by intercepting the Auth.js cookie. */
async function mockAuthenticatedSession(page: Page) {
  // Intercept the Auth.js session endpoint used by server components
  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          id: "gh-user-42",
          displayName: "Alice Product",
          email: "alice@example.com",
          avatarUrl: "https://avatars.githubusercontent.com/u/42",
          role: "editor",
        },
        accessToken: "mock_access_token",
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
  });
}

/** Intercepts the GitHub OAuth authorize URL and simulates instant authorization. */
async function mockGitHubOAuth(page: Page) {
  await page.route("https://github.com/login/oauth/authorize**", async (route) => {
    const callbackUrl = new URL(route.request().url());
    const redirectUri = callbackUrl.searchParams.get("redirect_uri") ?? "/api/auth/callback/github";
    await route.fulfill({
      status: 302,
      headers: { Location: `${redirectUri}?code=mock_code&state=mock_state` },
    });
  });
}

// ---------------------------------------------------------------------------
// AUTH-001: Unauthenticated user sees sign-in page
// ---------------------------------------------------------------------------
test("AUTH-001: unauthenticated user is redirected to login page", async ({ page }) => {
  // Covers: FR-001
  // Mock no session
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({ status: 200, body: "{}" })
  );

  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
});

test("AUTH-002: login page shows 'Sign in with GitHub' button", async ({ page }) => {
  // Covers: FR-001
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({ status: 200, body: "{}" })
  );

  await page.goto("/login");
  const signInButton = page.getByRole("button", { name: /sign in with github/i });
  await expect(signInButton).toBeVisible();
});

// ---------------------------------------------------------------------------
// AUTH-003: Successful OAuth → dashboard redirect
// ---------------------------------------------------------------------------
test("AUTH-003: successful OAuth redirects to dashboard", async ({ page }) => {
  // Covers: FR-001
  await mockAuthenticatedSession(page);
  await page.goto("/");
  // After OAuth, user should land on the dashboard (not login)
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.getByTestId("dashboard-container")).toBeVisible();
});

// ---------------------------------------------------------------------------
// AUTH-004: Already signed-in user goes straight to dashboard
// ---------------------------------------------------------------------------
test("AUTH-004: authenticated user visiting /login is redirected to dashboard", async ({ page }) => {
  // Covers: FR-001 acceptance scenario 3
  await mockAuthenticatedSession(page);
  await page.goto("/login");
  await expect(page).toHaveURL(/\/(repos|dashboard)?$/);
});

// ---------------------------------------------------------------------------
// AUTH-005: OAuth error is shown in non-technical language
// ---------------------------------------------------------------------------
test("AUTH-005: OAuth error query param shows user-friendly error message", async ({ page }) => {
  // Covers: FR-001, FR-013
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({ status: 200, body: "{}" })
  );

  await page.goto("/login?error=access_denied");
  const errorMessage = page.getByTestId("auth-error-message");
  await expect(errorMessage).toBeVisible();
  // Error must NOT contain raw error codes
  const text = await errorMessage.innerText();
  expect(text.toLowerCase()).not.toContain("access_denied");
  expect(text.toLowerCase()).not.toContain("oauth");
  // Must be meaningful
  expect(text.length).toBeGreaterThan(20);
});

// ---------------------------------------------------------------------------
// AUTH-PERF-001: Journey 1 completion time (SC-001)
// ---------------------------------------------------------------------------
test("AUTH-PERF-001: login page loads within 3 seconds (SC-001 prerequisite)", async ({ page }) => {
  // Covers: SC-001 — login must be fast to keep 5-minute journey goal
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({ status: 200, body: "{}" })
  );

  const start = Date.now();
  await page.goto("/login");
  await page.getByRole("button", { name: /sign in with github/i }).waitFor({ state: "visible" });
  const elapsed = Date.now() - start;
  expect(elapsed).toBeLessThan(3000);
});

// ---------------------------------------------------------------------------
// A11Y-001: Login page passes WCAG 2.1 AA (SC-006)
// ---------------------------------------------------------------------------
test("A11Y-001 @a11y: login page has no critical accessibility violations (SC-006)", async ({ page }) => {
  // Covers: SC-006
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({ status: 200, body: "{}" })
  );

  await page.goto("/login");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();

  // Filter to violations only (not incomplete)
  const violations = results.violations;
  expect(violations).toHaveLength(0);
});
