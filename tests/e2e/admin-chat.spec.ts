import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { expect, test } from "@playwright/test";

const adminEmail = "chat-admin-e2e@example.com";
const agentEmail = "chat-agent-e2e@example.com";
const password = "chat-admin-e2e-password";
const visitorId = "chat-admin-e2e-visitor";
const conversationId = "chat-admin-e2e-conversation";

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required for E2E tests.");
  if (!new URL(connectionString).pathname.replace(/^\//, "").endsWith("_test")) throw new Error("Admin chat E2E requires the protected test database.");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

test.beforeAll(async () => {
  const db = database();
  await db.lead.deleteMany({ where: { email: "buyer-e2e@example.com" } });
  const [adminRole, agentRole] = await Promise.all([
    db.role.upsert({ where: { key: "ADMIN" }, update: {}, create: { key: "ADMIN", name: "Admin" } }),
    db.role.upsert({ where: { key: "SUPPORT_AGENT" }, update: {}, create: { key: "SUPPORT_AGENT", name: "Support Agent" } }),
  ]);
  const [admin, agent] = await Promise.all([
    db.user.upsert({ where: { email: adminEmail }, update: { passwordHash: await hash(password), isActive: true }, create: { email: adminEmail, name: "Chat Admin", passwordHash: await hash(password) } }),
    db.user.upsert({ where: { email: agentEmail }, update: { isActive: true }, create: { email: agentEmail, name: "Export Support", passwordHash: "unused" } }),
  ]);
  await Promise.all([
    db.userRole.upsert({ where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } }, update: {}, create: { userId: admin.id, roleId: adminRole.id } }),
    db.userRole.upsert({ where: { userId_roleId: { userId: agent.id, roleId: agentRole.id } }, update: {}, create: { userId: agent.id, roleId: agentRole.id } }),
  ]);
  await db.analyticsVisitor.upsert({
    where: { id: visitorId },
    update: {},
    create: { id: visitorId, anonymousId: "chat-admin-e2e-anonymous", environment: "DEVELOPMENT", firstSeenAt: new Date(), lastSeenAt: new Date(), countryCode: "US", deviceType: "desktop" },
  });
  await db.chatConversation.upsert({
    where: { id: conversationId },
    update: { status: "OPEN", contactName: "E2E Machinery Buyer", contactEmail: "buyer-e2e@example.com", agentUnreadCount: 2 },
    create: { id: conversationId, visitorId, environment: "DEVELOPMENT", status: "OPEN", contactName: "E2E Machinery Buyer", contactEmail: "buyer-e2e@example.com", agentUnreadCount: 2, lastMessageAt: new Date() },
  });
  await db.chatMessage.upsert({
    where: { conversationId_clientMessageId: { conversationId, clientMessageId: "e2e-visitor-message" } },
    update: {},
    create: { conversationId, senderType: "VISITOR", type: "TEXT", clientMessageId: "e2e-visitor-message", body: "Please quote a 2 mm electric shear." },
  });
  await db.$disconnect();
});

test.afterAll(async () => {
  const db = database();
  await db.analyticsVisitor.deleteMany({ where: { id: visitorId } });
  const users = await db.user.findMany({ where: { email: { in: [adminEmail, agentEmail] } }, select: { id: true } });
  await db.session.deleteMany({ where: { userId: { in: users.map(({ id }) => id) } } });
  await db.userRole.deleteMany({ where: { userId: { in: users.map(({ id }) => id) } } });
  await db.user.deleteMany({ where: { id: { in: users.map(({ id }) => id) } } });
  await db.lead.deleteMany({ where: { email: "buyer-e2e@example.com" } });
  await db.$disconnect();
});

test("admin assigns, replies, and closes a live chat conversation", async ({ page }) => {
  expect((await page.request.get("/api/admin/chat/conversations")).status()).toBe(401);
  await page.goto("/admin/login");
  await page.getByLabel("管理员邮箱").fill(adminEmail);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录 ZYRON CMS" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/chat");

  await expect(page.getByRole("heading", { name: "在线客服" })).toBeVisible();
  await page.getByRole("button", { name: /E2E Machinery Buyer/ }).click();
  await expect(page.getByText("Please quote a 2 mm electric shear.", { exact: true })).toBeVisible();
  await page.getByLabel("分配客服").selectOption({ label: "Export Support" });
  await expect(page.getByText("Export Support", { exact: true }).first()).toBeVisible();

  await page.getByRole("textbox", { name: "Message", exact: true }).fill("We can prepare the quotation today.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("We can prepare the quotation today.")).toHaveCount(1);
  await page.getByRole("button", { name: "创建或关联询盘客户" }).click();
  await expect(page.getByRole("link", { name: /E2E Machinery Buyer/ })).toBeVisible();
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await expect(page.getByText("该会话已关闭，重新打开后才能回复。")).toBeVisible();

  const db = database();
  expect(await db.chatAssignment.count({ where: { conversationId, endedAt: null } })).toBe(1);
  expect(await db.chatMessage.count({ where: { conversationId, body: "We can prepare the quotation today." } })).toBe(1);
  expect(await db.lead.count({ where: { email: "buyer-e2e@example.com" } })).toBe(1);
  expect((await db.chatConversation.findUniqueOrThrow({ where: { id: conversationId } })).status).toBe("CLOSED");
  await db.$disconnect();
});
