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

test("uses the shared Machines catalogue on desktop and mobile", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open Machines menu" }).click();
  const megaMenu = page.getByRole("region", { name: "Machines mega menu" });
  await expect(megaMenu).toBeVisible();
  await megaMenu.getByRole("tab", { name: /PRESS BRAKES/i }).click();
  await expect(megaMenu.getByRole("link", { name: /Press Brake/i }).first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(megaMenu).toBeHidden();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  const drawer = page.getByRole("dialog", { name: "Site navigation" });
  await drawer.getByRole("button", { name: "MACHINES" }).click();
  await expect(drawer.getByRole("heading", { name: "Machines" })).toBeVisible();
  await drawer.getByRole("button", { name: /SHEARING MACHINES/i }).click();
  await expect(drawer.getByRole("heading", { name: "SHEARING MACHINES" })).toBeVisible();
  await expect(drawer.getByRole("link", { name: /Shear/i }).first()).toBeVisible();
});
