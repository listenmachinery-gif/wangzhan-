import { randomBytes } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { chromium } from "@playwright/test";
import { hash } from "argon2";

const baseUrl = process.env.PREVIEW_BASE_URL;
const connectionString = process.env.DATABASE_URL;
if (process.env.VERCEL_ENV !== "preview") throw new Error("Preview verification requires VERCEL_ENV=preview.");
if (!baseUrl || !/^https:\/\/[^/]+\.vercel\.app$/.test(baseUrl)) throw new Error("A Vercel Preview URL is required.");
if (!connectionString) throw new Error("Preview DATABASE_URL is required.");
const verifiedBaseUrl = baseUrl;
const verifiedConnectionString = connectionString;

async function main() {
  const database = new PrismaClient({ adapter: new PrismaPg({ connectionString: verifiedConnectionString }) });
  const browser = await chromium.launch();
  const suffix = randomBytes(6).toString("hex");
  const email = `preview-acceptance-${suffix}@example.com`;
  const password = randomBytes(24).toString("base64url");
  const chatEmail = `preview-chat-${suffix}@example.com`;
  let userId: string | undefined;

  try {
  const role = await database.role.upsert({ where: { key: "ADMIN" }, update: {}, create: { key: "ADMIN", name: "Admin" } });
  const user = await database.user.create({ data: { email, name: "Preview Acceptance", passwordHash: await hash(password) } });
  userId = user.id;
  await database.userRole.create({ data: { userId: user.id, roleId: role.id } });

  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const internalFailures: string[] = [];
  page.on("requestfailed", (request) => {
    const errorText = request.failure()?.errorText ?? "unknown";
    if (request.url().startsWith(verifiedBaseUrl) && errorText !== "net::ERR_ABORTED") {
      internalFailures.push(`${new URL(request.url()).pathname}:${errorText}`);
    }
  });

  for (const path of ["/", "/products", "/admin/login"]) {
    const response = await page.request.get(`${verifiedBaseUrl}${path}`);
    if (!response.ok()) throw new Error(`${path} returned ${response.status()}`);
  }
  for (const path of ["/api/admin/analytics/reports", "/api/admin/chat/conversations"]) {
    const response = await page.request.get(`${verifiedBaseUrl}${path}`);
    if (response.status() !== 401) throw new Error(`${path} must reject unauthenticated requests.`);
  }

  await page.goto(`${verifiedBaseUrl}/products`, { waitUntil: "networkidle" });
  const detailHref = await page.locator('a[href^="/products/"]:not([href^="/products/series/"])').first().getAttribute("href");
  if (!detailHref) throw new Error("No real product detail link was found in Preview.");
  const detailResponse = await page.request.get(`${verifiedBaseUrl}${detailHref}`);
  if (!detailResponse.ok()) throw new Error(`Product detail returned ${detailResponse.status()}`);

  await page.goto(`${verifiedBaseUrl}/admin/login`);
  await page.getByLabel("管理员邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录 ZYRON CMS" }).click();
  await page.waitForURL(`${verifiedBaseUrl}/admin`);
  for (const [path, heading] of [["/admin/analytics", "数据分析"], ["/admin/analytics/reports", "外贸增长报告"], ["/admin/analytics/visitors", "访客分析"], ["/admin/chat", "在线客服"]] as const) {
    await page.goto(`${verifiedBaseUrl}${path}`);
    await page.getByRole("heading", { name: heading }).waitFor();
  }
  if (internalFailures.length > 0) throw new Error(`Internal static/API requests failed: ${internalFailures.join(", ")}`);
  await context.close();

  const publicContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const publicPage = await publicContext.newPage();
  await publicPage.goto(verifiedBaseUrl);
  const reject = publicPage.getByRole("button", { name: "Reject analytics" });
  if (await reject.isVisible()) await reject.click();
  await publicPage.getByRole("button", { name: "Chat With Us" }).click();
  await publicPage.getByLabel("Work email (optional)").fill(chatEmail);
  await publicPage.getByRole("button", { name: "Start conversation" }).click();
  await publicPage.getByText("Messages are saved · Live updates unavailable").waitFor();
  await publicPage.getByRole("textbox", { name: "Message", exact: true }).fill("Preview acceptance inquiry");
  await publicPage.getByRole("button", { name: "Send message" }).click();
  await publicPage.getByText("Preview acceptance inquiry").waitFor();
  await publicPage.reload();
  await publicPage.getByRole("button", { name: "Chat With Us" }).click();
  await publicPage.getByText("Preview acceptance inquiry").waitFor();
  await publicContext.close();

  console.log(JSON.stringify({
    status: "PASS",
    homepage: 200,
    products: 200,
    productDetail: detailHref,
    adminLogin: "PASS",
    analytics: "PASS",
    visitors: "PASS",
    adminChat: "PASS",
    publicChatFallback: "PASS",
    mobileViewport: "390x844",
    unauthorizedAdminApis: 401,
  }));
  } finally {
    const conversations = await database.chatConversation.findMany({ where: { contactEmail: chatEmail }, select: { visitorId: true } });
    if (conversations.length > 0) await database.analyticsVisitor.deleteMany({ where: { id: { in: conversations.map(({ visitorId }) => visitorId) } } });
    if (userId) {
      await database.auditLog.updateMany({ where: { actorId: userId }, data: { actorId: null } });
      await database.session.deleteMany({ where: { userId } });
      await database.userRole.deleteMany({ where: { userId } });
      await database.user.deleteMany({ where: { id: userId } });
    }
    await browser.close();
    await database.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Preview verification failed.");
  process.exitCode = 1;
});
