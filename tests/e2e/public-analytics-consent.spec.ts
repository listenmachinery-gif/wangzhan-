import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";

const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "G-ZYRONTEST";
const productSlug = "analytics-e2e-product";
const categorySlug = "analytics-e2e-category";

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required for E2E tests.");
  if (!new URL(connectionString).pathname.replace(/^\//, "").endsWith("_test")) {
    throw new Error("Public analytics E2E setup is restricted to a database whose name ends with _test.");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

test.beforeAll(async () => {
  const db = database();
  await db.product.deleteMany({ where: { slug: productSlug } });
  await db.productCategory.deleteMany({ where: { slug: categorySlug } });
  const category = await db.productCategory.create({
    data: { name: "Analytics E2E Category", slug: categorySlug, status: "PUBLISHED", publishedAt: new Date() },
  });
  await db.product.create({
    data: {
      categoryId: category.id,
      name: "Analytics E2E Machine",
      slug: productSlug,
      summary: "Published product used only for analytics browser acceptance.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      sections: {
        create: {
          type: "HERO",
          position: 0,
          content: {
            eyebrow: "E2E",
            title: "Analytics E2E Machine",
            subtitle: "Published product used only for analytics browser acceptance.",
            images: { desktop: "/products/product-center-hero.png", alt: "Analytics E2E machine" },
            primaryCta: { label: "Request a Quote", href: "/contact" },
          } as Prisma.InputJsonValue,
        },
      },
    },
  });
  await db.$disconnect();
});

test.afterAll(async () => {
  const db = database();
  await db.product.deleteMany({ where: { slug: productSlug } });
  await db.productCategory.deleteMany({ where: { slug: categorySlug } });
  await db.$disconnect();
});

test("reject keeps Google absent and accept loads the test tag only on the public site", async ({ page }) => {
  const googleRequests: string[] = [];
  const firstPartyRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/analytics/collect") firstPartyRequests.push(request.url());
  });
  await page.route("https://www.googletagmanager.com/**", async (route) => {
    googleRequests.push(route.request().url());
    await route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
  });

  await page.goto("/");
  await expect(page.getByRole("dialog", { name: "Analytics cookie preferences" })).toBeVisible();
  expect(googleRequests).toEqual([]);

  await page.getByRole("button", { name: "Reject analytics" }).click();
  await page.goto("/products");
  await expect(page.getByRole("heading", { name: "Machine Solutions for Modern Fabrication" })).toBeVisible();
  await page.goto(`/products/${productSlug}`);
  await expect(page.getByRole("heading", { level: 1, name: "Analytics E2E Machine" })).toBeVisible();
  expect(googleRequests).toEqual([]);
  expect(firstPartyRequests).toEqual([]);

  await page.getByRole("button", { name: "Cookie preferences" }).click();
  const firstCollection = page.waitForResponse((response) => (
    new URL(response.url()).pathname === "/api/analytics/collect" && response.status() === 202
  ));
  await page.getByRole("button", { name: "Accept analytics" }).click();
  await firstCollection;
  await expect.poll(() => googleRequests.some((url) => url.includes(`id=${measurementId}`))).toBe(true);
  expect(firstPartyRequests.length).toBeGreaterThan(0);
  await expect(page.getByRole("status")).toContainText("Analytics cookies accepted");

  await page.goto("/contact");
  await expect(page.getByRole("heading", { name: /Get a machine recommendation from our engineers/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Send Inquiry/ })).toBeVisible();
});

test("the public consent and core pages remain usable on a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("dialog", { name: "Analytics cookie preferences" })).toBeVisible();
  await page.getByRole("button", { name: "Reject analytics" }).click();
  await page.goto("/products");
  await expect(page.getByRole("heading", { name: "Machine Solutions for Modern Fabrication" })).toBeVisible();
  await page.goto("/contact");
  await expect(page.getByRole("button", { name: /Send Inquiry/ })).toBeVisible();
});

test("two tabs share one anonymous visitor and session without losing separate page views", async ({ page, context }) => {
  const db = database();
  const before = {
    visitors: await db.analyticsVisitor.count(),
    sessions: await db.analyticsSession.count(),
    pageViews: await db.analyticsPageView.count(),
  };

  await page.goto("/");
  const firstCollection = page.waitForResponse((response) => (
    new URL(response.url()).pathname === "/api/analytics/collect" && response.status() === 202
  ));
  await page.getByRole("button", { name: "Accept analytics" }).click();
  await firstCollection;

  const secondPage = await context.newPage();
  const secondCollection = secondPage.waitForResponse((response) => (
    new URL(response.url()).pathname === "/api/analytics/collect" && response.status() === 202
  ));
  await secondPage.goto("/products");
  await secondCollection;

  await expect.poll(async () => ({
    visitors: await db.analyticsVisitor.count(),
    sessions: await db.analyticsSession.count(),
    pageViews: await db.analyticsPageView.count(),
  })).toMatchObject({
    visitors: before.visitors + 1,
    sessions: before.sessions + 1,
    pageViews: before.pageViews + 2,
  });

  await secondPage.close();
  await db.$disconnect();
});
