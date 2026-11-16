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
  const unauthenticatedStatus = await page.evaluate(async () => {
    const body = new FormData();
    body.append("usage", "EDITORIAL_IMAGE");
    return (await fetch("/api/admin/media", { method: "POST", body })).status;
  });
  expect(unauthenticatedStatus).toBe(401);

  const untrusted = await page.request.post("/api/admin/media", {
    headers: { origin: "https://attacker.test", "sec-fetch-site": "cross-site" },
    multipart: { usage: "EDITORIAL_IMAGE" },
  });
  expect(untrusted.status()).toBe(403);

  await page.getByLabel("管理员邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录 ZYRON CMS" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole("link", { name: "媒体资源" }).click();
  await expect(page.getByRole("heading", { name: "媒体资源" })).toBeVisible();

  await page.getByLabel("选择媒体文件").setInputFiles({
    name: "e2e-shearing-machine.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await page.getByLabel("替代文本", { exact: true }).fill("E2E electric shearing machine");
  await page.getByRole("textbox", { name: "分类", exact: true }).fill("E2E products");
  await page.getByRole("button", { name: "上传文件" }).click();
  await expect(page.getByRole("status")).toHaveText("上传成功");

  await page.getByLabel("搜索媒体").fill("e2e-shearing");
  await page.getByRole("button", { name: "搜索" }).click();
  const mediaList = page.getByRole("list", { name: "媒体资源列表" });
  await expect(mediaList.getByRole("listitem")).toHaveCount(1);
  await expect(page.getByText("e2e-shearing-machine.png")).toBeVisible();
  await mediaList.getByRole("listitem").getByRole("button", { name: "预览与编辑" }).click();
  await expect(page.getByRole("dialog", { name: "媒体预览" })).toBeVisible();
  await expect(
    page.getByRole("dialog", { name: "媒体预览" }).getByRole("img", { name: "E2E electric shearing machine" }),
  ).toHaveJSProperty("naturalWidth", 1);
  await page.getByLabel("替代文本编辑").fill("Updated E2E machine alt text");
  await page.getByRole("button", { name: "保存替代文本" }).click();
  await expect(page.getByRole("dialog", { name: "媒体预览" }).getByRole("status")).toHaveText("替代文本已保存");
  await page.getByRole("button", { name: "关闭预览" }).click();

  const db = database();
  const asset = await db.mediaAsset.findFirstOrThrow({
    where: { originalName: "e2e-shearing-machine.png", lifecycleStatus: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
  await db.mediaReference.create({
    data: { mediaAssetId: asset.id, entityType: "Product", entityId: "e2e-product", field: "hero" },
  });
  await db.$disconnect();

  await mediaList.getByRole("listitem").getByRole("button", { name: "预览与编辑" }).click();
  await expect(page.getByText("引用警告")).toBeVisible();
  await page.getByRole("button", { name: "删除资源" }).click();
  await expect(page.getByRole("dialog", { name: "媒体预览" }).getByRole("status")).toContainText("无法删除");
  await expect(page.getByRole("dialog", { name: "媒体预览" })).toBeVisible();
});
