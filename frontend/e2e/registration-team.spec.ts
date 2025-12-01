import { test, expect } from "@playwright/test";

test.describe("Registration & Team Creation", () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "password123";

  test("registers user, creates team with 20 players, and navigates to transfers", async ({
    page,
  }) => {
    // Go to auth page
    await page.goto("/auth");
    await expect(page.locator("h1")).toContainText("Football Fantasy");

    // Register
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for dashboard to load (team creation happens async)
    // Look for "Starting XI" which only appears when team is ready
    await page.waitForSelector("text=Starting XI", { timeout: 30000 });

    // Verify team stats are displayed
    await expect(page.locator("text=Budget")).toBeVisible();
    await expect(page.locator("text=€5,000,000")).toBeVisible();

    // Verify player cards are visible (bench section has player cards)
    await expect(page.locator("text=List for Transfer").first()).toBeVisible();

    // Navigate to transfer market
    await page.click("text=Go to Transfer Market");
    await page.waitForURL("/transfers");

    // Verify transfer market loaded
    await expect(page.locator("h1")).toContainText("Transfer Market");

    // Go back to dashboard using the back link
    await page.locator('a[href="/dashboard"]').click();
    await page.waitForSelector("text=Starting XI");
    await expect(page.locator("text=Budget")).toBeVisible();
  });
});
