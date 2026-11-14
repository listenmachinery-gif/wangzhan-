import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { expect, test } from "@playwright/test";

const email = "media-admin-e2e@example.com";
const password = "e2e-media-secure-password";

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required for E2E tests.");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

test.beforeAll(async () => {
  const db = database();
  const role = await db.role.upsert({
    where: { key: "SUPER_ADMIN" },
    update: {},
    create: { key: "SUPER_ADMIN", name: "Super Admin" },
  });
  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash: await hash(password), isActive: true },
    create: { email, name: "Media E2E Admin", passwordHash: await hash(password) },
  });
  await db.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    update: {},
    create: { userId: user.id, roleId: role.id },
  });
  const previous = await db.mediaAsset.findMany({ where: { uploadedById: user.id }, select: { id: true } });
  const ids = previous.map((asset) => asset.id);
  if (ids.length) {
    await db.mediaReference.deleteMany({ where: { mediaAssetId: { in: ids } } });
    await db.auditLog.deleteMany({ where: { entityType: "MediaAsset", entityId: { in: ids } } });
    await db.mediaAsset.deleteMany({ where: { id: { in: ids } } });
  }
  await db.$disconnect();
});

test("uploads, searches, previews, edits alt text, and prevents referenced deletion", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("管理员邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录 ZYRON CMS" }).click();
  await page.getByRole("link", { name: "媒体资源" }).click();
  await expect(page.getByRole("heading", { name: "媒体资源" })).toBeVisible();

  await page.getByLabel("选择媒体文件").setInputFiles({
    name: "e2e-shearing-machine.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]),
  });
  await page.getByLabel("替代文本", { exact: true }).fill("E2E electric shearing machine");
  await page.getByRole("textbox", { name: "分类", exact: true }).fill("E2E products");
  await page.getByRole("button", { name: "上传文件" }).click();
  await expect(page.getByRole("status")).toHaveText("上传成功");

  await page.getByLabel("搜索媒体").fill("e2e-shearing");
  await page.getByRole("button", { name: "搜索" }).click();
  await expect(page.getByText("e2e-shearing-machine.jpg")).toBeVisible();
  await page.getByRole("button", { name: "预览与编辑" }).click();
  await expect(page.getByRole("dialog", { name: "媒体预览" })).toBeVisible();
  await page.getByLabel("替代文本编辑").fill("Updated E2E machine alt text");
  await page.getByRole("button", { name: "保存替代文本" }).click();
  await expect(page.getByRole("dialog", { name: "媒体预览" }).getByRole("status")).toHaveText("替代文本已保存");
  await page.getByRole("button", { name: "关闭预览" }).click();

  const db = database();
  const asset = await db.mediaAsset.findFirstOrThrow({
    where: { originalName: "e2e-shearing-machine.jpg", lifecycleStatus: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
  await db.mediaReference.create({
    data: { mediaAssetId: asset.id, entityType: "Product", entityId: "e2e-product", field: "hero" },
  });
  await db.$disconnect();

  await page.getByRole("button", { name: "预览与编辑" }).click();
  await expect(page.getByText("引用警告")).toBeVisible();
  await page.getByRole("button", { name: "删除资源" }).click();
  await expect(page.getByRole("dialog", { name: "媒体预览" }).getByRole("status")).toContainText("无法删除");
  await expect(page.getByRole("dialog", { name: "媒体预览" })).toBeVisible();
});
