import { test as setup, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, ".auth/user.json");

setup("authenticate as admin", async ({ page }) => {
  await page.goto("/account/login");
  await page.getByPlaceholder("Your email").fill("ceenobi@icloud.com");
  await page.getByPlaceholder("Your password").fill("Techstudio!!1");
  await page.getByRole("button", { name: "Sign In" }).click();
  // Wait for redirect to dashboard after login
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible({
    timeout: 10000,
  });
  // Save storage state for reuse in tests
  await page.context().storageState({ path: authFile });
});
