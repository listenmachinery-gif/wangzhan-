import { expect, test } from "@playwright/test";

const viewports = [
  { name: "desktop-1440", width: 1440, height: 1100 },
  { name: "laptop-1024", width: 1024, height: 1000 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "mobile-390", width: 390, height: 844 },
] as const;

test("matches the interactive product explorer structure and preserves real links", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/products", { waitUntil: "domcontentloaded" });

  const explorer = page.locator("[data-product-explorer]");
  await expect(explorer).toBeVisible();
  await expect(page.getByRole("heading", {
    level: 1,
    name: "Sheet Metal Fabrication & Industrial Machinery.",
  })).toBeVisible();

  const tabs = page.getByRole("tablist", { name: "Machine categories" }).getByRole("tab");
  await expect(tabs).toHaveCount(8);
  await expect(page.getByRole("tab", { name: "02 Bending" })).toHaveAttribute("aria-selected", "true");

  await page.getByRole("tab", { name: "01 Shearing" }).click();
  await expect(page.getByRole("tab", { name: "01 Shearing" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("link", { name: /View Series/ }).first()).toHaveAttribute(
    "href",
    "/products/series/shearing-machines",
  );

  expect(await page.locator("script[data-products-breadcrumb-schema]").textContent()).toContain("BreadcrumbList");
  expect(await page.locator("script[data-products-item-list-schema]").textContent()).toContain("ItemList");
});

for (const viewport of viewports) {
  test(`renders the reference layout without explorer overflow at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/products", { waitUntil: "domcontentloaded" });
    const explorer = page.locator("[data-product-explorer]");
    await expect(explorer).toBeVisible();
    await expect(explorer.locator("img").first()).toBeVisible();
    expect(await explorer.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
    await page.screenshot({
      path: `.playwright/screenshots/products-explorer-${viewport.name}.png`,
      fullPage: true,
    });
  });
}
