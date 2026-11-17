import { execFileSync } from "node:child_process";
import { createHmac } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { expect, test, type Page } from "@playwright/test";

const password = "e2e-crm-fixture-password";
const prefix = "crm-phase1-e2e";
const buyerEmail = `${prefix}-buyer@example.com`;
const publicNetwork = "198.51.100.183";
const roles = { admin: "ADMIN", sales: "SALES", colleague: "SALES", outside: "SALES", manager: "SALES_MANAGER", viewer: "CRM_VIEWER" } as const;
type Actor = keyof typeof roles;
const actorId = (actor: Actor) => `${prefix}-${actor}`;
const origin = { origin: "http://127.0.0.1:3000" };
const ownLead = `${prefix}-own`;
const colleagueLead = `${prefix}-colleague-lead`;
const outsideLead = `${prefix}-outside-lead`;
const customerId = `${prefix}-shared-customer`;

async function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString !== process.env.TEST_DATABASE_URL) {
    throw new Error("E2E requires DATABASE_URL to exactly match TEST_DATABASE_URL.");
  }
  const expected = new URL(connectionString).pathname.slice(1);
  if (!expected.endsWith("_test")) throw new Error("E2E writes require a _test database.");
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  const [actual] = await db.$queryRaw<Array<{ name: string }>>`SELECT current_database() AS name`;
  if (actual.name !== expected) {
    await db.$disconnect();
    throw new Error("Connected database does not match the exact test database.");
  }
  return db;
}

async function cleanup(db: PrismaClient) {
  const leads = await db.lead.findMany({ where: { email: { startsWith: prefix } }, select: { id: true } });
  const contacts = await db.contact.findMany({ where: { email: { startsWith: prefix } }, select: { id: true, companyId: true } });
  const ids = leads.map(({ id }) => id);
  await db.$transaction([
    db.leadStageHistory.deleteMany({ where: { leadId: { in: ids } } }),
    db.lead.deleteMany({ where: { id: { in: ids } } }),
    db.contact.deleteMany({ where: { id: { in: contacts.map(({ id }) => id) } } }),
    db.company.deleteMany({ where: { id: { in: contacts.flatMap(({ companyId }) => companyId ? [companyId] : []) } } }),
    db.auditLog.deleteMany({ where: { OR: [
      { actorId: { in: Object.keys(roles).map((actor) => actorId(actor as Actor)) } },
      { action: "inquiry.attempt", ipHash: createHmac("sha256", process.env.SESSION_SECRET!).update(publicNetwork).digest("hex") },
    ] } }),
    db.crmTeamMembership.deleteMany({ where: { teamId: { startsWith: prefix } } }),
    db.crmTeam.deleteMany({ where: { id: { startsWith: prefix } } }),
    db.session.deleteMany({ where: { userId: { startsWith: prefix } } }),
    db.userRole.deleteMany({ where: { userId: { startsWith: prefix } } }),
    db.loginAttempt.deleteMany({ where: { userId: { startsWith: prefix } } }),
    db.user.deleteMany({ where: { id: { startsWith: prefix } } }),
  ]);
}

test.beforeAll(async () => {
  const db = await database();
  try {
    await cleanup(db);
    execFileSync("npm", ["run", "db:seed:crm"], { stdio: "pipe" });
    const passwordHash = await hash(password);
    for (const [actor, key] of Object.entries(roles)) {
      const role = await db.role.upsert({ where: { key }, update: {}, create: { key, name: key } });
      await db.user.create({ data: { id: actorId(actor as Actor), email: `${actorId(actor as Actor)}@example.com`, name: `E2E ${actor}`, passwordHash, roles: { create: { roleId: role.id } } } });
    }
    await db.crmTeam.createMany({ data: ["north", "south", "expired"].map((name) => ({ id: `${prefix}-${name}`, name: `E2E ${name}` })) });
    await db.crmTeamMembership.createMany({ data: [
      { userId: actorId("sales"), role: "MEMBER" as const },
      { userId: actorId("colleague"), role: "MEMBER" as const },
      { userId: actorId("manager"), role: "MANAGER" as const },
      { userId: actorId("viewer"), role: "VIEWER" as const },
    ].map((member) => ({ ...member, teamId: `${prefix}-north`, startsAt: new Date("2000-01-01") })) });
    await db.crmTeamMembership.createMany({ data: [
      { userId: actorId("outside"), teamId: `${prefix}-south`, role: "MEMBER", startsAt: new Date("2000-01-01") },
      { userId: actorId("manager"), teamId: `${prefix}-south`, role: "MANAGER", startsAt: new Date("2000-01-01"), endsAt: new Date("2020-01-01") },
      { userId: actorId("viewer"), teamId: `${prefix}-south`, role: "VIEWER", startsAt: new Date("2000-01-01"), endsAt: new Date("2020-01-01") },
    ] });
    await db.contact.create({ data: { id: customerId, customerCode: `${prefix}-customer`, fullName: "E2E Shared Customer", email: `${prefix}-shared@example.com`, countryCode: "US", ownerId: actorId("admin"), internalNotes: "PRIVATE CUSTOMER INTERNAL NOTE" } });
    for (const [id, actor, name] of [[ownLead, "sales", "E2E Own Buyer"], [colleagueLead, "colleague", "E2E Colleague Buyer"], [outsideLead, "outside", "E2E Outside Buyer"]] as const) {
      await db.lead.create({ data: { id, name, email: `${id}@example.com`, country: id === ownLead ? "US" : "DE", message: `Private requirement ${id}`, contactId: customerId, stageId: "crm_stage_new_inquiry", assignments: { create: { assigneeId: actorId(actor), assignedById: actorId("admin") } }, activities: { create: { type: "NOTE", content: `Private note ${id}` } } } });
    }
  } finally { await db.$disconnect(); }
});
test.afterAll(async () => { const db = await database(); try { await cleanup(db); } finally { await db.$disconnect(); } });

async function login(page: Page, actor: Actor) {
  await page.goto("/admin/login");
  await page.getByLabel("管理员邮箱").fill(`${actorId(actor)}@example.com`);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录 ZYRON CMS" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

// Catches broken public persistence, legacy aliases, explicit customer linking and stage compatibility.
test("public intake and manual customer workflows work through old and new URLs", async ({ page }) => {
  for (const path of ["/api/admin/leads", "/api/admin/inquiries", "/api/admin/customers", `/api/admin/inquiries/${ownLead}`]) {
    expect((await page.request.get(path)).status()).toBe(401);
  }
  const response = await page.request.post("/api/inquiry", { headers: { "x-forwarded-for": publicNetwork }, data: {
    name: "CRM Browser Buyer", company: "Browser Fabrication", email: buyerEmail, country: "Canada", productInterest: "Hydraulic Shears", requirement: "Need a 3200 mm machine for a new production line.", website: "",
  } });
  expect(response.status()).toBe(202);
  expect(await response.json()).toMatchObject({ reference: expect.stringMatching(/^inq_/) });
  await login(page, "admin");
  expect((await page.request.patch(`/api/admin/inquiries/${ownLead}`, { headers: { origin: "https://untrusted.example" }, data: { version: 1, stageCode: "CONTACTED" } })).status()).toBe(403);
  await page.goto(`/admin/leads?query=${buyerEmail}`);
  const row = page.getByRole("row", { name: /CRM Browser Buyer/ });
  await expect(row).toContainText("新询盘");
  await row.getByRole("link", { name: /^INQ-/ }).click();
  await expect(page).toHaveURL(/\/admin\/leads\/[^/]+$/);
  const publicId = new URL(page.url()).pathname.split("/").at(-1)!;
  await page.getByRole("combobox", { name: "负责人", exact: true }).selectOption({ label: "E2E sales" });
  const assigned = page.waitForResponse((response) => response.request().method() === "PATCH" && response.url().endsWith(`/inquiries/${publicId}`));
  await page.getByRole("button", { name: "保存负责人" }).click();
  expect((await assigned).status()).toBe(200);
  expect((await (await page.request.get(`/api/admin/leads/${publicId}`)).json()).assignments).toEqual(expect.arrayContaining([expect.objectContaining({ assigneeId: actorId("sales"), endedAt: null })]));
  await page.goto(`/admin/inquiries?query=${buyerEmail}`);
  await expect(page.getByRole("row", { name: /CRM Browser Buyer/ })).toBeVisible();
  await page.goto(`/admin/inquiries/${publicId}`);
  await expect(page.getByRole("region", { name: "原始询盘", exact: true })).toContainText("Need a 3200 mm machine for a new production line.");

  await page.goto("/admin/customers/new");
  await page.getByRole("textbox", { name: "客户姓名", exact: true }).fill("E2E Created Customer");
  await page.getByRole("textbox", { name: "电子邮箱", exact: true }).fill(`${prefix}-created@example.com`);
  await page.getByRole("textbox", { name: "公司名称", exact: true }).fill("E2E Created Company");
  await page.getByRole("button", { name: "创建客户", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/customers\/(?!new$)[^/]+$/);
  const createdCustomerId = new URL(page.url()).pathname.split("/").at(-1)!;
  await page.goto("/admin/customers?query=E2E%20Created%20Customer");
  await expect(page.getByRole("row", { name: /E2E Created Customer/ })).toBeVisible();
  const linked = await page.request.post("/api/admin/inquiries", { headers: origin, data: { name: "E2E Linked Buyer", email: `${prefix}-linked@example.com`, message: "Linked existing customer", contactId: createdCustomerId, assigneeId: actorId("sales") } });
  expect(linked.status()).toBe(201);
  expect((await linked.json()).inquiry).toMatchObject({ contactId: createdCustomerId, companyId: expect.any(String) });
  await page.goto(`/admin/customers/${createdCustomerId}`);
  await expect(page.getByRole("link", { name: /^INQ-/ })).toHaveCount(1);

  await page.goto("/admin/inquiries/new");
  await page.getByRole("textbox", { name: "客户姓名", exact: true }).fill("E2E Manual Buyer");
  await page.getByRole("textbox", { name: "电子邮箱", exact: true }).fill(`${prefix}-manual@example.com`);
  await page.getByRole("textbox", { name: "公司名称", exact: true }).fill("E2E Manual Company");
  await page.getByRole("textbox", { name: "需求描述", exact: true }).fill("Manual machine requirement");
  await page.getByLabel("同时新建联系人").check();
  await page.getByLabel("同时新建公司").check();
  await page.getByRole("combobox", { name: "负责人", exact: true }).selectOption(actorId("sales"));
  await page.getByRole("button", { name: "创建询盘", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/leads\/[^/]+$/);
  const manualId = new URL(page.url()).pathname.split("/").at(-1)!;
  const manual = await (await page.request.get(`/api/admin/inquiries/${manualId}`)).json();
  expect(manual).toMatchObject({ recordOrigin: "MANUAL", contactId: expect.any(String), companyId: expect.any(String), status: "NEW" });
  await page.goto(`/admin/customers/${manual.contactId}`);
  await expect(page.getByRole("heading", { name: "E2E Manual Buyer", exact: true })).toBeVisible();
});

// Catches unrestricted lists, stale assignments, expired memberships and cross-sales customer leakage.
for (const actor of ["sales", "manager", "viewer"] as const) {
  test(`${actor} sees only current scope and protected customer history`, async ({ page }) => {
    await login(page, actor);
    await page.goto("/admin/inquiries?query=E2E");
    const ownRow = page.getByRole("row", { name: /E2E Own Buyer/ });
    await expect(ownRow).toBeVisible();
    await expect(ownRow.getByText("美国", { exact: true })).toBeVisible();
    await expect(page.getByRole("row", { name: /E2E Outside Buyer/ })).toHaveCount(0);
    await expect(page.getByRole("row", { name: /E2E Colleague Buyer/ })).toHaveCount(actor === "sales" ? 0 : 1);
    for (const path of ["leads", "inquiries"]) {
      const list = await page.request.get(`/api/admin/${path}?query=E2E`);
      expect(list.status()).toBe(200);
      const text = await list.text();
      expect(text).toContain(ownLead);
      expect(text).not.toContain(outsideLead);
      if (actor === "sales") expect(text).not.toContain(colleagueLead);
      expect((await page.request.get(`/api/admin/${path}/${outsideLead}`)).status()).toBe(403);
    }
    const csv = await page.request.get("/api/admin/leads/export?query=E2E");
    expect(csv.status()).toBe(actor === "viewer" ? 403 : 200);
    if (actor !== "viewer") {
      expect(await csv.text()).toContain(`${ownLead}@example.com`);
      expect(await csv.text()).not.toContain(`${outsideLead}@example.com`);
    }
    const customer = await (await page.request.get(`/api/admin/customers/${customerId}`)).json();
    expect(customer.inquiries.map((inquiry: { id: string }) => inquiry.id).sort()).toEqual((actor === "sales" ? [ownLead] : [ownLead, colleagueLead]).sort());
    expect(JSON.stringify(customer)).not.toMatch(/PRIVATE CUSTOMER INTERNAL NOTE|outside-lead/);
    await page.goto(`/admin/customers/${customerId}`);
    await expect(page.getByText("PRIVATE CUSTOMER INTERNAL NOTE")).toHaveCount(0);
    await expect(page.getByText(`Private note ${outsideLead}`)).toHaveCount(0);
    if (actor === "sales") await expect(page.getByText(`Private note ${colleagueLead}`)).toHaveCount(0);
    await page.goto(`/admin/inquiries/${ownLead}`);
    if (actor === "viewer") {
      expect(customer.timeline.filter((activity: { type: string }) => activity.type === "NOTE")).toEqual([]);
      const leadDetail = await (await page.request.get(`/api/admin/inquiries/${ownLead}`)).json();
      expect(leadDetail.activities.filter((activity: { type: string }) => activity.type === "NOTE")).toEqual([]);
      await expect(page.getByText(`Private note ${ownLead}`, { exact: true })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "标记垃圾询盘" })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "保存跟进时间" })).toHaveCount(0);
      await expect(page.getByText("只读：当前权限无法修改此询盘。")).toBeVisible();
      await expect(page.getByRole("button", { name: "保存阶段" })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "添加基础备注" })).toHaveCount(0);
      expect((await page.request.patch(`/api/admin/inquiries/${ownLead}`, { headers: origin, data: { version: 1, stageCode: "CONTACTED" } })).status()).toBe(403);
      expect((await page.request.post(`/api/admin/leads/${ownLead}/activities`, { headers: origin, data: { type: "NOTE", content: "Forbidden note" } })).status()).toBe(403);
    } else {
      await expect(page.getByRole("button", { name: "保存阶段" })).toBeVisible();
      if (actor === "manager") {
        await expect(page.getByRole("combobox", { name: "负责人", exact: true })).toBeVisible();
        const options = await page.getByRole("combobox", { name: "负责人", exact: true }).locator("option").allTextContents();
        expect(options).toContain("E2E colleague");
        expect(options).not.toContain("E2E outside");
      }
    }
    if (actor !== "manager") {
      expect((await page.request.post("/api/admin/inquiries", { headers: origin, data: { name: "Forbidden", email: `${prefix}-forbidden@example.com`, message: "Forbidden create" } })).status()).toBe(403);
      expect((await page.request.post("/api/admin/customers", { headers: origin, data: { fullName: "Forbidden", email: `${prefix}-forbidden@example.com` } })).status()).toBe(403);
    }
  });
}

// Catches lost optimistic concurrency, missing stage history and revoked self access after reassignment.
test("real stale save shows 409 and preserves the winner, then reassignment revokes sales access", async ({ page, browser }) => {
  await login(page, "admin");
  const stale = await page.context().newPage();
  await stale.goto(`/admin/inquiries/${ownLead}`);
  await page.goto(`/admin/leads/${ownLead}`);
  await page.getByRole("combobox", { name: "销售阶段", exact: true }).selectOption("CONTACTED");
  const committed = page.waitForResponse((response) => response.request().method() === "PATCH" && response.url().endsWith(`/inquiries/${ownLead}`));
  await page.getByRole("button", { name: "保存阶段" }).click();
  expect((await committed).status()).toBe(200);
  await stale.getByRole("combobox", { name: "销售阶段", exact: true }).selectOption("QUOTATION_SENT");
  const conflict = stale.waitForResponse((response) => response.status() === 409);
  await stale.getByRole("button", { name: "保存阶段" }).click();
  expect(await (await conflict).json()).toMatchObject({ code: "VERSION_CONFLICT" });
  await expect(stale.getByRole("alert").filter({ hasText: "版本冲突" })).toBeVisible();
  await expect(stale.getByRole("button", { name: "保存阶段" })).toBeDisabled();
  await stale.getByRole("button", { name: "重新加载" }).click();
  await expect(stale.getByRole("combobox", { name: "销售阶段", exact: true })).toHaveValue("CONTACTED");
  const detail = await (await page.request.get(`/api/admin/leads/${ownLead}`)).json();
  expect(detail).toMatchObject({ status: "CONTACTED", stage: { code: "CONTACTED" }, version: 2 });
  const db = await database();
  try { expect(await db.leadStageHistory.count({ where: { leadId: ownLead } })).toBe(1); } finally { await db.$disconnect(); }
  const salesContext = await browser.newContext();
  try {
    const salesPage = await salesContext.newPage();
    await login(salesPage, "sales");
    await salesPage.goto(`/admin/inquiries/${ownLead}`);
    await salesPage.getByLabel("备注内容").fill("Buyer confirmed voltage and delivery port.");
    await salesPage.getByRole("button", { name: "添加基础备注" }).click();
    await expect(salesPage.getByText("Buyer confirmed voltage and delivery port.", { exact: true })).toBeVisible();
    const latest = await (await page.request.get(`/api/admin/inquiries/${ownLead}`)).json();
    expect((await page.request.patch(`/api/admin/inquiries/${ownLead}`, { headers: origin, data: { version: latest.version, action: "assign", assigneeId: actorId("outside") } })).status()).toBe(200);
    expect((await salesPage.request.get(`/api/admin/inquiries/${ownLead}`)).status()).toBe(403);
    await salesPage.goto("/admin/inquiries?query=E2E%20Own%20Buyer");
    await expect(salesPage.getByRole("row", { name: /E2E Own Buyer/ })).toHaveCount(0);
    const scoped = await salesPage.request.get(`/api/admin/customers/${customerId}`);
    expect(scoped.status()).toBe(404);
  } finally { await salesContext.close(); await stale.close(); }
});

// Regression: existing customer selections must reuse both IDs and never create another Contact.
test("existing customer selection creates two inquiries and blocks hidden preselection", async ({ page }) => {
  await login(page, "admin");
  const created = await page.request.post("/api/admin/customers", { headers: origin, data: {
    fullName: "E2E Reused Customer", email: `${prefix}-reused@example.com`, company: { name: "E2E Reused Company" },
  } });
  expect(created.status()).toBe(201);
  const customer = (await created.json()).customer;
  const db = await database();
  try {
    const before = await db.contact.count();
    for (const number of [1, 2]) {
      await page.goto(`/admin/customers/${customer.id}`);
      await page.getByRole("link", { name: "新建询盘", exact: true }).click();
      await expect(page.getByLabel("关联已有客户")).toHaveValue(customer.id);
      await expect(page.getByLabel("关联已有公司")).toHaveValue(customer.company.id);
      await expect(page.getByRole("textbox", { name: "客户姓名", exact: true })).toHaveValue("E2E Reused Customer");
      await page.getByRole("textbox", { name: "需求描述", exact: true }).fill(`Additional machine ${number}`);
      await page.getByRole("combobox", { name: "负责人", exact: true }).selectOption(actorId("sales"));
      const submission = page.waitForRequest((request) => request.method() === "POST" && request.url().endsWith("/api/admin/inquiries"));
      await page.getByRole("button", { name: "创建询盘", exact: true }).click();
      const body = (await submission).postDataJSON();
      expect(body).toMatchObject({ contactId: customer.id, companyId: customer.company.id });
      expect(body).not.toHaveProperty("contact");
      expect(body).not.toHaveProperty("company");
      await expect(page).toHaveURL(/\/admin\/leads\/[^/]+$/);
    }
    expect(await db.contact.count()).toBe(before);
    expect(await db.lead.count({ where: { contactId: customer.id, companyId: customer.company.id } })).toBe(2);
    const hiddenResponse = await page.request.post("/api/admin/customers", { headers: origin, data: { fullName: "E2E Hidden Customer", email: `${prefix}-hidden@example.com` } });
    expect(hiddenResponse.status()).toBe(201);
    const hiddenId = (await hiddenResponse.json()).customer.id;
    await page.context().clearCookies();
    await login(page, "manager");
    await page.goto("/admin/inquiries/new");
    await page.getByLabel("搜索已有客户或公司").fill("E2E Hidden Customer");
    await page.getByRole("button", { name: "查询已有客户", exact: true }).click();
    await expect(page.getByRole("option", { name: /E2E Hidden Customer/ })).toHaveCount(0);
    const options = await page.request.get(`/api/admin/customers/inquiry-options?contactId=${hiddenId}`);
    expect(options.status()).toBe(404);
    await page.goto(`/admin/inquiries/new?contactId=${hiddenId}`);
    await expect(page.getByRole("button", { name: "创建询盘", exact: true })).toHaveCount(0);
    await expect(page.getByText("E2E Hidden Customer", { exact: true })).toHaveCount(0);
  } finally { await db.$disconnect(); }
});

// Regression: compatibility controls retain versions, clear dates, expose quarantine and recover explicitly.
test("detail follow-up and quarantine actions preserve versions and recover conflicts", async ({ page }) => {
  await login(page, "admin");
  const response = await page.request.post("/api/admin/inquiries", { headers: origin, data: {
    name: "E2E Compatibility Buyer", email: `${prefix}-compatibility@example.com`, message: "Compatibility controls",
  } });
  expect(response.status()).toBe(201);
  const id = (await response.json()).inquiry.id;
  const detail = async () => (await page.request.get(`/api/admin/inquiries/${id}`)).json();
  await page.goto(`/admin/inquiries/${id}`);
  const localTime = "2031-02-03T14:30";
  const utcTime = await page.evaluate((value) => new Date(value).toISOString(), localTime);
  await page.getByLabel("下次跟进时间（本地时间）").fill(localTime);
  await page.getByRole("button", { name: "保存跟进时间", exact: true }).click();
  await expect.poll(async () => (await detail()).nextFollowUpAt).toBe(utcTime);
  await expect(page.getByRole("button", { name: "清除跟进时间", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "清除跟进时间", exact: true }).click();
  await expect.poll(async () => (await detail()).nextFollowUpAt).toBeNull();
  await expect(page.getByLabel("下次跟进时间（本地时间）")).toHaveValue("");
  await page.getByLabel("销售阶段").selectOption("REQUIREMENT_CONFIRMED");
  await page.getByRole("button", { name: "保存阶段", exact: true }).click();
  await expect.poll(async () => (await detail()).stage.code).toBe("REQUIREMENT_CONFIRMED");
  await expect(page.getByRole("button", { name: "标记垃圾询盘", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "标记垃圾询盘", exact: true }).click();
  await expect(page.getByText("垃圾询盘（已隔离）", { exact: true })).toBeVisible();
  await expect(page.getByLabel("销售阶段")).toHaveCount(0);
  const quarantined = await detail();
  expect(quarantined).toMatchObject({ status: "SPAM", stage: { code: "REQUIREMENT_CONFIRMED" }, version: 5 });
  expect((await page.request.patch(`/api/admin/inquiries/${id}`, { headers: origin, data: { version: quarantined.version, nextFollowUpAt: null } })).status()).toBe(200);
  await page.getByRole("button", { name: "恢复询盘", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "版本冲突" })).toContainText("版本冲突");
  await expect(page.getByRole("button", { name: "恢复询盘", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "重新加载", exact: true }).click();
  await expect(page.getByRole("button", { name: "恢复询盘", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "恢复询盘", exact: true }).click();
  await expect(page.getByText("垃圾询盘（已隔离）", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("销售阶段")).toHaveValue("REQUIREMENT_CONFIRMED");
  expect(await detail()).toMatchObject({ status: "CONTACTED", version: 7 });
});
