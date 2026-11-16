import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { expect, test } from "@playwright/test";

const email = "analytics-reports-e2e@example.com";
const password = "e2e-analytics-reports-password";
const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z");

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || !new URL(connectionString).pathname.replace(/^\//, "").endsWith("_test")) {
    throw new Error("Analytics report E2E requires the isolated _test database.");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

test.beforeAll(async () => {
  const db = database();
  const role = await db.role.upsert({ where: { key: "ADMIN" }, update: {}, create: { key: "ADMIN", name: "Admin" } });
  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash: await hash(password), isActive: true },
    create: { email, name: "Analytics Reports E2E", passwordHash: await hash(password), isActive: true },
  });
  await db.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: role.id } }, update: {}, create: { userId: user.id, roleId: role.id } });
  await db.analyticsDailySummary.upsert({
    where: { environment_date_dimension_dimensionValue: { environment: "DEVELOPMENT", date: today, dimension: "source", dimensionValue: "google" } },
    update: { metrics: { visitors: 8, sessions: 10, pageViews: 24, events: 3, inquiries: 2 } },
    create: { environment: "DEVELOPMENT", date: today, dimension: "source", dimensionValue: "google", metrics: { visitors: 8, sessions: 10, pageViews: 24, events: 3, inquiries: 2 } },
  });
  await db.$disconnect();
});

test.afterAll(async () => {
  const db = database();
  await db.analyticsDailySummary.deleteMany({ where: { environment: "DEVELOPMENT", date: today, dimension: "source", dimensionValue: "google" } });
  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (user) {
    await db.session.deleteMany({ where: { userId: user.id } });
    await db.userRole.deleteMany({ where: { userId: user.id } });
    await db.user.delete({ where: { id: user.id } });
  }
  await db.$disconnect();
});

test("protects and renders the first-party CRM report with a safe export", async ({ page }) => {
  expect((await page.request.get("/api/admin/analytics/reports")).status()).toBe(401);
  await page.goto("/admin/login");
  await page.getByLabel("管理员邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录 ZYRON CMS" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/analytics/reports");

  await expect(page.getByRole("heading", { name: "外贸增长报告" })).toBeVisible();
  await expect(page.getByRole("region", { name: "第一方转化漏斗" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "流量来源" })).toBeVisible();
  await expect(page.getByText("google", { exact: true })).toBeVisible();

  const result = await page.evaluate(async () => {
    const response = await fetch("/api/admin/analytics/reports/export");
    return { status: response.status, contentType: response.headers.get("content-type"), text: await response.text() };
  });
  expect(result.status).toBe(200);
  expect(result.contentType).toContain("text/csv");
  expect(result.text).toContain("日期,环境,维度");
});
