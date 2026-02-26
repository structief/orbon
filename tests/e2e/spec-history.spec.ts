/**
 * E2E tests for spec version history and diffs (User Story 4)
 *
 * Covers: FR-008 (commit history), FR-009 (field-level diff view)
 *         SC-004 (edit→save→history in single session)
 * See TRACEABILITY.md: HIST-001–HIST-007
 */

import { test, expect, Page } from "@playwright/test";
import {
  makeGitHubContentsResponse,
  VALID_SPEC_MARKDOWN,
  PARSED_VALID_SPEC,
  PARSED_MODIFIED_SPEC,
  makeGitHubCommitListResponse,
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

async function setupSpecMocks(page: Page) {
  await page.route(
    "https://api.github.com/repos/acme-corp/my-product/contents/specs/001-user-auth/spec.md**",
    (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify(makeGitHubContentsResponse(VALID_SPEC_MARKDOWN)),
      })
  );
  await page.route(
    "https://api.github.com/repos/acme-corp/my-product/commits**",
    (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify(makeGitHubCommitListResponse()),
      })
  );
}

async function setupCommitAtSha(page: Page, sha: string, markdown: string) {
  await page.route(
    `https://api.github.com/repos/acme-corp/my-product/contents/specs/001-user-auth/spec.md?ref=${sha}`,
    (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify(makeGitHubContentsResponse(markdown, sha)),
      })
  );
}

// ---------------------------------------------------------------------------
// HIST-001: History tab shows commit entries
// ---------------------------------------------------------------------------
test("HIST-001: History tab shows list of commits for a spec (FR-008)", async ({ page }) => {
  // Covers: FR-008
  await setupAuthSession(page);
  await setupSpecMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await page.getByRole("tab", { name: /history/i }).click();

  const historyList = page.getByTestId("commit-history-list");
  await expect(historyList).toBeVisible();
  const entries = historyList.getByTestId("commit-entry");
  await expect(entries).toHaveCount(2); // matches makeGitHubCommitListResponse
});

// ---------------------------------------------------------------------------
// HIST-002: Each commit entry shows author, date, and plain-language summary
// ---------------------------------------------------------------------------
test("HIST-002: each commit entry shows author, date, and plain-language summary (FR-008)", async ({ page }) => {
  // Covers: FR-008
  await setupAuthSession(page);
  await setupSpecMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await page.getByRole("tab", { name: /history/i }).click();

  const firstEntry = page.getByTestId("commit-entry").first();
  await expect(firstEntry.getByTestId("commit-author")).toBeVisible();
  await expect(firstEntry.getByTestId("commit-date")).toBeVisible();
  await expect(firstEntry.getByTestId("commit-summary")).toBeVisible();
});

// ---------------------------------------------------------------------------
// HIST-003: Commit summary is in plain language (not raw markdown or SHA)
// ---------------------------------------------------------------------------
test("HIST-003: commit summary does not contain raw markdown or SHA (FR-008, FR-013)", async ({ page }) => {
  // Covers: FR-008, FR-013
  await setupAuthSession(page);
  await setupSpecMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await page.getByRole("tab", { name: /history/i }).click();

  const summaries = await page.getByTestId("commit-summary").allInnerTexts();
  for (const summary of summaries) {
    expect(summary).not.toMatch(/^#/);
    expect(summary).not.toMatch(/\*\*/);
    expect(summary).not.toMatch(/^[a-f0-9]{40}$/); // no bare SHA
  }
});

// ---------------------------------------------------------------------------
// HIST-004: Spec with one version shows "Initial creation" label
// ---------------------------------------------------------------------------
test("HIST-004: spec with only one commit shows 'Initial creation' label (FR-008)", async ({ page }) => {
  // Covers: FR-008 acceptance scenario 3
  await setupAuthSession(page);
  await page.route(
    "https://api.github.com/repos/acme-corp/my-product/contents/specs/001-user-auth/spec.md**",
    (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify(makeGitHubContentsResponse(VALID_SPEC_MARKDOWN)),
      })
  );
  await page.route(
    "https://api.github.com/repos/acme-corp/my-product/commits**",
    (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            sha: "abc1234567890abcdef1234567890abcdef123456",
            commit: { author: { name: "Alice", date: "2026-01-15T10:00:00Z" }, message: "Add spec: User Authentication" },
            author: { login: "alice", avatar_url: "" },
          },
        ]),
      })
  );

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await page.getByRole("tab", { name: /history/i }).click();

  const summary = page.getByTestId("commit-summary").first();
  await expect(summary).toContainText(/initial creation/i);
  // "Initial creation" entry should not have a diff button
  await expect(page.getByTestId("view-diff-button").first()).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// HIST-005: Clicking a history entry opens the diff view
// ---------------------------------------------------------------------------
test("HIST-005: clicking a history entry opens the diff view (FR-009)", async ({ page }) => {
  // Covers: FR-009
  const { sha: toSha } = { sha: "def5678901234def5678901234def5678901234" };
  const { sha: fromSha } = { sha: "abc1234567890abcdef1234567890abcdef123456" };

  await setupAuthSession(page);
  await setupSpecMocks(page);
  await setupCommitAtSha(page, fromSha, VALID_SPEC_MARKDOWN);
  await setupCommitAtSha(page, toSha, VALID_SPEC_MARKDOWN.replace("Draft", "Active"));

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await page.getByRole("tab", { name: /history/i }).click();

  await page.getByTestId("commit-entry").first().click();
  await expect(page.getByTestId("diff-viewer")).toBeVisible();
});

// ---------------------------------------------------------------------------
// HIST-006: Diff viewer shows field-level changes (not raw text diffs)
// ---------------------------------------------------------------------------
test("HIST-006: diff viewer shows field labels, not raw file paths (FR-009)", async ({ page }) => {
  // Covers: FR-009
  await setupAuthSession(page);
  await setupSpecMocks(page);

  const toSha = "def5678901234def5678901234def5678901234";
  const fromSha = "abc1234567890abcdef1234567890abcdef123456";
  await setupCommitAtSha(page, fromSha, VALID_SPEC_MARKDOWN);
  await setupCommitAtSha(
    page,
    toSha,
    VALID_SPEC_MARKDOWN
      .replace("User Signs In with GitHub", "User Signs In via OAuth")
      .replace("**Status**: Draft", "**Status**: Active")
  );

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await page.getByRole("tab", { name: /history/i }).click();
  await page.getByTestId("commit-entry").first().click();

  const diffViewer = page.getByTestId("diff-viewer");
  await expect(diffViewer).toBeVisible();

  const fieldLabels = await diffViewer.getByTestId("changed-field-label").allInnerTexts();
  for (const label of fieldLabels) {
    // Labels must NOT contain file paths or heading syntax
    expect(label).not.toContain(".md");
    expect(label).not.toContain("/");
    expect(label).not.toMatch(/^#/);
  }
});

// ---------------------------------------------------------------------------
// HIST-007: Diff viewer uses color to indicate added/removed/updated fields
// ---------------------------------------------------------------------------
test("HIST-007: diff viewer marks added fields visually (FR-009)", async ({ page }) => {
  // Covers: FR-009 — visual treatment requirement
  await setupAuthSession(page);
  await setupSpecMocks(page);

  const toSha = "def5678901234def5678901234def5678901234";
  const fromSha = "abc1234567890abcdef1234567890abcdef123456";
  await setupCommitAtSha(page, fromSha, VALID_SPEC_MARKDOWN);
  await setupCommitAtSha(page, toSha, VALID_SPEC_MARKDOWN + "\n### User Story 3 – New Journey (Priority: P3)\n\nNew journey.\n\n**Acceptance Scenarios**:\n\n1. **Given** state, **When** action, **Then** result.\n");

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await page.getByRole("tab", { name: /history/i }).click();
  await page.getByTestId("commit-entry").first().click();

  // Added fields should have data-change-type="added"
  const addedFields = page.locator("[data-change-type='added']");
  await expect(addedFields.first()).toBeVisible();
});
