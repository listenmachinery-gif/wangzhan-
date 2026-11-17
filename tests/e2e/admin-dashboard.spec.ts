import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { expect, test } from "@playwright/test";

const email = "dashboard-admin-e2e@example.com";
const password = "e2e-dashboard-secure-password";
const day = new Date(new Date(`${new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date())}T00:00:00.000Z`).getTime() - 24 * 60 * 60 * 1_000);
const seededDimensions = [
  { dimension: "total", dimensionValue: "dashboard-e2e-total", metrics: { visitors: 18, sessions: 22, pageViews: 48, events: 5, inquiries: 2 } },
  { dimension: "country", dimensionValue: "USA", metrics: { visitors: 9, sessions: 11, pageViews: 24, events: 3, inquiries: 1 } },
  { dimension: "source", dimensionValue: "dashboard-e2e-source", metrics: { visitors: 12, sessions: 14, pageViews: 30, events: 4, inquiries: 2 } },
  { dimension: "device", dimensionValue: "tablet", metrics: { visitors: 10, sessions: 12, pageViews: 25, events: 3, inquiries: 1 } },
] as const;

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || !new URL(connectionString).pathname.replace(/^\//, "").endsWith("_test")) {
    throw new Error("Dashboard E2E requires the isolated _test database.");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

test.beforeAll(async () => {
  const db = database();
  const role = await db.role.upsert({ where: { key: "SUPER_ADMIN" }, update: {}, create: { key: "SUPER_ADMIN", name: "Super Admin" } });
  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash: await hash(password), isActive: true },
    create: { email, name: "Dashboard E2E Admin", passwordHash: await hash(password), isActive: true },
  });
  await db.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: role.id } }, update: {}, create: { userId: user.id, roleId: role.id } });
  for (const row of seededDimensions) {
    await db.analyticsDailySummary.upsert({
      where: { environment_date_dimension_dimensionValue: { environment: "DEVELOPMENT", date: day, dimension: row.dimension, dimensionValue: row.dimensionValue } },
      update: { metrics: row.metrics },
      create: { environment: "DEVELOPMENT", date: day, dimension: row.dimension, dimensionValue: row.dimensionValue, metrics: row.metrics },
    });
  }
  await db.analyticsVisitor.createMany({
    data: Array.from({ length: 18 }, (_, index) => ({
      anonymousId: `dashboard-e2e-visitor-${index}`,
      environment: "DEVELOPMENT" as const,
      firstSeenAt: day,
      lastSeenAt: new Date(day.getTime() + 12 * 60 * 60 * 1_000),
      lastActiveAt: new Date(day.getTime() + 12 * 60 * 60 * 1_000),
      countryCode: "US",
      deviceType: "tablet",
      isBot: false,
    })),
    skipDuplicates: true,
  });
  await db.$disconnect();
});

test.afterAll(async () => {
  const db = database();
  await db.analyticsDailySummary.deleteMany({
    where: { environment: "DEVELOPMENT", date: day, OR: seededDimensions.map(({ dimension, dimensionValue }) => ({ dimension, dimensionValue })) },
  });
  await db.analyticsVisitor.deleteMany({ where: { environment: "DEVELOPMENT", anonymousId: { startsWith: "dashboard-e2e-visitor-" } } });
  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (user) {
    await db.auditLog.updateMany({ where: { actorId: user.id }, data: { actorId: null } });
    await db.session.deleteMany({ where: { userId: user.id } });
    await db.userRole.deleteMany({ where: { userId: user.id } });
    await db.user.delete({ where: { id: user.id } });
  }
  await db.$disconnect();
});

test("protects dashboard APIs and runs the visual command center controls", async ({ page }) => {
  for (const url of [
    "/api/admin/analytics/reports",
    "/api/admin/analytics/overview?range=28d",
    "/api/admin/inquiries?page=1&pageSize=6",
  ]) {
    expect((await page.request.get(url)).status()).toBe(401);
  }

  await page.goto("/admin/login");
  await page.getByLabel("管理员邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录 ZYRON CMS" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "ZYRON 全球业务数据中心" })).toBeVisible();

  for (const region of [
    "核心业务指标", "核心指标趋势", "实时访客指挥区", "全球流量分布", "渠道 / 来源分布",
    "设备结构", "第一方转化漏斗", "热门产品", "搜索表现", "最新询盘", "数据源健康状态",
  ]) {
    await expect(page.getByRole("region", { name: region })).toBeVisible();
  }
  await expect(page.getByTestId("dashboard-kpi-period-visitors")).toContainText("18");
  await expect(page.getByText("正在加载世界地图…")).toHaveCount(0);

  for (const viewport of [
    { width: 1920, height: 1080 },
    { width: 1440, height: 900 },
    { width: 1366, height: 768 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (viewport.width < 1024) {
      await expect.poll(() => page.locator(".global-intelligence-dashboard").evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThanOrEqual(viewport.width - 1);
      await expect.poll(() => page.locator("body aside").first().evaluate((element) => getComputedStyle(element).display)).toBe("none");
    }
    await page.screenshot({ path: `.superpowers/sdd/2026-11-17-global-intelligence-dashboard/dashboard-${viewport.width}x${viewport.height}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.getByRole("button", { name: "近 7 天" }).click();
  await expect(page).toHaveURL(/\/admin\?range=7d$/);
  await page.getByRole("combobox", { name: "国家筛选" }).selectOption("USA");
  await expect(page.getByRole("combobox", { name: "国家筛选" })).toHaveValue("USA");
  await page.getByRole("combobox", { name: "设备筛选" }).selectOption("tablet");
  await expect(page.getByRole("combobox", { name: "设备筛选" })).toHaveValue("tablet");

  const refreshed = page.waitForResponse((response) => response.url().includes("/api/admin/analytics/reports?") && response.request().method() === "GET");
  await page.getByRole("button", { name: "立即刷新" }).click();
  expect((await refreshed).status()).toBe(200);
  await expect(page.getByRole("link", { name: "导出 CSV" })).toHaveAttribute("href", /\/api\/admin\/analytics\/reports\/export\?from=/);

  await page.getByRole("button", { name: "进入全屏" }).click();
  await expect(page.getByRole("button", { name: "退出全屏" })).toBeVisible();
  await page.getByRole("button", { name: "退出全屏" }).click();
  await expect(page.getByRole("button", { name: "进入全屏" })).toBeVisible();
});

