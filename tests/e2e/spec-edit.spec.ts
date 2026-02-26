/**
 * E2E tests for spec editing (User Story 3)
 *
 * Covers: FR-006 (visual editor), FR-007 (commit message), FR-010 (role-based access),
 *         FR-011 (unsaved-changes warning), SC-004 (edit→save→history), SC-005 (confirmation),
 *         Clarification C3 (manual status dropdown)
 * See TRACEABILITY.md: EDIT-001–EDIT-015, EDIT-E2E-001, A11Y-004
 */

import { test, expect, Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  makeGitHubContentsResponse,
  VALID_SPEC_MARKDOWN,
  PARSED_VALID_SPEC,
} from "../fixtures/spec-fixtures";

// ---------------------------------------------------------------------------
// Setup helpers
// ---------------------------------------------------------------------------
async function setupEditorSession(page: Page) {
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

async function setupViewerSession(page: Page) {
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: { id: "gh-99", displayName: "Bob Viewer", email: null, avatarUrl: "", role: "viewer" },
        accessToken: "mock_viewer_token",
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
  // Mock the save (PUT) endpoint
  await page.route(
    "https://api.github.com/repos/acme-corp/my-product/contents/specs/001-user-auth/spec.md",
    async (route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            content: { sha: "newblobsha456", path: "specs/001-user-auth/spec.md" },
            commit: { sha: "commitsha789", message: route.request().postDataJSON()?.message ?? "" },
          }),
        });
      } else {
        await route.continue();
      }
    }
  );
}

// ---------------------------------------------------------------------------
// EDIT-001: Edit button is visible for editor role
// ---------------------------------------------------------------------------
test("EDIT-001: 'Edit' button is visible for editor role (FR-006)", async ({ page }) => {
  // Covers: FR-006
  await setupEditorSession(page);
  await setupSpecMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await expect(page.getByRole("button", { name: /edit/i })).toBeVisible();
});

// ---------------------------------------------------------------------------
// EDIT-002: Clicking Edit switches to edit mode with form controls
// ---------------------------------------------------------------------------
test("EDIT-002: clicking Edit shows form controls for journey fields (FR-006)", async ({ page }) => {
  // Covers: FR-006
  await setupEditorSession(page);
  await setupSpecMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await page.getByRole("button", { name: /edit/i }).click();

  await expect(page.getByTestId("spec-editor")).toBeVisible();
  await expect(page.getByTestId("journey-title-input-1")).toBeVisible();
  await expect(page.getByTestId("journey-priority-select-1")).toBeVisible();
});

// ---------------------------------------------------------------------------
// EDIT-003–EDIT-004: Modifying and saving a journey
// ---------------------------------------------------------------------------
test("EDIT-003: modified journey title is saved and visible in detail view (FR-006)", async ({ page }) => {
  // Covers: FR-006, FR-007
  await setupEditorSession(page);
  await setupSpecMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await page.getByRole("button", { name: /edit/i }).click();

  await page.getByTestId("journey-title-input-1").fill("User Signs In via GitHub OAuth");
  await page.getByRole("button", { name: /save/i }).click();

  // Should navigate back to detail view
  await expect(page.getByTestId("spec-detail-view")).toBeVisible();
  await expect(page.getByTestId("spec-detail-view")).toContainText("User Signs In via GitHub OAuth");
});

test("EDIT-004: successful save shows a success confirmation (FR-006)", async ({ page }) => {
  // Covers: FR-006
  await setupEditorSession(page);
  await setupSpecMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await page.getByRole("button", { name: /edit/i }).click();
  await page.getByTestId("journey-title-input-1").fill("Updated Title");
  await page.getByRole("button", { name: /save/i }).click();

  // Confirmation must be visible (toast or inline)
  const confirmation = page.getByTestId("save-success");
  await expect(confirmation).toBeVisible();
});

// ---------------------------------------------------------------------------
// EDIT-005: Adding a new journey
// ---------------------------------------------------------------------------
test("EDIT-005: using 'Add Journey' creates a new journey form row (FR-006)", async ({ page }) => {
  // Covers: FR-006 acceptance scenario 3
  await setupEditorSession(page);
  await setupSpecMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await page.getByRole("button", { name: /edit/i }).click();

  const initialJourneyCount = await page.getByTestId(/journey-title-input-/).count();
  await page.getByRole("button", { name: /add journey/i }).click();
  const newCount = await page.getByTestId(/journey-title-input-/).count();
  expect(newCount).toBe(initialJourneyCount + 1);
});

// ---------------------------------------------------------------------------
// EDIT-006: Commit message is auto-generated (FR-007)
// ---------------------------------------------------------------------------
test("EDIT-006: save produces a commit with an auto-generated non-technical message (FR-007)", async ({ page }) => {
  // Covers: FR-007
  await setupEditorSession(page);

  let capturedCommitMessage = "";
  await page.route(
    "https://api.github.com/repos/acme-corp/my-product/contents/specs/001-user-auth/spec.md",
    async (route) => {
      if (route.request().method() === "PUT") {
        const body = route.request().postDataJSON();
        capturedCommitMessage = body?.message ?? "";
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            content: { sha: "new", path: "specs/001-user-auth/spec.md" },
            commit: { sha: "commit123", message: capturedCommitMessage },
          }),
        });
      } else {
        await route.continue();
      }
    }
  );
  await setupSpecMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await page.getByRole("button", { name: /edit/i }).click();
  await page.getByTestId("journey-title-input-1").fill("New Title");
  await page.getByRole("button", { name: /save/i }).click();
  await page.getByTestId("save-success").waitFor({ state: "visible" });

  // Message must follow the contract format
  expect(capturedCommitMessage).toMatch(/^Update spec: .+ — .+/);
  // Must not contain raw markdown
  expect(capturedCommitMessage).not.toMatch(/\*\*/);
});

// ---------------------------------------------------------------------------
// EDIT-007: Status dropdown (Clarification C3)
// ---------------------------------------------------------------------------
test("EDIT-007: editor can change spec status via dropdown (C3, FR-006)", async ({ page }) => {
  // Covers: FR-006, C3
  await setupEditorSession(page);
  await setupSpecMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await page.getByRole("button", { name: /edit/i }).click();

  const statusSelect = page.getByTestId("spec-status-select");
  await expect(statusSelect).toBeVisible();
  await statusSelect.selectOption("active");
  await page.getByRole("button", { name: /save/i }).click();

  await page.getByTestId("save-success").waitFor({ state: "visible" });
  const badge = page.getByTestId("spec-status-badge");
  await expect(badge).toContainText(/active/i);
});

// ---------------------------------------------------------------------------
// EDIT-008: Cancel discards changes
// ---------------------------------------------------------------------------
test("EDIT-008: cancelling edit returns to detail view without saving (FR-006)", async ({ page }) => {
  // Covers: FR-006
  await setupEditorSession(page);
  await setupSpecMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await page.getByRole("button", { name: /edit/i }).click();
  await page.getByTestId("journey-title-input-1").fill("Unsaved Change");
  await page.getByRole("button", { name: /cancel/i }).click();

  // Should be back on detail view
  await expect(page.getByTestId("spec-detail-view")).toBeVisible();
  // Original title should still show
  await expect(page.getByTestId("spec-detail-view")).not.toContainText("Unsaved Change");
});

// ---------------------------------------------------------------------------
// EDIT-009–EDIT-011: Role-based access (FR-010, Clarification C1)
// ---------------------------------------------------------------------------
test("EDIT-009: viewer role does not see the Edit button (FR-010)", async ({ page }) => {
  // Covers: FR-010, C1
  await setupViewerSession(page);
  await setupSpecMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  const editButton = page.getByRole("button", { name: /edit/i });
  await expect(editButton).not.toBeVisible();
});

test("EDIT-010: viewer navigating directly to /edit is redirected (FR-010)", async ({ page }) => {
  // Covers: FR-010 — direct URL access to edit page must be blocked
  await setupViewerSession(page);
  await setupSpecMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md/edit");
  // Should redirect away from edit page
  await expect(page).not.toHaveURL(/\/edit$/);
});

test("EDIT-011: all spec fields are read-only for viewer role (FR-010)", async ({ page }) => {
  // Covers: FR-010
  await setupViewerSession(page);
  await setupSpecMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  const inputs = await page.locator("input, textarea, select").all();
  for (const input of inputs) {
    // All form controls must be either absent or disabled/readonly
    const isEditableInput = await input.isEditable();
    expect(isEditableInput).toBe(false);
  }
});

// ---------------------------------------------------------------------------
// EDIT-012–EDIT-013: Unsaved changes warning (FR-011)
// ---------------------------------------------------------------------------
test("EDIT-012: navigating away with unsaved changes shows a warning (FR-011)", async ({ page }) => {
  // Covers: FR-011
  await setupEditorSession(page);
  await setupSpecMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await page.getByRole("button", { name: /edit/i }).click();
  await page.getByTestId("journey-title-input-1").fill("Some unsaved change");

  // Trigger navigation
  let dialogShown = false;
  page.once("dialog", async (dialog) => {
    dialogShown = true;
    await dialog.dismiss();
  });

  await page.getByRole("link", { name: /dashboard/i }).click();
  // Either native dialog or custom component should have been shown
  const customWarning = page.getByTestId("unsaved-changes-warning");
  const warningVisible = await customWarning.isVisible().catch(() => false);
  expect(dialogShown || warningVisible).toBe(true);
});

test("EDIT-013: guard is cleared after a successful save (FR-011)", async ({ page }) => {
  // Covers: FR-011 — guard must not fire after save
  await setupEditorSession(page);
  await setupSpecMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await page.getByRole("button", { name: /edit/i }).click();
  await page.getByTestId("journey-title-input-1").fill("Saved Change");
  await page.getByRole("button", { name: /save/i }).click();
  await page.getByTestId("save-success").waitFor({ state: "visible" });

  // Navigate away — no dialog should appear
  let dialogShown = false;
  page.once("dialog", async (dialog) => {
    dialogShown = true;
    await dialog.accept();
  });

  await page.getByRole("link", { name: /dashboard/i }).click();
  await page.waitForTimeout(500);
  expect(dialogShown).toBe(false);
});

// ---------------------------------------------------------------------------
// EDIT-014–EDIT-015: Confirmation for destructive actions (SC-005)
// ---------------------------------------------------------------------------
test("EDIT-014: deleting a journey shows a confirmation dialog (SC-005)", async ({ page }) => {
  // Covers: SC-005 — destructive actions must have confirmation step
  await setupEditorSession(page);
  await setupSpecMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await page.getByRole("button", { name: /edit/i }).click();
  await page.getByTestId("delete-journey-1").click();

  const dialog = page.getByTestId("confirm-dialog");
  await expect(dialog).toBeVisible();
  // Dialog must have plain-language text
  const text = await dialog.innerText();
  expect(text.length).toBeGreaterThan(30);
  expect(text.toLowerCase()).not.toContain("undefined");
});

test("EDIT-015: conflict resolution dialog shows plain-language explanation (SC-005)", async ({ page }) => {
  // Covers: SC-005, FR-006 conflict handling
  await setupEditorSession(page);
  await page.route(
    "https://api.github.com/repos/acme-corp/my-product/contents/specs/001-user-auth/spec.md**",
    (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify(makeGitHubContentsResponse(VALID_SPEC_MARKDOWN)),
      })
  );
  // Save returns 409 conflict
  await page.route(
    "https://api.github.com/repos/acme-corp/my-product/contents/specs/001-user-auth/spec.md",
    async (route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({
          status: 409,
          body: JSON.stringify({ message: "SHA mismatch" }),
        });
      } else {
        await route.continue();
      }
    }
  );

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await page.getByRole("button", { name: /edit/i }).click();
  await page.getByTestId("journey-title-input-1").fill("Conflicting Change");
  await page.getByRole("button", { name: /save/i }).click();

  const conflictDialog = page.getByTestId("conflict-dialog");
  await expect(conflictDialog).toBeVisible();
  const text = await conflictDialog.innerText();
  expect(text.toLowerCase()).toMatch(/changed|conflict|version/);
  expect(text.toLowerCase()).not.toContain("409");
});

// ---------------------------------------------------------------------------
// EDIT-E2E-001: Full edit → save → commit visible in history (SC-004)
// ---------------------------------------------------------------------------
test("EDIT-E2E-001: editing a spec and saving shows new commit in history tab (SC-004)", async ({ page }) => {
  // Covers: SC-004 — the end-to-end journey from edit to history entry
  await setupEditorSession(page);
  await setupSpecMocks(page);

  // Mock history returning two commits after save
  await page.route(
    "https://api.github.com/repos/acme-corp/my-product/commits**",
    (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            sha: "newcommit1234567890123456789012345678901",
            commit: { author: { name: "Alice", date: new Date().toISOString() }, message: "Update spec: User Authentication — Updated journey 1 title" },
            author: { login: "alice", avatar_url: "" },
          },
        ]),
      })
  );

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await page.getByRole("button", { name: /edit/i }).click();
  await page.getByTestId("journey-title-input-1").fill("Updated via E2E test");
  await page.getByRole("button", { name: /save/i }).click();
  await page.getByTestId("save-success").waitFor({ state: "visible" });

  // Open History tab
  await page.getByRole("tab", { name: /history/i }).click();
  const historyList = page.getByTestId("commit-history-list");
  await expect(historyList).toBeVisible();
  // Most recent commit should mention the change
  const latestEntry = historyList.getByTestId("commit-entry").first();
  await expect(latestEntry).toBeVisible();
});

// ---------------------------------------------------------------------------
// A11Y-004: Editor page accessibility (SC-006)
// ---------------------------------------------------------------------------
test("A11Y-004 @a11y: spec editor page has no critical accessibility violations (SC-006)", async ({ page }) => {
  // Covers: SC-006
  await setupEditorSession(page);
  await setupSpecMocks(page);

  await page.goto("/repos/acme-corp~my-product/specs/001-user-auth/spec.md");
  await page.getByRole("button", { name: /edit/i }).click();
  await page.getByTestId("spec-editor").waitFor({ state: "visible" });

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toHaveLength(0);
});
