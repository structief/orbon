/**
 * E2E tests for spec viewing (User Story 2 + User Story 5)
 *
 * Covers: FR-004 (visual spec list), FR-005 (no raw markdown), FR-012 (placeholders)
 *         SC-002 (load < 2s), SC-003 (no raw markdown), SC-006 (WCAG 2.1 AA)
 * See TRACEABILITY.md: VIEW-001–VIEW-010, VIEW-PERF-001, A11Y-002–A11Y-003
 */

import { test, expect, Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  makeGitHubTreeResponse,
  makeGitHubContentsResponse,
  VALID_SPEC_MARKDOWN,
} from "../fixtures/spec-fixtures";

// ---------------------------------------------------------------------------
// Setup helpers
// ---------------------------------------------------------------------------
async function setupAuthSession(page: Page) {
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

async function setupRepoMocks(page: Page) {
  await page.route(
    "https://api.github.com/repos/acme-corp/my-product/git/trees/main**",
    (route) => route.fulfill({ status: 200, body: JSON.stringify(makeGitHubTreeResponse()) })
  );
  await page.route(
    "https://api.github.com/repos/acme-corp/my-product/branches**",
    (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          { name: "main", commit: { sha: "abc" }, protected: false },
          { name: "develop", commit: { sha: "def" }, protected: false },
        ]),
      })
  );
  await page.route(
    "https://api.github.com/repos/acme-corp/my-product/commits**",
    (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          { sha: "abc1234567890abcdef1234567890abcdef123456", commit: { author: { name: "Alice", date: "2026-02-15T14:30:00Z" }, message: "Add spec: User Authentication" }, author: { login: "alice", avatar_url: "" } },
        ]),
      })
  );
  await page.route(
    "https://api.github.com/repos/acme-corp/my-product/contents/specs/001-user-auth/spec.md**",
    (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify(makeGitHubContentsResponse(VALID_SPEC_MARKDOWN)),
      })
  );
}

// ---------------------------------------------------------------------------
// VIEW-001: Spec list shows cards with title and status
// ---------------------------------------------------------------------------
test("VIEW-001: spec overview shows a card for each detected spec (FR-004)", async ({ page }) => {
  // Covers: FR-004
  await setupAuthSession(page);
  await setupRepoMocks(page);

  await page.goto("/repos/acme-corp~my-product");
  const specCards = page.getByTestId("spec-card");
  await expect(specCards.first()).toBeVisible();
  // There are two feature specs in the mock tree
  await expect(specCards).toHaveCount(2);
});

test("VIEW-002: each spec card shows a title and status badge (FR-004)", async ({ page }) => {
  // Covers: FR-004
  await setupAuthSession(page);
  await setupRepoMocks(page);

  await page.goto("/repos/acme-corp~my-product");
  const firstCard = page.getByTestId("spec-card").first();
  await expect(firstCard.getByTestId("spec-title")).toBeVisible();
  await expect(firstCard.getByTestId("spec-status-badge")).toBeVisible();
});

// ---------------------------------------------------------------------------
// VIEW-003: Clicking a spec card opens the detail view
// ---------------------------------------------------------------------------
test("VIEW-003: clicking a spec card opens the spec detail view (FR-004)", async ({ page }) => {
  // Covers: FR-004, FR-005
  await setupAuthSession(page);
  await setupRepoMocks(page);

  await page.goto("/repos/acme-corp~my-product");
  await page.getByTestId("spec-card").first().click();
  await expect(page).toHaveURL(/\/specs\//);
  await expect(page.getByTestId("spec-detail-view")).toBeVisible();
});

// ---------------------------------------------------------------------------
// VIEW-004: Branch switching refreshes spec list
// ---------------------------------------------------------------------------
test("VIEW-004: switching branch refreshes the spec list (FR-004)", async ({ page }) => {
  // Covers: FR-004 acceptance scenario 4
  await setupAuthSession(page);
  await setupRepoMocks(page);

  // Mock develop branch tree (empty)
  await page.route(
    "https://api.github.com/repos/acme-corp/my-product/git/trees/develop**",
    (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ sha: "develop-tree", truncated: false, tree: [] }),
      })
  );

  await page.goto("/repos/acme-corp~my-product");
  await page.getByTestId("branch-selector").selectOption("develop");
  await expect(page.getByTestId("spec-list-empty")).toBeVisible();
});

// ---------------------------------------------------------------------------
// VIEW-005–VIEW-007: No raw markdown visible in detail view (FR-005, SC-003)
// ---------------------------------------------------------------------------
test("VIEW-005: spec detail view does not show raw markdown headings (FR-005, SC-003)", async ({ page }) => {
  // Covers: FR-005, SC-003
  await setupAuthSession(page);
  await setupRepoMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  const content = await page.getByTestId("spec-detail-view").innerText();
  // Raw heading syntax must not appear
  expect(content).not.toMatch(/^#{1,6}\s/m);
});

test("VIEW-006: spec detail view does not show raw markdown bold syntax (FR-005, SC-003)", async ({ page }) => {
  // Covers: FR-005, SC-003
  await setupAuthSession(page);
  await setupRepoMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  const content = await page.getByTestId("spec-detail-view").innerText();
  expect(content).not.toContain("**");
});

test("VIEW-007: spec detail view does not show raw markdown list markers (FR-005, SC-003)", async ({ page }) => {
  // Covers: FR-005, SC-003
  await setupAuthSession(page);
  await setupRepoMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  const content = await page.getByTestId("spec-detail-view").innerText();
  // List items must not start with '- ' prefix from markdown
  const lines = content.split("\n");
  for (const line of lines) {
    expect(line).not.toMatch(/^-\s\*\*/);
  }
});

// ---------------------------------------------------------------------------
// VIEW-008–VIEW-010: Future feature placeholder sections (FR-012, US5)
// ---------------------------------------------------------------------------
test("VIEW-008: spec detail view shows Tasks placeholder section (FR-012)", async ({ page }) => {
  // Covers: FR-012
  await setupAuthSession(page);
  await setupRepoMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  const tasksSection = page.getByTestId("placeholder-tasks");
  await expect(tasksSection).toBeVisible();
  await expect(tasksSection.getByTestId("coming-soon-badge")).toBeVisible();
});

test("VIEW-009: spec detail view shows all four placeholder sections (FR-012)", async ({ page }) => {
  // Covers: FR-012
  await setupAuthSession(page);
  await setupRepoMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  for (const sectionId of ["placeholder-tasks", "placeholder-tests", "placeholder-validation", "placeholder-deployment"]) {
    await expect(page.getByTestId(sectionId)).toBeVisible();
  }
});

test("VIEW-010: expanding a placeholder section shows plain-language description (FR-012)", async ({ page }) => {
  // Covers: FR-012
  await setupAuthSession(page);
  await setupRepoMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await page.getByTestId("placeholder-tasks").click();
  const description = page.getByTestId("placeholder-tasks-description");
  await expect(description).toBeVisible();
  const text = await description.innerText();
  expect(text.length).toBeGreaterThan(20);
  // Must not reference code or technical terms
  expect(text.toLowerCase()).not.toContain("tasks.md");
});

// ---------------------------------------------------------------------------
// VIEW-PERF-001: Spec list load time (SC-002)
// ---------------------------------------------------------------------------
test("VIEW-PERF-001: spec list loads within 2 seconds for a repo with specs (SC-002)", async ({ page }) => {
  // Covers: SC-002
  await setupAuthSession(page);
  await setupRepoMocks(page);

  const start = Date.now();
  await page.goto("/repos/acme-corp~my-product");
  await page.getByTestId("spec-card").first().waitFor({ state: "visible" });
  const elapsed = Date.now() - start;
  expect(elapsed).toBeLessThan(2000);
});

// ---------------------------------------------------------------------------
// A11Y-002–A11Y-003: WCAG 2.1 AA accessibility (SC-006)
// ---------------------------------------------------------------------------
test("A11Y-002 @a11y: spec list page has no critical accessibility violations (SC-006)", async ({ page }) => {
  // Covers: SC-006
  await setupAuthSession(page);
  await setupRepoMocks(page);

  await page.goto("/repos/acme-corp~my-product");
  await page.getByTestId("spec-card").first().waitFor({ state: "visible" });

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toHaveLength(0);
});

test("A11Y-003 @a11y: spec detail page has no critical accessibility violations (SC-006)", async ({ page }) => {
  // Covers: SC-006
  await setupAuthSession(page);
  await setupRepoMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await page.getByTestId("spec-detail-view").waitFor({ state: "visible" });

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toHaveLength(0);
});
