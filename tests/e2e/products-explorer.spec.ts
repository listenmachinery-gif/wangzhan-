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

  const background = page.locator("[data-explorer-background] img");
  const initialBackgroundSource = await background.getAttribute("src");
  await expect(background).toBeVisible();
  expect(await page.locator("[data-explorer-machine]").evaluate((element) => getComputedStyle(element.parentElement!).overflow)).toBe("visible");
  const copyBox = await page.locator("[data-explorer-copy]").boundingBox();
  const machineBox = await page.locator("[data-explorer-machine]").boundingBox();
  const seriesBox = await page.locator("[data-explorer-series]").boundingBox();
  expect(copyBox && machineBox && seriesBox).toBeTruthy();
  expect(machineBox!.x).toBeGreaterThanOrEqual(copyBox!.x + copyBox!.width - 1);
  expect(machineBox!.x + machineBox!.width).toBeLessThanOrEqual(seriesBox!.x + 1);
  await expect(page.locator("[data-explorer-machine] img")).toHaveAttribute("alt", "ZYRON press brake series");
  expect(await page.locator("[data-explorer-machine] img").evaluate((element) => getComputedStyle(element).objectFit)).toBe("contain");
  expect(await page.locator("[data-explorer-machine]").evaluate((element) => getComputedStyle(element).zIndex)).toBe("3");
  expect(await page.locator("[data-explorer-number]").evaluate((element) => getComputedStyle(element).zIndex)).toBe("1");

  await page.getByRole("tab", { name: "01 Shearing" }).click();
  await expect(page.getByRole("tab", { name: "01 Shearing" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("[data-explorer-machine] img")).toHaveAttribute("alt", "ZYRON shearing machine series");
  expect(await background.getAttribute("src")).toBe(initialBackgroundSource);
  await expect(page.getByRole("link", { name: /View Series/ }).first()).toHaveAttribute(
    "href",
    "/products/series/shearing-machines",
  );

  for (const tabName of [
    "01 Shearing",
    "02 Bending",
    "03 Laser Cutting",
    "04 Rolling",
    "05 Pressing",
    "06 Rectangular Duct",
    "07 Round Duct",
    "08 Shredding",
  ]) {
    await page.getByRole("tab", { name: tabName }).click();
    const currentCopyBox = await page.locator("[data-explorer-copy]").boundingBox();
    const currentMachineBox = await page.locator("[data-explorer-machine]").boundingBox();
    const currentSeriesBox = await page.locator("[data-explorer-series]").boundingBox();
    expect(currentCopyBox && currentMachineBox && currentSeriesBox).toBeTruthy();
    expect(currentMachineBox!.x).toBeGreaterThanOrEqual(currentCopyBox!.x + currentCopyBox!.width - 1);
    expect(
      currentMachineBox!.x + currentMachineBox!.width <= currentSeriesBox!.x + 1
      || currentMachineBox!.y + currentMachineBox!.height <= currentSeriesBox!.y + 1,
    ).toBe(true);
    expect(await background.getAttribute("src")).toBe(initialBackgroundSource);
  }

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
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.screenshot({
      path: `.playwright/screenshots/products-explorer-${viewport.name}.png`,
      fullPage: true,
    });
  });
}
