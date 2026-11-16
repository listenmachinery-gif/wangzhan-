import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { expect, test } from "@playwright/test";

const email = "visitor-admin-e2e@example.com";
const password = "e2e-visitor-admin-password";
const visitorIds = ["visitor-000001", "visitor-000002"];

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required for E2E tests.");
  if (!new URL(connectionString).pathname.replace(/^\//, "").endsWith("_test")) throw new Error("Visitor E2E setup requires the protected test database.");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

test.beforeAll(async () => {
  const db = database();
  const role = await db.role.upsert({ where: { key: "ADMIN" }, update: {}, create: { key: "ADMIN", name: "Admin" } });
  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash: await hash(password), isActive: true },
    create: { email, name: "Visitor Analytics Admin", passwordHash: await hash(password) },
  });
  await db.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: role.id } }, update: {}, create: { userId: user.id, roleId: role.id } });
  const now = Date.now();
  await db.analyticsVisitor.upsert({
    where: { id: visitorIds[0] },
    update: {},
    create: {
      id: visitorIds[0], anonymousId: "secret-cookie-google", environment: "DEVELOPMENT",
      firstSeenAt: new Date(now - 86_400_000), lastSeenAt: new Date(now - 600_000), lastActiveAt: new Date(now - 600_000),
      firstSource: { source: "google", medium: "organic" }, lastSource: { source: "google", medium: "organic" },
      countryCode: "US", deviceType: "desktop", browser: "Chrome", operatingSystem: "Windows", isBot: false,
    },
  });
  await db.analyticsVisitor.upsert({
    where: { id: visitorIds[1] },
    update: {},
    create: {
      id: visitorIds[1], anonymousId: "secret-cookie-linkedin", environment: "DEVELOPMENT",
      firstSeenAt: new Date(now - 43_200_000), lastSeenAt: new Date(now - 300_000), lastActiveAt: new Date(now - 300_000),
      firstSource: { source: "linkedin", medium: "referral" }, lastSource: { source: "linkedin", medium: "referral" },
      countryCode: "DE", deviceType: "mobile", browser: "Safari", operatingSystem: "iOS", isBot: false,
    },
  });
  await db.$disconnect();
});

test.afterAll(async () => {
  const db = database();
  await db.analyticsVisitor.deleteMany({ where: { id: { in: visitorIds } } });
  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (user) {
    await db.session.deleteMany({ where: { userId: user.id } });
    await db.userRole.deleteMany({ where: { userId: user.id } });
    await db.user.delete({ where: { id: user.id } });
  }
  await db.$disconnect();
});

test("persists visitor filters in the URL and exports the same result", async ({ page }) => {
  expect((await page.request.get("/api/admin/analytics/visitors")).status()).toBe(401);

  await page.goto("/admin/login");
  await page.getByLabel("管理员邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录 ZYRON CMS" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/analytics/visitors");

  await expect(page.getByRole("heading", { name: "访客分析" })).toBeVisible();
  await page.getByLabel("流量来源").fill("google");
  await page.getByLabel("国家 / 地区代码").fill("US");
  await page.getByLabel("设备").selectOption("desktop");
  await page.getByRole("button", { name: "应用筛选" }).click();

  await expect(page).toHaveURL(/source=google/);
  await expect(page).toHaveURL(/countryCode=US/);
  await expect(page.getByText("访客-000001")).toBeVisible();
  await expect(page.getByText("访客-000002")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("secret-cookie-google");

  const csv = await page.evaluate(async () => {
    const response = await fetch("/api/admin/analytics/visitors/export?source=google&countryCode=US&deviceType=desktop");
    return { status: response.status, body: await response.text() };
  });
  expect(csv.status).toBe(200);
  expect(csv.body).toContain("访客-000001");
  expect(csv.body).not.toContain("访客-000002");

  await page.getByLabel("国家 / 地区代码").fill("ZZ");
  await page.getByRole("button", { name: "应用筛选" }).click();
  await expect(page.getByText("暂无符合条件的访客")).toBeVisible();
});
