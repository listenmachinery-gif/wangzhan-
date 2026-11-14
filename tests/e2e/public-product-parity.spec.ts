import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";

import { importLegacyCatalogue } from "../../lib/migration/catalogue-importer";
import { readLegacyCatalogue } from "../../lib/migration/legacy-product-reader";

let connectionString: string;

test.beforeAll(async () => {
  connectionString = process.env.DATABASE_URL ?? "";
  if (!connectionString) throw new Error("DATABASE_URL is required for E2E tests.");
  const database = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  await database.mediaReference.deleteMany({ where: { entityType: "Product" } });
  await database.product.deleteMany();
  await database.productCategory.deleteMany();
  const catalogue = await readLegacyCatalogue({ includePageContent: true });
  await importLegacyCatalogue({ database, catalogue, write: true });
  const category = await database.productCategory.findUniqueOrThrow({ where: { slug: "shearing-machines" } });
  await database.product.create({
    data: {
      categoryId: category.id,
      slug: "cms-only-test-machine",
      name: "CMS Only Test Machine",
      summary: "Created entirely in the CMS.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      sections: {
        create: {
          type: "HERO",
          position: 0,
          content: {
            eyebrow: "CMS Product",
            title: "CMS Only Test Machine",
            subtitle: "Created entirely in the CMS.",
            images: { desktop: "/products/product-center-hero.png", alt: "CMS only test machine" },
            primaryCta: { label: "Request a Quote", href: "/contact" },
          } as Prisma.InputJsonValue,
        },
      },
    },
  });
  await database.$disconnect();
});

test("renders database-published products at unchanged URLs with the shared layout", async ({ page }) => {
  await page.goto("/products/compact-electric-shearing-machine");
  await expect(page).toHaveURL(/\/products\/compact-electric-shearing-machine$/);
  await expect(page.locator("main[data-standard-product='compact-electric-shearing-machine']")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Small Electric Shearing Machine" })).toBeVisible();
  await expect(page.locator("[data-product-module]")).toHaveCount(10);
  expect(await page.locator("script[data-faq-schema]").textContent()).toContain("FAQPage");
  await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", /\/products\/compact-electric-shearing-machine$/);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("[data-technical-table-scroll]").first()).toHaveCSS("overflow-x", "auto");
});

test("makes a CMS-only product discoverable with metadata and media", async ({ page }) => {
  await page.goto("/products/cms-only-test-machine");
  await expect(page.getByRole("heading", { level: 1, name: "CMS Only Test Machine" })).toBeVisible();
  await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", /\/products\/cms-only-test-machine$/);
  await expect(page.locator("meta[property='og:image']")).toHaveAttribute("content", /\/products\/product-center-hero\.png$/);

  await page.goto("/products/series/shearing-machines");
  await expect(page.getByRole("link", { name: "CMS Only Test Machine" })).toBeVisible();
});

test("keeps representative family slugs and source names unchanged", async ({ page }) => {
  const representatives = [
    ["nc-hydraulic-press-brake", "NC Hydraulic Press Brake"],
    ["exchange-table-fiber-laser-cutting-machine", "Exchange-Table Fiber Laser Cutting Machine"],
    ["hydraulic-four-roll-plate-rolling-machine", "Hydraulic Four-Roll Plate Rolling Machine"],
    ["mechanical-punch-press", "Mechanical Punch Press"],
    ["u-shaped-auto-duct-production-line-5", "U-Shaped Auto Duct Production Line 5"],
    ["dual-shaft-shredder", "Dual Shaft Shredder"],
  ] as const;
  for (const [slug, name] of representatives) {
    await page.goto(`/products/${slug}`);
    await expect(page).toHaveURL(new RegExp(`/products/${slug}$`));
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  }
});

test("published listings come from the database and drafts return 404", async ({ page }) => {
  await page.goto("/products");
  await expect(page.getByText("54", { exact: true }).first()).toBeVisible();
  await page.goto("/products/series/shearing-machines");
  await expect(page.getByRole("link", { name: "View Details" })).toHaveCount(7);

  const database = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  await database.product.update({ where: { slug: "foot-shear" }, data: { status: "DRAFT", publishedAt: null } });
  await database.$disconnect();
  const response = await page.goto("/products/foot-shear");
  expect(response?.status()).toBe(404);
  const sitemap = await page.request.get("/sitemap.xml");
  const sitemapXml = await sitemap.text();
  expect(sitemapXml).not.toContain("/products/foot-shear");
  expect(sitemapXml).toContain("/products/cms-only-test-machine");
  const restoreDatabase = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  await restoreDatabase.product.update({
    where: { slug: "foot-shear" },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
  await restoreDatabase.product.delete({ where: { slug: "cms-only-test-machine" } });
  await restoreDatabase.$disconnect();
});
