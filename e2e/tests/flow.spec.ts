import { test, expect } from "@playwright/test";

test("user flow: register, team creation, dashboard, transfers", async ({
  page,
}) => {
  // 1. Register
  await page.goto("/auth");
  const email = `user${Date.now()}@example.com`;
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', "password123");
  await page.click('button[type="submit"]');

  // 2. Wait for loading / dashboard
  // Depending on speed, it might show loading or go straight to dashboard if fast (unlikely with polling)
  await expect(page).toHaveURL(/\/loading|\/dashboard/);

  // Wait for dashboard (polling might take up to 60s in worst case, but usually faster)
  await expect(page).toHaveURL("/dashboard", { timeout: 60000 });

  // 3. Check Dashboard Content
  await expect(page.getByText("Starting XI")).toBeVisible();
  await expect(page.getByText("Bench & Reserves")).toBeVisible();
  await expect(page.getByText("Team Name")).toBeVisible();

  // 4. Go to Transfer Market
  // We added a link "Go to Transfer Market" or similar
  await page.click('a[href="/transfers"]');

  await expect(page).toHaveURL("/transfers");
  await expect(
    page.getByRole("heading", { name: "Transfer Market" })
  ).toBeVisible();
  await expect(page.getByText("Budget:")).toBeVisible();

  // 5. Check filters exist
  await expect(page.getByLabel("Player Name")).toBeVisible();
  await expect(page.getByLabel("Team Name")).toBeVisible();
});
