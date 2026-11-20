import { expect, test } from "@playwright/test";

const routes = ["/", "/shipping-highlights", "/cases", "/news"];

test("keeps navigation, compatibility routes, and responsive layouts usable", async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 768, height: 1024 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), `${route} should remain available at ${viewport.width}px`).toBe(200);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${route} should not overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);
    }
    await page.goto("/");
    if (viewport.width < 1280) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      const mobileNavigation = page.getByRole("dialog", { name: "Site navigation" });
      await expect(mobileNavigation).toBeVisible();
      const support = mobileNavigation.getByText("SUPPORT", { exact: true });
      await expect(support).toBeVisible();
      await support.click();
      await expect(mobileNavigation.getByRole("link", { name: "Shipping Highlights", exact: true })).toBeVisible();
    } else {
      await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
    }
  }
});
