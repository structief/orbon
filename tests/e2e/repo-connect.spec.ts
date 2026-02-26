/**
 * E2E tests for repository connection (User Story 1 — repo connect portion)
 *
 * Covers: FR-002 (connect repos; PAT in cookie), FR-013 (error messages),
 *         Clarification C2 (PAT never in localStorage),
 *         Clarification C5 (no-spec-dir shows inline help, no file creation)
 * See TRACEABILITY.md: REPO-001–REPO-012, REPO-SEC-001–REPO-SEC-002
 */

import { test, expect, Page } from "@playwright/test";
import {
  makeGitHubTreeResponse,
} from "../fixtures/spec-fixtures";

// ---------------------------------------------------------------------------
// Setup: authenticated session + GitHub API mocks
// ---------------------------------------------------------------------------
async function setupAuthenticatedSession(page: Page) {
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: { id: "gh-42", displayName: "Alice", email: null, avatarUrl: "", role: "editor" },
        accessToken: "mock_token",
        expires: new Date(Date.now() + 86400000).toISOString(),
      }),
    })
  );
}

async function mockGitHubRepoValid(page: Page) {
  // Mock GitHub repo existence check
  await page.route("https://api.github.com/repos/acme-corp/my-product", (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        full_name: "acme-corp/my-product",
        default_branch: "main",
        private: false,
      }),
    })
  );
  // Mock branches
  await page.route("https://api.github.com/repos/acme-corp/my-product/branches**", (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify([
        { name: "main", commit: { sha: "abc123" }, protected: false },
        { name: "develop", commit: { sha: "def456" }, protected: false },
      ]),
    })
  );
  // Mock tree (has specs/ dir)
  await page.route("https://api.github.com/repos/acme-corp/my-product/git/trees/main**", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify(makeGitHubTreeResponse()) })
  );
}

async function mockGitHubRepoNoSpecDir(page: Page) {
  await page.route("https://api.github.com/repos/acme-corp/no-specs", (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({ full_name: "acme-corp/no-specs", default_branch: "main", private: false }),
    })
  );
  await page.route("https://api.github.com/repos/acme-corp/no-specs/git/trees/main**", (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({ sha: "tree", truncated: false, tree: [{ path: "README.md", type: "blob" }] }),
    })
  );
}

// ---------------------------------------------------------------------------
// REPO-001: Connect form is visible on the connect page
// ---------------------------------------------------------------------------
test("REPO-001: connect repository form is visible for authenticated users", async ({ page }) => {
  // Covers: FR-002
  await setupAuthenticatedSession(page);
  await page.goto("/repos/connect");
  await expect(page.getByTestId("repo-connect-form")).toBeVisible();
});

// ---------------------------------------------------------------------------
// REPO-002: Successful connection navigates to repo overview
// ---------------------------------------------------------------------------
test("REPO-002: successful repo connection navigates to spec overview", async ({ page }) => {
  // Covers: FR-002
  await setupAuthenticatedSession(page);
  await mockGitHubRepoValid(page);

  await page.goto("/repos/connect");
  await page.getByLabel(/owner/i).fill("acme-corp");
  await page.getByLabel(/repository name/i).fill("my-product");
  await page.getByRole("button", { name: /connect/i }).click();

  await expect(page).toHaveURL(/\/repos\/acme-corp\/my-product/);
});

// ---------------------------------------------------------------------------
// REPO-003: Branches are displayed after connection
// ---------------------------------------------------------------------------
test("REPO-003: branch selector shows available branches after connection", async ({ page }) => {
  // Covers: FR-002
  await setupAuthenticatedSession(page);
  await mockGitHubRepoValid(page);

  await page.goto("/repos/acme-corp~my-product");
  const branchSelector = page.getByTestId("branch-selector");
  await expect(branchSelector).toBeVisible();
  await expect(branchSelector).toContainText("main");
});

// ---------------------------------------------------------------------------
// REPO-004: Access-denied error shows non-technical message
// ---------------------------------------------------------------------------
test("REPO-004: access-denied error shows user-friendly message (FR-013)", async ({ page }) => {
  // Covers: FR-002, FR-013
  await setupAuthenticatedSession(page);
  await page.route("https://api.github.com/repos/acme-corp/private-repo", (route) =>
    route.fulfill({ status: 403, body: JSON.stringify({ message: "Forbidden" }) })
  );

  await page.goto("/repos/connect");
  await page.getByLabel(/owner/i).fill("acme-corp");
  await page.getByLabel(/repository name/i).fill("private-repo");
  await page.getByRole("button", { name: /connect/i }).click();

  const errorMsg = page.getByTestId("connect-error-message");
  await expect(errorMsg).toBeVisible();
  const text = await errorMsg.innerText();
  expect(text.toLowerCase()).not.toContain("403");
  expect(text.toLowerCase()).not.toContain("forbidden");
  expect(text.toLowerCase()).toMatch(/access|permission|grant/);
});

// ---------------------------------------------------------------------------
// REPO-005: Not-found error shows non-technical message
// ---------------------------------------------------------------------------
test("REPO-005: not-found repo shows user-friendly message (FR-013)", async ({ page }) => {
  // Covers: FR-002, FR-013
  await setupAuthenticatedSession(page);
  await page.route("https://api.github.com/repos/acme-corp/ghost", (route) =>
    route.fulfill({ status: 404, body: JSON.stringify({ message: "Not Found" }) })
  );

  await page.goto("/repos/connect");
  await page.getByLabel(/owner/i).fill("acme-corp");
  await page.getByLabel(/repository name/i).fill("ghost");
  await page.getByRole("button", { name: /connect/i }).click();

  const errorMsg = page.getByTestId("connect-error-message");
  await expect(errorMsg).toBeVisible();
  const text = await errorMsg.innerText();
  expect(text.toLowerCase()).not.toContain("404");
  expect(text.toLowerCase()).toMatch(/find|repository|check/);
});

// ---------------------------------------------------------------------------
// REPO-006–REPO-007: Form validation
// ---------------------------------------------------------------------------
test("REPO-006: empty owner field shows inline validation error", async ({ page }) => {
  // Covers: FR-002
  await setupAuthenticatedSession(page);
  await page.goto("/repos/connect");
  await page.getByRole("button", { name: /connect/i }).click();
  await expect(page.getByTestId("owner-error")).toBeVisible();
});

test("REPO-007: empty repo name field shows inline validation error", async ({ page }) => {
  // Covers: FR-002
  await setupAuthenticatedSession(page);
  await page.goto("/repos/connect");
  await page.getByLabel(/owner/i).fill("acme-corp");
  await page.getByRole("button", { name: /connect/i }).click();
  await expect(page.getByTestId("repo-name-error")).toBeVisible();
});

// ---------------------------------------------------------------------------
// REPO-008: Already-connected repo shows appropriate message
// ---------------------------------------------------------------------------
test("REPO-008: connecting an already-connected repo shows informative message", async ({ page }) => {
  // Covers: FR-002, FR-013
  await setupAuthenticatedSession(page);
  await mockGitHubRepoValid(page);

  // First connection succeeds
  await page.goto("/repos/connect");
  await page.getByLabel(/owner/i).fill("acme-corp");
  await page.getByLabel(/repository name/i).fill("my-product");
  await page.getByRole("button", { name: /connect/i }).click();
  await page.waitForURL(/\/repos\/acme-corp/);

  // Try to connect again
  await page.goto("/repos/connect");
  await page.getByLabel(/owner/i).fill("acme-corp");
  await page.getByLabel(/repository name/i).fill("my-product");
  await page.getByRole("button", { name: /connect/i }).click();

  const errorMsg = page.getByTestId("connect-error-message");
  await expect(errorMsg).toBeVisible();
  const text = await errorMsg.innerText();
  expect(text.toLowerCase()).toMatch(/already connected/i);
});

// ---------------------------------------------------------------------------
// REPO-009: Rate-limit error shows timed message (Clarification C4)
// ---------------------------------------------------------------------------
test("REPO-009: rate-limit error shows minutes-to-reset message (C4)", async ({ page }) => {
  // Covers: FR-013, C4
  const resetAt = Math.floor(Date.now() / 1000) + 300; // 5 minutes
  await setupAuthenticatedSession(page);
  await page.route("https://api.github.com/repos/acme-corp/any-repo", (route) =>
    route.fulfill({
      status: 403,
      headers: {
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": String(resetAt),
      },
      body: JSON.stringify({ message: "API rate limit exceeded" }),
    })
  );

  await page.goto("/repos/connect");
  await page.getByLabel(/owner/i).fill("acme-corp");
  await page.getByLabel(/repository name/i).fill("any-repo");
  await page.getByRole("button", { name: /connect/i }).click();

  const errorMsg = page.getByTestId("connect-error-message");
  await expect(errorMsg).toBeVisible();
  const text = await errorMsg.innerText();
  // Must mention minutes and not raw codes
  expect(text.toLowerCase()).toMatch(/minute|temporarily/);
  expect(text).not.toContain("403");
  expect(text.toLowerCase()).not.toContain("x-ratelimit");
});

// ---------------------------------------------------------------------------
// REPO-010: Token expiry prompts re-authentication mid-session
// ---------------------------------------------------------------------------
test("REPO-010: expired GitHub token prompts re-auth with clear message (FR-013)", async ({ page }) => {
  // Covers: FR-013
  await setupAuthenticatedSession(page);
  // Mid-session API call returns 401 (token revoked)
  await page.route("https://api.github.com/**", (route) =>
    route.fulfill({ status: 401, body: JSON.stringify({ message: "Bad credentials" }) })
  );

  await page.goto("/repos/connect");
  await page.getByLabel(/owner/i).fill("acme-corp");
  await page.getByLabel(/repository name/i).fill("any-repo");
  await page.getByRole("button", { name: /connect/i }).click();

  // Should redirect to login or show re-auth prompt
  const isOnLogin = await page.url().includes("/login");
  const hasReAuthPrompt = await page.getByTestId("reauth-prompt").isVisible().catch(() => false);
  expect(isOnLogin || hasReAuthPrompt).toBe(true);
});

// ---------------------------------------------------------------------------
// REPO-011–REPO-012: No spec directory — inline help panel (Clarification C5)
// ---------------------------------------------------------------------------
test("REPO-011: connecting repo with no spec dir shows inline help panel (C5)", async ({ page }) => {
  // Covers: C5 — no files created; help panel shown
  await setupAuthenticatedSession(page);
  await mockGitHubRepoNoSpecDir(page);

  await page.goto("/repos/connect");
  await page.getByLabel(/owner/i).fill("acme-corp");
  await page.getByLabel(/repository name/i).fill("no-specs");
  await page.getByRole("button", { name: /connect/i }).click();

  await page.waitForURL(/\/repos\/acme-corp/);
  const helpPanel = page.getByTestId("no-spec-dir-help");
  await expect(helpPanel).toBeVisible();
});

test("REPO-012: no-spec-dir help panel does NOT offer a file creation button (C5)", async ({ page }) => {
  // Covers: C5 — app MUST NOT create files without explicit action
  await setupAuthenticatedSession(page);
  await mockGitHubRepoNoSpecDir(page);

  await page.goto("/repos/connect");
  await page.getByLabel(/owner/i).fill("acme-corp");
  await page.getByLabel(/repository name/i).fill("no-specs");
  await page.getByRole("button", { name: /connect/i }).click();

  await page.waitForURL(/\/repos\/acme-corp/);
  const initButton = page.getByRole("button", { name: /initialize|create files/i });
  await expect(initButton).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// REPO-SEC-001–REPO-SEC-002: PAT storage security (Clarification C2)
// ---------------------------------------------------------------------------
test("REPO-SEC-001: PAT entered in form is NOT stored in localStorage (C2)", async ({ page }) => {
  // Covers: C2, FR-002 security constraint
  await setupAuthenticatedSession(page);
  await mockGitHubRepoValid(page);

  await page.goto("/repos/connect");
  await page.getByLabel(/owner/i).fill("acme-corp");
  await page.getByLabel(/repository name/i).fill("my-product");
  await page.getByLabel(/auth mode/i).selectOption("pat");
  await page.getByLabel(/personal access token/i).fill("ghp_supersecrettoken");
  await page.getByRole("button", { name: /connect/i }).click();

  // After form submission, check localStorage
  const localStorageEntries = await page.evaluate(() => {
    const entries: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      entries[key] = localStorage.getItem(key)!;
    }
    return entries;
  });

  const allValues = Object.values(localStorageEntries).join(" ");
  expect(allValues).not.toContain("ghp_supersecrettoken");
  expect(allValues).not.toContain("ghp_");
});

test("REPO-SEC-002: PAT is not visible in any DOM element after form submission (C2)", async ({ page }) => {
  // Covers: C2 — PAT must not be echoed back in the UI
  await setupAuthenticatedSession(page);
  await mockGitHubRepoValid(page);

  await page.goto("/repos/connect");
  await page.getByLabel(/owner/i).fill("acme-corp");
  await page.getByLabel(/repository name/i).fill("my-product");
  await page.getByLabel(/auth mode/i).selectOption("pat");
  await page.getByLabel(/personal access token/i).fill("ghp_supersecrettoken");
  await page.getByRole("button", { name: /connect/i }).click();
  await page.waitForURL(/\/repos\/acme-corp/);

  const pageContent = await page.content();
  expect(pageContent).not.toContain("ghp_supersecrettoken");
});
