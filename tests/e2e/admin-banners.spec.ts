import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { expect, test } from "@playwright/test";
import sharp from "sharp";

const email = "banners-e2e@example.com";
const password = "e2e-banners-secure-password";
const marker = "E2E Banner";

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required for E2E tests.");
  if (!new URL(connectionString).pathname.replace(/^\//, "").endsWith("_test")) {
    throw new Error("Banner E2E cleanup is restricted to a database whose name ends with _test.");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

test.beforeAll(async () => {
  const db = database();
  const role = await db.role.upsert({ where: { key: "CONTENT_EDITOR" }, update: {}, create: { key: "CONTENT_EDITOR", name: "Content Editor" } });
  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash: await hash(password), isActive: true },
    create: { email, name: "E2E Banner Editor", passwordHash: await hash(password) },
  });
  await db.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: role.id } }, update: {}, create: { userId: user.id, roleId: role.id } });
  await db.auditLog.deleteMany({ where: { entityType: "Banner" } });
  await db.banner.deleteMany();
  const oldMedia = await db.mediaAsset.findMany({ where: { uploadedById: user.id, originalName: "e2e-banner.png" }, select: { id: true } });
  await db.auditLog.deleteMany({ where: { entityType: "MediaAsset", entityId: { in: oldMedia.map(({ id }) => id) } } });
  await db.mediaAsset.deleteMany({ where: { id: { in: oldMedia.map(({ id }) => id) } } });
  await db.$disconnect();
});

test.afterAll(async () => {
  const db = database();
  const banners = await db.banner.findMany({ where: { name: { startsWith: marker } }, select: { id: true } });
  await db.auditLog.deleteMany({ where: { entityType: "Banner", entityId: { in: banners.map(({ id }) => id) } } });
  await db.banner.deleteMany({ where: { id: { in: banners.map(({ id }) => id) } } });
  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (user) {
    const media = await db.mediaAsset.findMany({ where: { uploadedById: user.id, originalName: "e2e-banner.png" }, select: { id: true } });
    await db.auditLog.deleteMany({ where: { entityType: "MediaAsset", entityId: { in: media.map(({ id }) => id) } } });
    await db.mediaAsset.deleteMany({ where: { id: { in: media.map(({ id }) => id) } } });
  }
  await db.$disconnect();
});

test("previews, publishes, orders, and applies responsive fallback on the homepage", async ({ page }) => {
  await page.goto("/admin/login");
  const unauthenticated = await page.evaluate(async () => (await fetch("/api/admin/banners")).status);
  expect(unauthenticated).toBe(401);
  const untrusted = await page.request.post("/api/admin/banners", {
    headers: { origin: "https://attacker.test", "sec-fetch-site": "cross-site", "content-type": "application/json" },
    data: {},
  });
  expect(untrusted.status()).toBe(403);

  await page.getByLabel("管理员邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录 ZYRON CMS" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  const image = await sharp({ create: { width: 32, height: 18, channels: 3, background: "#76b900" } }).png().toBuffer();
  const upload = await page.evaluate(async ({ base64 }) => {
    const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
    const body = new FormData();
    body.append("file", new File([bytes], "e2e-banner.png", { type: "image/png" }));
    body.append("usage", "EDITORIAL_IMAGE");
    body.append("altText", "E2E responsive banner image");
    const response = await fetch("/api/admin/media", { method: "POST", body });
    return { status: response.status, result: await response.json() };
  }, { base64: image.toString("base64") });
  expect(upload.status).toBe(201);
  const mediaId = upload.result.id as string;

  await page.getByRole("link", { name: "Banner 管理" }).click();
  await page.getByRole("link", { name: "新建 Banner" }).click();
  await page.getByLabel("内部名称").fill(`${marker} Primary`);
  await page.getByLabel("排序").fill("10");
  await page.getByLabel("主标题").fill("Primary E2E homepage banner");
  await page.getByLabel("副标题").fill("Published from the real CMS API.");
  await page.getByLabel("按钮文字").fill("Explore products");
  await page.getByLabel("按钮链接").fill("/products");
  await page.getByLabel("桌面图片（必选）").selectOption(mediaId);
  const preview = page.locator("[data-draft-banner-preview]");
  await expect(preview.getByRole("heading", { name: "Primary E2E homepage banner" })).toBeVisible();
  await expect(preview.getByText("Published from the real CMS API.")).toBeVisible();
  await expect(preview.getByText("Explore products")).toBeVisible();
  await page.getByRole("button", { name: "手机预览" }).click();
  await expect(preview).toHaveAttribute("data-viewport", "mobile");
  await expect(preview.getByRole("img", { name: "E2E responsive banner image" })).toBeVisible();
  expect(await (await page.request.get("/")).text()).not.toContain("Primary E2E homepage banner");
  await page.getByRole("button", { name: "保存" }).click();
  await expect(page).toHaveURL(/\/admin\/banners\/(?!new)[^/]+$/);
  await expect(page.getByRole("heading", { name: `${marker} Primary`, exact: false })).toBeVisible();
  await expect(page.getByText(/草稿 · v\d+/)).toBeVisible();
  await page.getByRole("button", { name: "发布到首页" }).click();
  await expect(page.getByRole("status")).toContainText("已发布");

  const second = await page.evaluate(async ({ mediaId }) => {
    const created = await fetch("/api/admin/banners", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "E2E Banner Secondary", title: "Secondary E2E homepage banner",
        desktopMediaId: mediaId, enabled: true, position: 0,
      }),
    });
    const banner = await created.json();
    const published = await fetch(`/api/admin/banners/${banner.id}/publish`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ version: banner.version }),
    });
    return { createStatus: created.status, publishStatus: published.status };
  }, { mediaId });
  expect(second).toEqual({ createStatus: 201, publishStatus: 200 });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Secondary E2E homepage banner" })).toBeVisible();
  const hero = page.getByRole("region", { name: "Featured banners" });
  await expect(hero.locator("source[data-banner-viewport='desktop']")).toHaveAttribute("srcset", `/api/media/${mediaId}`);
  await expect(hero.locator("img, video")).toHaveCount(1);
  await hero.getByRole("button", { name: "Next banner" }).click();
  await expect(page.getByRole("heading", { name: "Primary E2E homepage banner" })).toBeVisible();
});
