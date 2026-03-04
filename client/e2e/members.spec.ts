import { test, expect } from "@playwright/test";

test.describe("Members Management Flow", () => {
  test("should assign a role to a member", async ({ page }) => {
    await page.goto("/members");

    // Switch to Roles tab
    const rolesTab = page.getByRole("tab", { name: /roles/i });
    await rolesTab.click();

    // Ensure the Assign Role table is visible (Wait for S/N header)
    await expect(page.getByText("S/N", { exact: true })).toBeVisible({
      timeout: 15000,
    });

    // Target the first member row (skipping header)
    // In AssignRole.tsx, rows are divs within CardContent
    const rows = page.locator(".col-span-5").filter({ hasText: /.+/ }); // Get name column cells
    const firstMemberName = await rows.first().innerText();

    // Get current role of the first member
    const firstMemberRow = page
      .locator("div[key]")
      .first()
      .or(page.locator("div.grid-cols-12").nth(1));
    const currentRoleBadge = firstMemberRow
      .locator(".col-span-4")
      .locator(".Badge");
    // If we can't find the badge easily, we'll just try to click "Assign Role" and then a different role

    const assignBtn = firstMemberRow.getByRole("button", {
      name: /assign role/i,
    });
    await assignBtn.click();

    // Determine target role (toggle between Member and Admin)
    // We'll just click Member first, if it fails to show toast (because already member), we don't care in this hardened version
    // But to be sure, we'll click "Admin" then "Member" or something.
    // Actually, let's just use the "Member" role but ensure we click it if it's NOT checked.
    const memberOption = page.getByRole("menuitemcheckbox", {
      name: "Member",
      exact: true,
    });
    const isAdmin = await page
      .getByRole("menuitemcheckbox", { name: "Admin", exact: true })
      .getAttribute("aria-checked");

    if (isAdmin === "true") {
      await memberOption.click();
    } else {
      await page
        .getByRole("menuitemcheckbox", { name: "Admin", exact: true })
        .click();
    }

    // Verify success toast
    await expect(
      page.getByText(/Role assigned successfully|successfully updated/i),
    ).toBeVisible({ timeout: 20000 });
  });

  test("should search for a member", async ({ page }) => {
    await page.goto("/members");
    const searchInput = page.getByPlaceholder(/search member name/i);
    await searchInput.fill("Cobi");
    await searchInput.press("Enter");

    // Wait for filtered results
    await expect(page.getByText("Cobi Mbachu").first()).toBeVisible({
      timeout: 10000,
    });
  });
});
