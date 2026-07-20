import { test, expect } from "@playwright/test";

/**
 * Dashboard and hero.
 *
 * The hero has repeatedly shipped in a state where it occupied space but
 * painted nothing - once needing an !important sweep to force it visible.
 * A "renders" assertion alone would not have caught that, because the
 * element was present and sized the whole time. These tests assert it is
 * actually painted.
 *
 * The root selector tracks whatever the current hero is called (.product-hero
 * since the fleet-style redesign). If it is renamed again these fail loudly
 * with "element(s) not found", which is the intended behaviour - a silent pass
 * against a hero that no longer exists would be worse than a red build.
 */
test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("hero is present and actually painted", async ({ page }) => {
    const hero = page.locator(".product-hero");
    await expect(hero).toBeVisible();

    // toBeVisible() passes on a fully transparent element, so check the
    // paint properties that the previous regressions actually broke.
    const painted = await hero.evaluate((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        opacity: Number(cs.opacity),
        visibility: cs.visibility,
        display: cs.display,
        width: r.width,
        height: r.height,
      };
    });

    expect(painted.opacity).toBeGreaterThan(0);
    expect(painted.visibility).toBe("visible");
    expect(painted.display).not.toBe("none");
    expect(painted.width).toBeGreaterThan(200);
    expect(painted.height).toBeGreaterThan(150);
  });

  test("hero heading is readable", async ({ page }) => {
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();
    await expect(h1).not.toBeEmpty();
  });

  test("no leftover debug text is shown to users", async ({ page }) => {
    // A "Super Grok hero" ribbon was rendering on the live landing page.
    await expect(page.locator("body")).not.toContainText(/super grok/i);
  });

  test("hero calls to action reach their pages", async ({ page }) => {
    const hero = page.locator(".product-hero");

    // Scoped to the hero: "Schedule" also appears in the top nav, and an
    // unscoped lookup would pass even if the hero's own CTA were broken.
    await hero.getByRole("link", { name: "New log entry" }).click();
    await expect(page).toHaveURL(/\/logbook$/);

    await page.goto("/");
    await hero.getByRole("link", { name: "Schedule", exact: true }).click();
    await expect(page).toHaveURL(/\/schedule$/);
  });

  test("summary tiles render", async ({ page }) => {
    for (const label of ["Active projects", "Shifts scheduled", "Log entries"]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test("page does not scroll sideways", async ({ page }) => {
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflows).toBe(false);
  });
});
