import { test, expect } from "@playwright/test";

test.describe("Help Desk Flow", () => {
  test("should allow creating a new support ticket", async ({ page }) => {
    // Navigate with action=create to auto-open dialog
    await page.goto("/help-desk?action=create");

    // Verify dialog title appears
    await expect(page.getByText("Create Support Ticket")).toBeVisible({
      timeout: 20000,
    });

    // Fill in ticket fields
    await page
      .getByPlaceholder("Title")
      .fill("E2E Test Ticket - Support Issue");
    await page
      .getByPlaceholder("Description")
      .fill("This is an automated E2E test ticket. Please ignore.");

    // Select priority
    const selects = page.getByRole("combobox");
    await selects.first().click();
    await page
      .getByRole("option", { name: /low|medium|high|critical/i })
      .first()
      .click();

    // Select category
    await selects.nth(1).click();
    await page
      .getByRole("option", { name: /payment|event|other/i })
      .first()
      .click();

    // Submit
    await page.getByRole("button", { name: "Create ticket" }).click();

    // Verify success toast
    await expect(page.getByText(/Ticket created/i)).toBeVisible({
      timeout: 20000,
    });
  });

  test("should display tickets tab content", async ({ page }) => {
    await page.goto("/help-desk");
    // Wait for the tabs to be visible
    const ticketTab = page.getByRole("tab", { name: /tickets/i });
    await expect(ticketTab).toBeVisible({ timeout: 15000 });

    // Confirm presence of content or "No tickets found"
    await expect(
      page
        .getByText(/no tickets found/i)
        .or(page.getByText("Help Desk & Support")),
    ).toBeVisible({ timeout: 15000 });
  });
});
