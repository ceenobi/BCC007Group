import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // Run sequentially to avoid auth conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for stable auth state
  reporter: "html",
  use: {
    baseURL: "http://localhost:4500",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "admin-setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "member-setup",
      testMatch: /member\.setup\.ts/,
    },
    {
      name: "admin-tests",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["admin-setup"],
      testIgnore: /security\.spec\.ts/, // Core flows used admin
    },
    {
      name: "member-security",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/member.json",
      },
      dependencies: ["member-setup"],
      testMatch: /security\.spec\.ts/,
    },
  ],
});
