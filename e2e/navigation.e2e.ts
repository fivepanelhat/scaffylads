import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  for (const [name, path] of [
    ["Projects", "/projects"],
    ["Schedule", "/schedule"],
    ["Logbook", "/logbook"],
  ] as const) {
    test(`${name} loads and renders a heading`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(400);
      await expect(page.getByRole("heading").first()).toBeVisible();
    });
  }

  test("logbook states where AI notes are sent before they are sent", async ({
    page,
  }) => {
    await page.goto("/logbook");
    // CAT_CONGRUENCE rule 1 / AGENTS.md rule 6: egress must be disclosed up
    // front, not only on the badge after the request has already gone.
    await expect(page.locator("body")).toContainText(/api\.x\.ai/);
    await expect(page.locator("body")).toContainText(/offline by default/i);
  });
});
