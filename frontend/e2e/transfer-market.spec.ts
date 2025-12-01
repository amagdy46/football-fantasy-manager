import { test, expect } from "@playwright/test";
import { ApiHelper } from "./helpers/api";

test.describe("Transfer Market", () => {
  const testEmail = `transfer-${Date.now()}@example.com`;
  const testPassword = "password123";
  let authToken: string;

  test.beforeAll(async () => {
    const auth = await ApiHelper.authenticate(testEmail, testPassword);
    authToken = auth.token;
    await ApiHelper.waitForTeamReady(authToken, 30000);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/auth");
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForSelector("text=Starting XI", { timeout: 30000 });
  });

  test("list and unlist a player", async ({ page }) => {
    await page.locator("text=List for Transfer").first().click();

    await page.click("text=Confirm Listing");

    await expect(page.locator("text=Remove Listing").first()).toBeVisible({
      timeout: 5000,
    });

    await page.click("text=Go to Transfer Market");
    await page.waitForURL("/transfers");

    await expect(page.locator("text=Remove from Market").first()).toBeVisible();

    await page.locator('a[href="/dashboard"]').click();
    await page.waitForSelector("text=Starting XI");

    await page.locator("text=Remove Listing").first().click();

    await expect(page.locator("text=List for Transfer").first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("buy a player from transfer market", async ({ page }) => {
    await page.click("text=Go to Transfer Market");
    await page.waitForURL("/transfers");

    await page.locator("text=Buy Player").first().click();

    await expect(
      page.getByRole("heading", { name: "Confirm Purchase" })
    ).toBeVisible();
    await page.getByRole("button", { name: "Confirm Purchase" }).click();

    await expect(
      page.getByRole("heading", { name: "Confirm Purchase" })
    ).not.toBeVisible({
      timeout: 10000,
    });

    await page.locator('a[href="/dashboard"]').click();
    await page.waitForSelector("text=Starting XI");
    await expect(page.locator("text=Budget")).toBeVisible();
  });

  test("sell a player (AI buys via API)", async ({ page }) => {
    await page.locator("text=List for Transfer").first().click();
    await page.click("text=Confirm Listing");
    await expect(page.locator("text=Remove Listing").first()).toBeVisible({
      timeout: 5000,
    });

    const team = await ApiHelper.getTeam(authToken);
    const listedPlayer = team.players.find((p) => p.isOnTransferList);
    expect(listedPlayer).toBeDefined();

    const aiEmail = `ai-buyer-${Date.now()}@example.com`;
    const aiAuth = await ApiHelper.authenticate(aiEmail, "password123");
    await ApiHelper.waitForTeamReady(aiAuth.token, 30000);

    await ApiHelper.buyPlayer(aiAuth.token, listedPlayer!.id);

    await page.reload();
    await page.waitForSelector("text=Starting XI", { timeout: 30000 });

    await expect(page.locator("text=Budget")).toBeVisible();
  });
});
