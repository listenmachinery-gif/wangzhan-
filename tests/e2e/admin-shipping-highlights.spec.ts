import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { expect, test } from "@playwright/test";
import sharp from "sharp";

import { getStorageAdapter } from "../../lib/storage";

const email = "phase1-shipping-editor@zyron.test";
const password = "phase1-shipping-password";
const categorySlug = "phase1-shipping-category";
const productSlug = "phase1-shipping-machine";
const shippingSlug = "phase1-germany-shipment";
const mediaName = "phase1-shipping-cover.png";

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || !new URL(connectionString).pathname.replace(/^\//, "").endsWith("_test")) throw new Error("Phase 1 shipping E2E requires a protected _test database.");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

test.beforeAll(async () => {
  const db = database();
  await db.shippingHighlight.deleteMany({ where: { slug: shippingSlug } });
  await db.product.deleteMany({ where: { slug: productSlug } });
  await db.productCategory.deleteMany({ where: { slug: categorySlug } });
  const role = await db.role.upsert({ where: { key: "CONTENT_EDITOR" }, update: {}, create: { key: "CONTENT_EDITOR", name: "Content Editor" } });
  const user = await db.user.upsert({ where: { email }, update: { passwordHash: await hash(password), isActive: true }, create: { email, name: "Phase 1 Shipping Editor", passwordHash: await hash(password) } });
  await db.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: role.id } }, update: {}, create: { userId: user.id, roleId: role.id } });
  const category = await db.productCategory.create({ data: { name: "Phase 1 Shearing Machines", slug: categorySlug, status: "PUBLISHED", publishedAt: new Date() } });
  await db.product.create({ data: { categoryId: category.id, name: "Phase 1 Electric Shear", slug: productSlug, summary: "E2E shipping product", status: "PUBLISHED", publishedAt: new Date() } });
  await db.$disconnect();
});

test.afterAll(async () => {
  const db = database();
  const shipping = await db.shippingHighlight.findUnique({ where: { slug: shippingSlug }, select: { id: true } });
  if (shipping) {
    await db.mediaReference.deleteMany({ where: { entityId: shipping.id, entityType: { in: ["ShippingHighlightDraft", "ShippingHighlightPublished"] } } });
    await db.auditLog.deleteMany({ where: { entityType: "ShippingHighlight", entityId: shipping.id } });
    await db.shippingHighlight.delete({ where: { id: shipping.id } });
  }
  await db.product.deleteMany({ where: { slug: productSlug } });
  await db.productCategory.deleteMany({ where: { slug: categorySlug } });
  const assets = await db.mediaAsset.findMany({ where: { originalName: mediaName }, select: { id: true, objectKey: true } });
  for (const asset of assets) {
    await db.mediaReference.deleteMany({ where: { mediaAssetId: asset.id } });
    await db.auditLog.deleteMany({ where: { entityType: "MediaAsset", entityId: asset.id } });
    await db.mediaAsset.delete({ where: { id: asset.id } });
    await getStorageAdapter().delete(asset.objectKey).catch(() => undefined);
  }
  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (user) {
    await db.auditLog.updateMany({ where: { actorId: user.id }, data: { actorId: null } });
    await db.session.deleteMany({ where: { userId: user.id } });
    await db.userRole.deleteMany({ where: { userId: user.id } });
    await db.user.delete({ where: { id: user.id } });
  }
  await db.$disconnect();
});

test("creates, publishes, previews, and updates a shipping highlight without leaking draft edits", async ({ page, browser }) => {
  test.setTimeout(120_000);
  await page.goto("/admin/login");
  await page.getByLabel("管理员邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录 ZYRON CMS" }).click();

  await page.getByRole("link", { name: "媒体资源" }).click();
  const image = await sharp({ create: { width: 16, height: 10, channels: 4, background: { r: 118, g: 185, b: 0, alpha: 1 } } }).png().toBuffer();
  await page.getByLabel("选择媒体文件").setInputFiles({ name: mediaName, mimeType: "image/png", buffer: image });
  await page.getByLabel("替代文本", { exact: true }).fill("德国客户电动剪板机发货封面");
  await page.getByRole("button", { name: "上传文件" }).click();
  await expect(page.getByRole("status")).toHaveText("上传成功");

  await page.getByRole("link", { name: "发货集锦" }).click();
  await page.getByRole("link", { name: "新建发货记录" }).click();
  await page.getByRole("textbox", { name: "标题", exact: true }).fill("德国电动剪板机发货");
  await page.getByRole("textbox", { name: "页面 Slug" }).fill(shippingSlug);
  await page.getByLabel("发货日期").fill("2026-11-16");
  await page.getByRole("combobox", { name: "国家或地区" }).selectOption("DE");
  await page.getByRole("textbox", { name: "城市" }).fill("Hamburg");
  await page.getByRole("textbox", { name: "摘要" }).fill("完成检验、出口包装和集装箱装柜。");
  await page.getByRole("combobox", { name: "产品分类" }).selectOption({ label: "Phase 1 Shearing Machines" });
  await page.getByRole("combobox", { name: "关联产品" }).selectOption({ label: "Phase 1 Electric Shear" });
  await page.getByRole("textbox", { name: "设备名称" }).fill("Electric Shearing Machine");
  await page.getByRole("textbox", { name: "型号" }).fill("Q11-3x1300");
  await page.getByRole("spinbutton", { name: "数量" }).fill("3");
  await page.getByRole("textbox", { name: "装柜方式" }).fill("20GP");
  await page.getByRole("textbox", { name: "运输方式" }).fill("Sea freight");
  await page.getByRole("textbox", { name: "包装方式" }).fill("Export wooden case");
  await page.getByRole("button", { name: "添加媒体" }).click();
  await page.getByRole("textbox", { name: "媒体 1 替代文本" }).fill("德国客户电动剪板机发货封面");
  await page.getByRole("button", { name: "添加段落" }).click();
  await page.getByRole("textbox", { name: "正文段落 1" }).fill("设备完成出厂检验并安全装柜。");
  await page.getByRole("textbox", { name: "SEO 标题" }).fill("Electric Shearing Machines Shipped to Germany | ZYRON");
  await page.getByRole("textbox", { name: "SEO 描述" }).fill("See how ZYRON inspected, packed, and loaded three electric shearing machines for sea delivery to a sheet-metal customer in Hamburg, Germany.");
  await page.getByRole("button", { name: "保存草稿" }).click();
  await expect(page).toHaveURL(/\/admin\/shipping-highlights\/.+/);
  await expect(page.getByRole("status")).toContainText("草稿已创建");

  const publicContext = await browser.newContext();
  const publicPage = await publicContext.newPage();
  expect((await publicPage.goto(`/shipping-highlights/${shippingSlug}`))?.status()).toBe(404);

  await page.getByRole("button", { name: "发布到前台" }).click();
  await expect(page.getByRole("status")).toContainText("已发布到前台");
  await publicPage.goto("/shipping-highlights");
  await expect(publicPage.getByRole("heading", { name: "德国电动剪板机发货" })).toBeVisible();
  await publicPage.getByRole("link", { name: /德国电动剪板机发货/ }).click();
  await expect(publicPage.getByRole("heading", { level: 1, name: "德国电动剪板机发货" })).toBeVisible();
  await expect(publicPage.getByRole("img", { name: "德国客户电动剪板机发货封面" }).first()).toHaveJSProperty("naturalWidth", 16);
  expect((await publicPage.locator('script[type="application/ld+json"]').count())).toBeGreaterThanOrEqual(3);

  await page.getByRole("textbox", { name: "标题", exact: true }).fill("德国电动剪板机发货（草稿更新）");
  await page.getByRole("button", { name: "保存草稿" }).click();
  await expect(page.getByRole("status")).toContainText("草稿已保存");
  await publicPage.reload();
  await expect(publicPage.getByRole("heading", { level: 1, name: "德国电动剪板机发货" })).toBeVisible();
  await expect(publicPage.getByText("草稿更新")).toHaveCount(0);

  await page.getByRole("button", { name: "发布到前台" }).click();
  await expect(page.getByRole("status")).toContainText("已发布到前台");
  await publicPage.reload();
  await expect(publicPage.getByRole("heading", { level: 1, name: "德国电动剪板机发货（草稿更新）" })).toBeVisible();
  await publicPage.goto("/");
  await expect(publicPage.getByRole("heading", { name: "Latest shipping highlights." })).toBeVisible();
  await expect(publicPage.getByRole("heading", { name: "德国电动剪板机发货（草稿更新）" })).toBeVisible();
  await publicContext.close();
});
