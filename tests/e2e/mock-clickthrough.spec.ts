/**
 * E2E tests for the static mock UI (spec 002).
 * Journey: entry → dashboard → repo connect → spec overview → spec detail → edit.
 */

import { test, expect } from "@playwright/test";

const MOCK_BASE = "/mock";

test.describe("Mock click-through (User Story 1)", () => {
  test("entry → dashboard → repo connect → spec overview → spec detail → edit", async ({
    page,
  }) => {
    await page.goto(MOCK_BASE);

    await expect(page.getByRole("heading", { name: /sign-in|onboarding|preview/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /continue to mock dashboard/i }).first()).toBeVisible();

    await page.getByRole("link", { name: /continue to mock dashboard/i }).first().click();
    await expect(page).toHaveURL(/\/(mock\/)?dashboard/);
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /connect a repository/i })).toBeVisible();

    await page.getByRole("link", { name: /connect a repository/i }).click();
    await expect(page).toHaveURL(/\/(mock\/)?repos\/connect/);
    await expect(page.getByRole("heading", { name: /connect a repository/i })).toBeVisible();

    await page.getByRole("button", { name: /connect \(mock\)/i }).click();
    await expect(page).toHaveURL(/\/(mock\/)?repos\/repo-spec-editor/);
    await expect(page.getByRole("heading", { name: /structief.*spec-editor/i })).toBeVisible();

    const specLink = page.getByRole("link", { name: /Spec Editor MVP|Static Front-End Mockup/i }).first();
    await expect(specLink).toBeVisible();
    await specLink.click();
    await expect(page).toHaveURL(/\/(mock\/)?repos\/repo-spec-editor\/specs\/\w+/);
    await expect(page.getByRole("heading", { name: /Spec Editor MVP|Static Front-End Mockup/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /edit spec/i })).toBeVisible();

    await page.getByRole("link", { name: /edit spec/i }).click();
    await expect(page).toHaveURL(/\/edit/);
    await expect(page.getByRole("heading", { name: /edit spec \(mock\)/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /save \(mock\)/i })).toBeVisible();
  });
});
