import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { expect, test } from "@playwright/test";

const email = "admin-e2e@example.com";
const password = "e2e-secure-password";

test.beforeAll(async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required for E2E tests.");
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  const role = await db.role.upsert({
    where: { key: "SUPER_ADMIN" },
    update: {},
    create: { key: "SUPER_ADMIN", name: "Super Admin" },
  });
  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash: await hash(password), isActive: true },
    create: { email, name: "E2E Admin", passwordHash: await hash(password) },
  });
  await db.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    update: {},
    create: { userId: user.id, roleId: role.id },
  });
  await db.$disconnect();
});

test("protects admin routes and keeps public/admin chrome separate", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { name: "管理后台登录" })).toBeVisible();
  await expect(page.getByRole("banner")).toHaveCount(0);

  await page.goto("/");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();

  await page.goto("/admin/login");
  await page.getByLabel("管理员邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录 ZYRON CMS" }).click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "数据总览" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "后台主导航" })).toBeVisible();
  await expect(page.getByText("经营概览", { exact: true })).toBeVisible();
  await expect(page.getByText("客户增长", { exact: true })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "面包屑" })).toContainText("数据总览");
  await expect(page.getByRole("contentinfo")).toHaveCount(0);
});
