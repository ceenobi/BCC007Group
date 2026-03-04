import { test, expect } from "@playwright/test";

test.describe("Onboarding Flow", () => {
  test("should navigate to onboarding page when user is not onboarded", async ({
    page,
  }) => {
    // Navigate to a page that requires onboarding or is part of the flow
    await page.goto("/members/onboarding");

    // Check for welcome message
    await expect(page.getByText("Welcome aboard!")).toBeVisible({
      timeout: 15000,
    });

    // Step 1 should be visible
    await expect(page.getByText("Step 1")).toBeVisible();
  });

  test("should show onboarding progress steps", async ({ page }) => {
    await page.goto("/members/onboarding?step=2");
    await expect(
      page.getByRole("heading", { name: "Update Profile" }),
    ).toBeVisible({
      timeout: 10000,
    });
  });
});
