import { expect, test } from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";

import { importLegacyCatalogue } from "../../lib/migration/catalogue-importer";
import { readLegacyCatalogue } from "../../lib/migration/legacy-product-reader";

const longTitleSlug = "cms-long-title-layout-test";
const longTitle = "Precision Sheet Metal Production System for International Buyers Requiring Configurable Cutting Capacity";
const inquiryEmail = "public-acceptance-inquiry@zyron.test";

test.beforeAll(async () => {
  const connectionString = process.env.DATABASE_URL ?? "";
  if (!connectionString || connectionString !== process.env.TEST_DATABASE_URL || !new URL(connectionString).pathname.endsWith("_test")) {
    throw new Error("Public visual tests require the isolated _test database.");
  }
  const database = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  const supportPages = await database.sitePage.findMany({ where: { slug: "support" }, select: { id: true } });
  await database.pageVersion.deleteMany({ where: { pageId: { in: supportPages.map(({ id }) => id) } } });
  await database.sitePage.deleteMany({ where: { id: { in: supportPages.map(({ id }) => id) } } });
  await database.mediaReference.deleteMany({ where: { entityType: { in: ["Product", "ProductSection"] } } });
  await database.product.deleteMany();
  await database.productCategory.deleteMany();
  await database.auditLog.deleteMany({ where: { action: "inquiry.attempt" } });
  const catalogue = await readLegacyCatalogue({ includePageContent: true });
  await importLegacyCatalogue({ database, catalogue, write: true });
  const category = await database.productCategory.findUniqueOrThrow({ where: { slug: "shearing-machines" } });
  await database.product.create({
    data: {
      categoryId: category.id,
      slug: longTitleSlug,
      name: longTitle,
      summary: "Responsive title acceptance fixture.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      sections: { create: {
        type: "HERO",
        position: 0,
        content: {
          eyebrow: "Responsive Layout Test",
          title: longTitle,
          subtitle: "A long verified title must wrap without expanding the page beyond the mobile viewport.",
          images: { desktop: "/products/product-center-hero.png", alt: "Sheet metal machinery" },
          primaryCta: { label: "Request a Quote", href: "/contact" },
        } as Prisma.InputJsonValue,
      } },
    },
  });
  await database.sitePage.create({
    data: {
      name: "Empty Support Fixture",
      slug: "support",
      pageType: "CUSTOM",
      status: "PUBLISHED",
      draftContent: { schemaVersion: 1, nodes: [] },
      publishedContent: { schemaVersion: 1, nodes: [] },
      publishedVersion: 1,
      publishedAt: new Date(),
    },
  });
  await database.$disconnect();
});

test.afterAll(async () => {
  const connectionString = process.env.DATABASE_URL ?? "";
  const database = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  await database.leadNotificationAttempt.deleteMany({ where: { lead: { email: inquiryEmail } } });
  await database.leadStageHistory.deleteMany({ where: { lead: { email: inquiryEmail } } });
  await database.leadActivity.deleteMany({ where: { lead: { email: inquiryEmail } } });
  await database.leadAssignment.deleteMany({ where: { lead: { email: inquiryEmail } } });
  await database.lead.deleteMany({ where: { email: inquiryEmail } });
  await database.sitePage.deleteMany({ where: { slug: "support" } });
  await database.product.deleteMany({ where: { slug: longTitleSlug } });
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

test("empty managed support content falls back to the complete support template", async ({ page }) => {
  await page.goto("/support", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1, name: "Support for Every Production Stage" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Support and Resources" })).toBeVisible();
});

test("long product titles wrap without mobile overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/products/${longTitleSlug}`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1, name: longTitle })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test("contact inquiry stores a real test-database lead and reports success", async ({ page }) => {
  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Name", { exact: true }).fill("Public Acceptance Buyer");
  await page.getByLabel("Email", { exact: true }).fill(inquiryEmail);
  await page.getByLabel("Destination Country").fill("Germany");
  await page.getByLabel("Production Requirement").fill("Acceptance-only request for a 2 mm sheet cutting workflow.");
  await page.getByRole("button", { name: "Send Inquiry" }).click();
  await expect(page.getByText("Thank you. Your inquiry has been received. Our team will reply soon.")).toBeVisible();

  const connectionString = process.env.DATABASE_URL ?? "";
  const database = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  await expect(database.lead.count({ where: { email: inquiryEmail } })).resolves.toBe(1);
  await database.$disconnect();
});

test("core public pages expose stable canonical URLs", async ({ page }) => {
  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", /\/contact$/);
  await page.goto("/products/compact-electric-shearing-machine", { waitUntil: "domcontentloaded" });
  await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", /\/products\/compact-electric-shearing-machine$/);
});

test("homepage update section uses a real destination instead of a fake subscription form", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("main").getByRole("link", { name: "Read Company News" })).toHaveAttribute("href", "/news");
  await expect(page.getByPlaceholder("Email address")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Subscribe" })).toHaveCount(0);
});
