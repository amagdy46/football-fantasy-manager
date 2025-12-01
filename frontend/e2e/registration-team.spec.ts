import { test, expect } from "@playwright/test";

test.describe("Registration & Team Creation", () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "password123";

  test("registers user, creates team with 20 players, and navigates to transfers", async ({
    page,
  }) => {
    await page.goto("/auth");
    await expect(page.locator("h1")).toContainText("Football Fantasy");

    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    await page.waitForSelector("text=Starting XI", { timeout: 30000 });

    await expect(page.locator("text=Budget")).toBeVisible();
    await expect(page.locator("text=€5,000,000")).toBeVisible();

    await expect(page.locator("text=List for Transfer").first()).toBeVisible();

    await page.click("text=Go to Transfer Market");
    await page.waitForURL("/transfers");

    await expect(page.locator("h1")).toContainText("Transfer Market");

    await page.locator('a[href="/dashboard"]').click();
    await page.waitForSelector("text=Starting XI");
    await expect(page.locator("text=Budget")).toBeVisible();
  });
});
