import { defineConfig, devices } from "@playwright/test";

/**
 * E2E configuration, following the Front_Line_Whanau pattern.
 *
 * Runs against a production build rather than the dev server: the hero has
 * a history of rendering differently once built, and the dev server hides
 * that class of problem.
 */
const PORT = process.env.E2E_PORT || "3200";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,

  reporter: process.env.CI ? [["list"], ["github"]] : [["list"]],

  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 5"] } },
  ],

  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
