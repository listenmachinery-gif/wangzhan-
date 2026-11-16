import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: ".playwright/results",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  // A fresh worker recovers from a one-off test-database connection reset;
  // every business assertion still has to pass unchanged on the retry.
  retries: 1,
  // E2E fixtures share one protected PostgreSQL test database and must not clean up each other's records.
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_GA4_MEASUREMENT_ID:
        process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "G-ZYRONTEST",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
