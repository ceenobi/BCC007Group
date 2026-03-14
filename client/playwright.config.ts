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
  webServer: [
    {
      command: "yarn dev",
      url: "http://localhost:4500",
      reuseExistingServer: !process.env.CI,
      stdout: "pipe",
      stderr: "pipe",
      timeout: 120_000,
    },
    {
      command: "cd ../server && NODE_ENV=development DATABASE_URL=${DATABASE_URL} BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET} CLIENT_URL=${CLIENT_URL} SERVER_URL=${SERVER_URL} UPSTASH_REDIS_REST_URL=${UPSTASH_REDIS_REST_URL} UPSTASH_REDIS_REST_TOKEN=${UPSTASH_REDIS_REST_TOKEN} QSTASH_TOKEN=${QSTASH_TOKEN} QSTASH_URL=${QSTASH_URL} PAYSTACK_SECRET_KEY=${PAYSTACK_SECRET_KEY} PAYSTACK_PUBLIC_KEY=${PAYSTACK_PUBLIC_KEY} CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME} CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY} CLOUDINARY_SECRET_KEY=${CLOUDINARY_SECRET_KEY} CLOUDINARY_UPLOAD_PRESET=${CLOUDINARY_UPLOAD_PRESET} RESEND_API_KEY=${RESEND_API_KEY} yarn dev",
      url: "http://localhost:4600",
      reuseExistingServer: !process.env.CI,
      stdout: "pipe",
      stderr: "pipe",
      timeout: 120_000,
    },
  ],
});
