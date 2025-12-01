import { test, expect } from "@playwright/test";
import { ApiHelper } from "./helpers/api";

test.describe("Transfer Market", () => {
  const testEmail = `transfer-${Date.now()}@example.com`;
  const testPassword = "password123";
  let authToken: string;

  test.beforeAll(async () => {
    // Register user and wait for team via API
    const auth = await ApiHelper.authenticate(testEmail, testPassword);
    authToken = auth.token;
    await ApiHelper.waitForTeamReady(authToken, 30000);
  });

  test.beforeEach(async ({ page }) => {
    // Login via UI
    await page.goto("/auth");
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForSelector("text=Starting XI", { timeout: 30000 });
  });

  test("list and unlist a player", async ({ page }) => {
    // Click first "List for Transfer" button on a player card
    await page.locator("text=List for Transfer").first().click();

    // Confirm listing in modal
    await page.click("text=Confirm Listing");

    // Wait for listing to complete - player should now show "Remove Listing"
    await expect(page.locator("text=Remove Listing").first()).toBeVisible({
      timeout: 5000,
    });

    // Go to transfer market and verify player is listed
    await page.click("text=Go to Transfer Market");
    await page.waitForURL("/transfers");

    // Should see our own player with unlist button (Remove from Market)
    await expect(page.locator("text=Remove from Market").first()).toBeVisible();

    // Go back to dashboard using the back arrow link
    await page.locator('a[href="/dashboard"]').click();
    await page.waitForSelector("text=Starting XI");

    // Remove listing
    await page.locator("text=Remove Listing").first().click();

    // Wait for unlisting - should show "List for Transfer" again
    await expect(page.locator("text=List for Transfer").first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("buy a player from transfer market", async ({ page }) => {
    // Go to transfer market
    await page.click("text=Go to Transfer Market");
    await page.waitForURL("/transfers");

    // Click buy on first available player (not our own)
    await page.locator("text=Buy Player").first().click();

    // Confirm purchase in modal - use the button specifically
    await expect(
      page.getByRole("heading", { name: "Confirm Purchase" })
    ).toBeVisible();
    await page.getByRole("button", { name: "Confirm Purchase" }).click();

    // Wait for modal to close (purchase complete)
    await expect(
      page.getByRole("heading", { name: "Confirm Purchase" })
    ).not.toBeVisible({
      timeout: 10000,
    });

    // Go back to dashboard - verify we still have team
    await page.locator('a[href="/dashboard"]').click();
    await page.waitForSelector("text=Starting XI");
    await expect(page.locator("text=Budget")).toBeVisible();
  });

  test("sell a player (AI buys via API)", async ({ page }) => {
    // List a player via UI
    await page.locator("text=List for Transfer").first().click();
    await page.click("text=Confirm Listing");
    await expect(page.locator("text=Remove Listing").first()).toBeVisible({
      timeout: 5000,
    });

    // Get the listed player's ID from API
    const team = await ApiHelper.getTeam(authToken);
    const listedPlayer = team.players.find((p) => p.isOnTransferList);
    expect(listedPlayer).toBeDefined();

    // Create an AI buyer and have them buy the player
    const aiEmail = `ai-buyer-${Date.now()}@example.com`;
    const aiAuth = await ApiHelper.authenticate(aiEmail, "password123");
    await ApiHelper.waitForTeamReady(aiAuth.token, 30000);

    // AI buys the player
    await ApiHelper.buyPlayer(aiAuth.token, listedPlayer!.id);

    // Refresh the page to see updated data
    await page.reload();
    await page.waitForSelector("text=Starting XI", { timeout: 30000 });

    // The listed player should no longer show "Remove Listing" (was sold)
    // Verify team still loads correctly
    await expect(page.locator("text=Budget")).toBeVisible();
  });
});
