import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";

const email = "p0-super-admin@example.com";
const password = "p0-acceptance-admin-password";
const managedEmail = "p0-managed-sales@example.com";
const categorySlug = "p0-acceptance-category";

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || !new URL(connectionString).pathname.replace(/^\//, "").endsWith("_test")) throw new Error("P0 acceptance requires the protected test database.");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

test.beforeAll(async () => {
  const db = database();
  await db.user.deleteMany({ where: { email } });
  await db.productCategory.deleteMany({ where: { slug: categorySlug } });
  await db.$disconnect();
  execFileSync("npm", ["run", "admin:bootstrap"], {
    cwd: process.cwd(),
    env: { ...process.env, BOOTSTRAP_ADMIN_EMAIL: email, BOOTSTRAP_ADMIN_NAME: "P0 Super Admin", BOOTSTRAP_ADMIN_PASSWORD: password },
    stdio: "pipe",
  });
  const seeded = database();
  const salesRole = await seeded.role.upsert({ where: { key: "SALES" }, update: {}, create: { key: "SALES", name: "Sales" } });
  const managed = await seeded.user.upsert({ where: { email: managedEmail }, update: { isActive: true }, create: { email: managedEmail, name: "P0 Sales", passwordHash: await hash("managed-sales-password") } });
  await seeded.userRole.upsert({ where: { userId_roleId: { userId: managed.id, roleId: salesRole.id } }, update: {}, create: { userId: managed.id, roleId: salesRole.id } });
  await seeded.$disconnect();
});

test.afterAll(async () => {
  const db = database();
  const users = await db.user.findMany({ where: { email: { in: [email, managedEmail] } }, select: { id: true } });
  await db.auditLog.deleteMany({ where: { actorId: { in: users.map(({ id }) => id) } } });
  await db.user.deleteMany({ where: { id: { in: users.map(({ id }) => id) } } });
  await db.siteSetting.deleteMany({ where: { key: { in: ["company.name", "contact.email", "contact.whatsapp", "contact.address", "seo.titleSuffix"] } } });
  await db.productCategory.deleteMany({ where: { slug: categorySlug } });
  await db.$disconnect();
});

test("Super Admin configures non-secret settings, manages a user, and public URLs remain unchanged", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/admin/login");
  await page.getByLabel("管理员邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录 ZYRON CMS" }).click();
  await expect(page.getByRole("link", { name: "用户与权限" })).toBeVisible();
  await expect(page.getByRole("link", { name: "系统设置" })).toBeVisible();

  await page.getByRole("link", { name: "产品分类" }).click();
  await page.getByLabel("名称").fill("P0 Acceptance Category");
  await page.getByLabel("固定 slug").fill(categorySlug);
  await page.getByLabel("摘要").fill("Created through the protected category API.");
  await page.getByRole("button", { name: "创建草稿" }).click();
  await expect(page.getByRole("status")).toContainText("分类已创建为草稿", { timeout: 15_000 });
  const categoryRow = page.getByRole("row", { name: new RegExp(categorySlug) });
  await expect(categoryRow).toContainText("DRAFT");
  await categoryRow.getByRole("button", { name: "发布" }).click();
  await expect(page.getByRole("status")).toContainText("分类已保存");
  await expect(categoryRow).toContainText("PUBLISHED");

  await page.getByRole("link", { name: "系统设置" }).click();
  await page.getByLabel("公司名称").fill("ZYRON CNC");
  await page.getByLabel("联系邮箱").fill("info@zyroncnc.com");
  await page.getByLabel("WhatsApp").fill("+8615655537083");
  await page.getByLabel("公司地址").fill("Ma'anshan, Anhui, China");
  await page.getByLabel("SEO 标题后缀").fill("ZYRON Heavy Industry");
  await page.getByRole("button", { name: "保存设置" }).click();
  await expect(page.getByRole("status")).toContainText("设置已保存");
  await expect(page.getByText("双因素认证（2FA）：尚未配置")).toBeVisible();

  await page.getByRole("link", { name: "用户与权限" }).click();
  await page.getByRole("row", { name: new RegExp(managedEmail) }).getByRole("link", { name: "编辑" }).click();
  await page.getByLabel("姓名").fill("P0 Managed Sales");
  await page.getByRole("button", { name: "保存用户" }).click();
  await expect(page.getByRole("status")).toContainText("用户已保存");

  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/products");
  await expect(page).toHaveURL(/\/products$/);
});
