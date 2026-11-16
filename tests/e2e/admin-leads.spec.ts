import { execFileSync } from "node:child_process";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { expect, test } from "@playwright/test";

const adminEmail = "lead-admin-e2e@example.com";
const adminPassword = "e2e-lead-admin-password";
const salesEmail = "lead-sales-e2e@example.com";
const salesPassword = "e2e-lead-sales-password";
const buyerEmail = "crm-browser-buyer@example.com";

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required for E2E tests.");
  if (!new URL(connectionString).pathname.replace(/^\//, "").endsWith("_test")) {
    throw new Error("Lead E2E cleanup is restricted to a database whose name ends with _test.");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

async function removeTestInquiry(db: PrismaClient) {
  const leads = await db.lead.findMany({ where: { email: buyerEmail }, select: { id: true } });
  const leadIds = leads.map(({ id }) => id);
  await db.$transaction([
    db.leadStageHistory.deleteMany({ where: { leadId: { in: leadIds } } }),
    db.auditLog.deleteMany({ where: { entityType: "Lead", entityId: { in: leadIds } } }),
    db.lead.deleteMany({ where: { id: { in: leadIds } } }),
  ]);
}

test.beforeAll(async () => {
  const db = database();
  await removeTestInquiry(db);
  execFileSync("npm", ["run", "db:seed:crm"]);
  const [adminRole, salesRole] = await Promise.all([
    db.role.upsert({ where: { key: "ADMIN" }, update: {}, create: { key: "ADMIN", name: "Admin" } }),
    db.role.upsert({ where: { key: "SALES" }, update: {}, create: { key: "SALES", name: "Sales" } }),
  ]);
  const [admin, sales] = await Promise.all([
    db.user.upsert({ where: { email: adminEmail }, update: { passwordHash: await hash(adminPassword), isActive: true }, create: { email: adminEmail, name: "E2E Lead Admin", passwordHash: await hash(adminPassword) } }),
    db.user.upsert({ where: { email: salesEmail }, update: { passwordHash: await hash(salesPassword), isActive: true }, create: { email: salesEmail, name: "E2E Lead Sales", passwordHash: await hash(salesPassword) } }),
  ]);
  await Promise.all([
    db.userRole.upsert({ where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } }, update: {}, create: { userId: admin.id, roleId: adminRole.id } }),
    db.userRole.upsert({ where: { userId_roleId: { userId: sales.id, roleId: salesRole.id } }, update: {}, create: { userId: sales.id, roleId: salesRole.id } }),
  ]);
  await db.$disconnect();
});

test.afterAll(async () => {
  const db = database();
  await removeTestInquiry(db);
  await db.$disconnect();
});

async function login(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/admin/login");
  await page.getByLabel("管理员邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录 ZYRON CMS" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test("persists a public inquiry and completes the authorized CRM workflow", async ({ page, browser }) => {
  const unauthenticated = await page.request.get("/api/admin/leads");
  expect(unauthenticated.status()).toBe(401);

  const publicResponse = await page.request.post("/api/inquiry", {
    headers: { "x-forwarded-for": "198.51.100.80", referer: "http://127.0.0.1:3000/contact" },
    data: {
      name: "CRM Browser Buyer",
      company: "Browser Fabrication",
      email: buyerEmail,
      country: "Canada",
      productInterest: "Hydraulic Shears",
      requirement: "Need a 3200 mm machine for a new production line.",
      website: "",
    },
  });
  expect(publicResponse.status()).toBe(202);
  await expect(publicResponse.json()).resolves.toMatchObject({ reference: expect.stringMatching(/^inq_/) });

  await login(page, adminEmail, adminPassword);
  await page.getByRole("link", { name: "询盘 CRM" }).click();
  await expect(page.getByRole("heading", { name: "询盘 CRM" })).toBeVisible();
  const row = page.getByRole("row", { name: /CRM Browser Buyer/ });
  await expect(row).toContainText("新询盘");
  await row.getByRole("link", { name: /^INQ-/ }).click();
  await expect(page).toHaveURL(/\/admin\/leads\/[^/]+$/);
  await page.getByRole("combobox", { name: "负责人", exact: true }).selectOption({ label: `E2E Lead Sales · ${salesEmail}` });
  await expect(page.getByText("已保存")).toBeVisible();

  const salesContext = await browser.newContext();
  const salesPage = await salesContext.newPage();
  await login(salesPage, salesEmail, salesPassword);
  await salesPage.getByRole("link", { name: "询盘 CRM" }).click();
  await expect(salesPage.getByRole("row", { name: /CRM Browser Buyer/ })).toBeVisible();
  await salesPage.getByRole("row", { name: /CRM Browser Buyer/ }).getByRole("link", { name: /^INQ-/ }).click();
  await expect(salesPage).toHaveURL(/\/admin\/leads\/[^/]+$/);
  await salesPage.getByRole("combobox", { name: "状态", exact: true }).selectOption("CONTACTED");
  await expect(salesPage.getByText("已保存")).toBeVisible();
  await salesPage.getByPlaceholder("添加不可修改的跟进备注").fill("Buyer confirmed voltage and delivery port.");
  await salesPage.getByRole("button", { name: "添加" }).click();
  await expect(salesPage.getByText("Buyer confirmed voltage and delivery port.")).toBeVisible();

  const exportResult = await salesPage.evaluate(async () => {
    const response = await fetch("/api/admin/leads/export");
    return { status: response.status, text: await response.text() };
  });
  expect(exportResult.status).toBe(200);
  expect(exportResult.text).toContain(buyerEmail);
  await salesContext.close();
});
