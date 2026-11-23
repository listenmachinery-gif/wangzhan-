import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { expect, test } from "@playwright/test";

import { homepageRedesignDocument } from "../../lib/page-builder/default-homepage";

const adminEmail = "homepage-editor-e2e@zyron.test";
const adminPassword = "homepage-editor-e2e-secure-password";
const inquiryEmail = "homepage-inquiry-e2e@zyron.test";
const mediaName = "homepage-media-picker-e2e.webp";

function database() {
  const connectionString = process.env.DATABASE_URL ?? "";
  if (!connectionString || connectionString !== process.env.TEST_DATABASE_URL || !new URL(connectionString).pathname.endsWith("_test")) {
    throw new Error("Homepage redesign E2E requires the isolated _test database.");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

test.beforeAll(async () => {
  const db = database();
  const role = await db.role.upsert({
    where: { key: "CONTENT_EDITOR" },
    update: {},
    create: { key: "CONTENT_EDITOR", name: "Content Editor" },
  });
  const user = await db.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: await hash(adminPassword), isActive: true },
    create: { email: adminEmail, name: "Homepage E2E Editor", passwordHash: await hash(adminPassword) },
  });
  await db.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    update: {},
    create: { userId: user.id, roleId: role.id },
  });

  const previousPages = await db.sitePage.findMany({ where: { slug: "home" }, select: { id: true } });
  if (previousPages.length) {
    await db.auditLog.deleteMany({ where: { entityType: "SitePage", entityId: { in: previousPages.map(({ id }) => id) } } });
    await db.sitePage.deleteMany({ where: { id: { in: previousPages.map(({ id }) => id) } } });
  }
  const page = await db.sitePage.create({
    data: {
      name: "ZYRON 首页",
      slug: "home",
      pageType: "HOME",
      draftContent: homepageRedesignDocument as unknown as Prisma.InputJsonValue,
      publishedContent: homepageRedesignDocument as unknown as Prisma.InputJsonValue,
      status: "PUBLISHED",
      publishedVersion: 1,
      publishedAt: new Date(),
    },
  });
  await db.pageVersion.create({
    data: {
      pageId: page.id,
      version: 1,
      snapshot: homepageRedesignDocument as unknown as Prisma.InputJsonValue,
      action: "PUBLISH",
      createdById: user.id,
      publishedAt: new Date(),
    },
  });
  await db.mediaAsset.create({
    data: {
      objectKey: "e2e/homepage-media-picker.webp",
      originalName: mediaName,
      mimeType: "image/webp",
      byteSize: 128,
      checksum: "homepage-media-picker-e2e-checksum",
      usage: "EDITORIAL_IMAGE",
      altText: "Homepage media picker E2E image",
      category: "E2E Homepage",
      uploadedById: user.id,
    },
  });
  await db.$disconnect();
});

test.afterAll(async () => {
  const db = database();
  await db.leadNotificationAttempt.deleteMany({ where: { lead: { email: inquiryEmail } } });
  await db.leadStageHistory.deleteMany({ where: { lead: { email: inquiryEmail } } });
  await db.leadActivity.deleteMany({ where: { lead: { email: inquiryEmail } } });
  await db.leadAssignment.deleteMany({ where: { lead: { email: inquiryEmail } } });
  await db.lead.deleteMany({ where: { email: inquiryEmail } });
  const pages = await db.sitePage.findMany({ where: { slug: "home" }, select: { id: true } });
  await db.auditLog.deleteMany({ where: { entityType: "SitePage", entityId: { in: pages.map(({ id }) => id) } } });
  await db.sitePage.deleteMany({ where: { id: { in: pages.map(({ id }) => id) } } });
  const assets = await db.mediaAsset.findMany({ where: { originalName: mediaName }, select: { id: true } });
  await db.mediaReference.deleteMany({ where: { mediaAssetId: { in: assets.map(({ id }) => id) } } });
  await db.mediaAsset.deleteMany({ where: { id: { in: assets.map(({ id }) => id) } } });
  await db.$disconnect();
});

const viewports = [
  ["desktop-1920", 1920, 1080],
  ["desktop-1440", 1440, 1000],
  ["tablet-1024", 1024, 900],
  ["tablet-768", 768, 900],
  ["mobile-375", 375, 812],
] as const;

for (const [name, width, height] of viewports) {
  test(`${name} renders all homepage modules without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.context().addCookies([{ name: "zyron_analytics_consent", value: "rejected", domain: "127.0.0.1", path: "/" }]);
    const response = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(response?.ok()).toBe(true);
    const rejectAnalytics = page.getByRole("button", { name: "Reject analytics" });
    if (await rejectAnalytics.isVisible()) await rejectAnalytics.click();
    await expect(page.getByRole("heading", { level: 1, name: "Precision in Every Bend." })).toBeVisible();
    await expect(page.locator("[data-page-component]")).toHaveCount(6);
    expect(await page.locator("[data-page-component]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-page-component")))).toEqual([
      "HOME_HERO",
      "HOME_ABOUT",
      "HOME_PRODUCT_SHOWCASE",
      "HOME_WHY_CHOOSE",
      "HOME_NEWS_INSIGHTS",
      "HOME_CONTACT_CTA",
    ]);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(300, window.innerHeight * 0.7)) {
        window.scrollTo(0, y);
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
    await page.waitForFunction(() => Array.from(document.querySelectorAll("main img")).every((image) => image.complete && image.naturalWidth > 0));
    await expect(page.getByText("3,500", { exact: true })).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `.playwright/screenshots/homepage-redesign/${name}.png`, fullPage: true });
  });
}

test("product selection changes copy, image and destination together", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("tab", { name: "LASER CUTTING MACHINES" }).click();
  await expect(page.getByRole("heading", { level: 3, name: "Complex Geometry. Clean Results." })).toBeVisible();
  await expect(page.getByAltText("ZYRON laser cutting machine")).toHaveAttribute("src", /laser-cutting-machine\.webp/);
  await expect(page.getByRole("link", { name: "Explore Laser Cutting Machines" })).toHaveAttribute("href", "/products/series/laser-cutting-machines");
});

test("homepage quote form stores one real CRM inquiry", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Request a Quote" }).click();
  await expect(page.getByLabel("Your Name *")).toBeFocused();
  await page.getByLabel("Your Name *").fill("Homepage E2E Buyer");
  await page.getByLabel("Business Email *").fill(inquiryEmail);
  await page.getByLabel("Machine Interest *").selectOption("PRESS BRAKES");
  await page.getByLabel("Your Requirements *").fill("E2E-only request for 2 mm stainless sheet and a 3200 mm working length.");
  await page.getByRole("button", { name: "Send Inquiry →" }).click();
  await expect(page.getByText("Thank you. Your inquiry has been received. Our team will reply soon.")).toBeVisible();

  const db = database();
  await expect(db.lead.count({ where: { email: inquiryEmail } })).resolves.toBe(1);
  await db.$disconnect();
});

test("homepage manager supports media selection, draft publication and rollback", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("管理员邮箱").fill(adminEmail);
  await page.getByLabel("密码").fill(adminPassword);
  await page.getByRole("button", { name: "登录 ZYRON CMS" }).click();
  await page.getByRole("link", { name: "首页管理" }).click();
  await expect(page.getByRole("heading", { name: "ZYRON 首页" })).toBeVisible();
  await expect(page.getByRole("link", { name: "编辑 Footer" })).toHaveAttribute("href", "/admin/navigation");

  await page.getByRole("button", { name: "从媒体资源库替换" }).click();
  await page.getByLabel("搜索媒体").fill(mediaName);
  await page.getByRole("button", { name: "搜索" }).click();
  await page.getByRole("dialog", { name: "选择媒体库图片" }).getByRole("button", { name: new RegExp(mediaName) }).click();
  await expect(page.getByRole("textbox", { name: "设备图片（媒体库可替换）" })).toHaveValue(/\/api\/media\//);
  await page.getByRole("button", { name: "撤销" }).click();
  await expect(page.getByRole("textbox", { name: "设备图片（媒体库可替换）" })).toHaveValue("/images/products/press-brake.webp");

  await page.getByRole("textbox", { name: "主标题", exact: true }).fill("E2E Published Homepage Title");
  await page.getByRole("button", { name: "发布", exact: true }).click();
  await expect(page.getByText("已发布到前台")).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "E2E Published Homepage Title" })).toBeVisible();

  await page.goto("/admin/homepage");
  await page.getByRole("button", { name: "历史" }).click();
  const originalVersion = page.getByRole("article").filter({ hasText: "v1" });
  await originalVersion.getByRole("button", { name: "恢复为草稿" }).click();
  await expect(page.getByText("已恢复 v1 为新草稿")).toBeVisible();
  await page.getByRole("button", { name: "发布", exact: true }).click();
  await expect(page.getByText("已发布到前台")).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Precision in Every Bend." })).toBeVisible();
});
