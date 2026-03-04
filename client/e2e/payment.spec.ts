import { test, expect } from "@playwright/test";

test.describe("Payment Flow", () => {
  test("should navigate to payments and open payment modal", async ({
    page,
  }) => {
    // Navigate to payments page
    await page.goto("/payments");
    await expect(page.getByRole("heading", { name: "Payments" })).toBeVisible();

    // Open the payment modal
    await page.getByRole("button", { name: "New Payment" }).click();
    await expect(page.getByText("Make a payment")).toBeVisible();

    // Select payment type via the custom Select component (combobox)
    const selectTrigger = page.getByRole("combobox").first();
    await selectTrigger.click();
    await page.getByRole("option", { name: "membership_dues" }).click();

    // Verify the amount is auto-filled (should be 2000 for membership dues)
    const amountInput = page.getByPlaceholder("Enter amount");
    await expect(amountInput).toHaveValue("2000");

    // Verify "Proceed to Pay" button is present and enabled
    const proceedBtn = page.getByRole("button", { name: "Proceed to Pay" });
    await expect(proceedBtn).toBeVisible();
    await expect(proceedBtn).toBeEnabled();
  });

  test("should display payment history tab", async ({ page }) => {
    await page.goto("/payments");
    await expect(page.getByRole("tab", { name: /history/i })).toBeVisible();
  });
});
