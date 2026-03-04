import { test, expect } from "@playwright/test";

test.describe("Security Flow - Unauthenticated Access", () => {
  // Use a completely clean context (no storage state)
  test.use({ storageState: { cookies: [], origins: [] } });

  test("should redirect unauthenticated user from dashboard to login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/account\/login/);
  });

  test("should redirect unauthenticated user from members to login", async ({
    page,
  }) => {
    await page.goto("/members");
    await expect(page).toHaveURL(/\/account\/login/);
  });

  test("should redirect unauthenticated user from payments to login", async ({
    page,
  }) => {
    await page.goto("/payments");
    await expect(page).toHaveURL(/\/account\/login/);
  });

  test("should redirect unauthenticated user from help-desk to login", async ({
    page,
  }) => {
    await page.goto("/help-desk");
    await expect(page).toHaveURL(/\/account\/login/);
  });
});

test.describe("Security Flow - Member Access Control", () => {
  // This describe block will be run in the 'member-security' project which has member storage state

  test("member should be able to access members list", async ({ page }) => {
    await page.goto("/members");
    // Verify heading is visible (ignoring AccessDenied since it was removed)
    await expect(page.getByRole("heading", { name: /members/i })).toBeVisible();
  });

  test("member should see appropriate links in sidebar", async ({ page }) => {
    await page.goto("/dashboard");
    // Use locator with href to be robust against collapsed sidebar labels
    await expect(page.locator('aside a[href="/dashboard"]')).toBeVisible();
    await expect(page.locator('aside a[href="/members"]')).toBeVisible();
    await expect(page.locator('aside a[href="/events"]')).toBeVisible();
    await expect(page.locator('aside a[href="/payments"]')).toBeVisible();
  });

  test("member should NOT see Transfers link in sidebar", async ({ page }) => {
    await page.goto("/dashboard");
    // Transfers is restricted to Admin/Super Admin
    await expect(page.locator('aside a[href="/transfers"]')).not.toBeVisible();
  });

  test("member should see Help Desk tickets", async ({ page }) => {
    await page.goto("/help-desk");
    await expect(
      page.getByRole("heading", { name: /help desk/i }),
    ).toBeVisible();
  });
});
