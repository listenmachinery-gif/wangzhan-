import { expect, test } from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { importLegacyCatalogue } from "../../lib/migration/catalogue-importer";
import { readLegacyCatalogue } from "../../lib/migration/legacy-product-reader";

test.beforeAll(async () => {
  const connectionString = process.env.DATABASE_URL ?? "";
  if (!connectionString || connectionString !== process.env.TEST_DATABASE_URL || !new URL(connectionString).pathname.endsWith("_test")) {
    throw new Error("Public visual tests require the isolated _test database.");
  }
  const database = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  if (await database.productCategory.count() === 0) {
    const catalogue = await readLegacyCatalogue({ includePageContent: true });
    await importLegacyCatalogue({ database, catalogue, write: true });
  }
  await database.$disconnect();
});

const pages = [
  ["home", "/"],
  ["company", "/factory"],
  ["products", "/products"],
  ["series", "/products/series/shearing-machines"],
  ["detail", "/products/compact-electric-shearing-machine"],
  ["support", "/support"],
  ["showcase", "/showcase"],
  ["contact", "/contact"],
] as const;

const viewports = [
  ["desktop-1440", 1440, 1000],
  ["desktop-1024", 1024, 900],
  ["tablet-768", 768, 900],
  ["mobile-390", 390, 844],
] as const;

for (const [viewportName, width, height] of viewports) {
  test.describe(viewportName, () => {
    test.use({ viewport: { width, height } });

    for (const [name, path] of pages) {
      test(`${name} renders without horizontal overflow`, async ({ page }) => {
        const response = await page.goto(path, { waitUntil: "domcontentloaded" });
        expect(response?.ok(), `${path} should return a successful response`).toBe(true);
        await expect(page.locator("main")).toBeVisible();
        await expect.poll(() => page.evaluate(() => ({
          viewport: window.innerWidth,
          document: document.documentElement.scrollWidth,
        }))).toMatchObject({ viewport: width, document: width });
        await page.screenshot({
          path: `.playwright/screenshots/harsle-cms/${viewportName}-${name}.png`,
          fullPage: true,
        });
      });
    }
  });
}

test("mobile navigation supports open, close and focus restoration", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const trigger = page.getByRole("button", { name: "Open navigation" });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Site navigation" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Close navigation", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Site navigation" })).toBeHidden();
  await expect(trigger).toBeFocused();
});
