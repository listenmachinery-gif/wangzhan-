import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { expect, test } from "@playwright/test";

const email = "phase1-navigation-editor@zyron.test";
const password = "phase1-navigation-password";

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || !new URL(connectionString).pathname.replace(/^\//, "").endsWith("_test")) throw new Error("Phase 1 navigation E2E requires a protected _test database.");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

test.beforeAll(async () => {
  const db = database();
  await db.navigationDocument.deleteMany({ where: { key: "PRIMARY" } });
  const role = await db.role.upsert({ where: { key: "CONTENT_EDITOR" }, update: {}, create: { key: "CONTENT_EDITOR", name: "Content Editor" } });
  const user = await db.user.upsert({ where: { email }, update: { passwordHash: await hash(password), isActive: true }, create: { email, name: "Phase 1 Navigation Editor", passwordHash: await hash(password) } });
  await db.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: role.id } }, update: {}, create: { userId: user.id, roleId: role.id } });
  await db.$disconnect();
});

test.afterAll(async () => {
  const db = database();
  await db.navigationDocument.deleteMany({ where: { key: "PRIMARY" } });
  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (user) {
    await db.auditLog.updateMany({ where: { actorId: user.id }, data: { actorId: null } });
    await db.session.deleteMany({ where: { userId: user.id } });
    await db.userRole.deleteMany({ where: { userId: user.id } });
    await db.user.delete({ where: { id: user.id } });
  }
  await db.$disconnect();
});

test("saves a navigation draft, publishes across desktop/mobile/footer, and rolls back without changing the live snapshot", async ({ page, browser }) => {
  await page.goto("/admin/login");
  await page.getByLabel("管理员邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录 ZYRON CMS" }).click();
  await page.getByRole("link", { name: "导航管理" }).click();

  await page.getByRole("textbox", { name: "HOME 名称" }).fill("E2E HOME");
  await page.getByRole("textbox", { name: "页脚组 1 链接 1 名称" }).fill("E2E SUPPORT");
  await page.getByRole("button", { name: "保存草稿" }).click();
  await expect(page.getByRole("status")).toContainText("草稿已保存");

  const publicContext = await browser.newContext();
  const publicPage = await publicContext.newPage();
  await publicPage.goto("/");
  await expect(publicPage.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "HOME", exact: true })).toBeVisible();
  await expect(publicPage.getByRole("link", { name: "E2E HOME", exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "发布到前台" }).click();
  await expect(page.getByRole("status")).toContainText("导航已发布到前台");
  await publicPage.reload();
  await expect(publicPage.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "E2E HOME", exact: true })).toBeVisible();
  await expect(publicPage.getByRole("contentinfo").getByRole("link", { name: "E2E SUPPORT" })).toBeVisible();

  await publicPage.setViewportSize({ width: 390, height: 844 });
  await publicPage.getByLabel("Open navigation").click();
  await expect(publicPage.getByRole("link", { name: "E2E HOME", exact: true })).toBeVisible();

  await page.getByRole("textbox", { name: "E2E HOME 名称" }).fill("E2E DRAFT HOME");
  await page.getByRole("button", { name: "保存草稿" }).click();
  await expect(page.getByRole("status")).toContainText("草稿已保存");
  await page.reload();
  await page.getByRole("button", { name: "回滚到版本 1" }).click();
  await expect(page.getByRole("status")).toContainText("历史版本已恢复为新草稿");
  await publicPage.reload();
  await publicPage.getByLabel("Open navigation").click();
  await expect(publicPage.getByRole("link", { name: "E2E HOME", exact: true })).toBeVisible();
  await expect(publicPage.getByRole("link", { name: "E2E DRAFT HOME", exact: true })).toHaveCount(0);
  await publicContext.close();
});
