/**
 * E2E tests for mock secondary flows (User Story 3).
 * History tab, placeholder sections, empty/error-like states.
 */

import { test, expect } from "@playwright/test";

const MOCK_BASE = "/mock";

test.describe("Mock secondary flows (User Story 3)", () => {
  test("history tab and placeholder sections are visible from spec detail", async ({
    page,
  }) => {
    await page.goto(MOCK_BASE);
    await page.getByRole("link", { name: /continue to mock dashboard/i }).first().click();
    await page.getByRole("link", { name: /connect a repository/i }).click();
    await page.getByRole("button", { name: /connect \(mock\)/i }).click();
    await page.getByRole("link", { name: /Spec Editor MVP|Static Front-End Mockup/i }).first().click();

    await expect(page.getByRole("tab", { name: /detail/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /history/i })).toBeVisible();

    await expect(page.getByText(/user journeys|requirements|success criteria/i).first()).toBeVisible();
    await expect(page.getByText(/future sections|Tasks|Tests|Validation|Deployment/i).first()).toBeVisible();

    await page.getByRole("tab", { name: /history/i }).click();
    await expect(page.getByRole("link", { name: /open history page/i })).toBeVisible();
    await page.getByRole("link", { name: /open history page/i }).click();
    await expect(page).toHaveURL(/\/history/);
    await expect(page.getByRole("heading", { name: /history \(mock\)/i })).toBeVisible();
  });
});
