import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { expect, test } from "@playwright/test";

const email = "analytics-admin-e2e@example.com";
const password = "e2e-analytics-admin-password";

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required for E2E tests.");
  if (!new URL(connectionString).pathname.replace(/^\//, "").endsWith("_test")) {
    throw new Error("Analytics E2E setup is restricted to a database whose name ends with _test.");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

test.beforeAll(async () => {
  const db = database();
  const role = await db.role.upsert({
    where: { key: "ADMIN" },
    update: {},
    create: { key: "ADMIN", name: "Admin" },
  });
  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash: await hash(password), isActive: true },
    create: { email, name: "E2E Analytics Admin", passwordHash: await hash(password) },
  });
  await db.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    update: {},
    create: { userId: user.id, roleId: role.id },
  });
  await db.$disconnect();
});

test.afterAll(async () => {
  const db = database();
  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (user) {
    await db.auditLog.updateMany({ where: { actorId: user.id }, data: { actorId: null } });
    await db.session.deleteMany({ where: { userId: user.id } });
    await db.userRole.deleteMany({ where: { userId: user.id } });
    await db.user.delete({ where: { id: user.id } });
  }
  await db.$disconnect();
});

test("protects analytics and renders truthful unconfigured Google states", async ({ page }) => {
  const googleRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("googletagmanager.com")) googleRequests.push(request.url());
  });

  const api = await page.request.get("/api/admin/analytics/overview?range=28d");
  expect(api.status()).toBe(401);
  const firstPartyApi = await page.request.get("/api/admin/analytics/first-party/overview");
  expect(firstPartyApi.status()).toBe(401);

  await page.goto("/admin/analytics");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.getByLabel("管理员邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录 ZYRON CMS" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.getByRole("link", { name: "数据分析" }).click();
  await expect(page.getByRole("heading", { name: "数据分析" })).toBeVisible();
  await expect(page.getByRole("region", { name: "第一方实时访客" })).toBeVisible();
  await expect(page.getByText("尚未配置")).toHaveCount(2);

  const firstPartyStatus = await page.evaluate(async () => {
    const response = await fetch("/api/admin/analytics/first-party/overview");
    return { status: response.status, body: await response.json() };
  });
  expect(firstPartyStatus.status).toBe(200);
  expect(firstPartyStatus.body).toMatchObject({
    environment: "DEVELOPMENT",
    summary: {
      onlineVisitors: expect.any(Number),
      activeVisitors: expect.any(Number),
      visitorsToday: expect.any(Number),
      sessionsToday: expect.any(Number),
      pageViewsToday: expect.any(Number),
    },
  });

  const status = await page.evaluate(async () => {
    const response = await fetch("/api/admin/analytics/status");
    return { status: response.status, body: await response.json() };
  });
  expect(status.status).toBe(200);
  expect(status.body).toMatchObject({
    ga4: { code: "NOT_CONFIGURED" },
    searchConsole: { code: "NOT_CONFIGURED" },
  });

  await page.context().addCookies([{
    name: "zyron_analytics_consent",
    value: "accepted",
    url: "http://127.0.0.1:3000",
    sameSite: "Lax",
  }]);
  await page.reload();
  await expect(page.getByRole("heading", { name: "数据分析" })).toBeVisible();
  expect(googleRequests).toEqual([]);
});
