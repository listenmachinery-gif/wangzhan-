import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";

const email = "realtime-resilience-e2e@example.com";
const message = "HTTP fallback must preserve this mobile inquiry.";

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || !new URL(connectionString).pathname.replace(/^\//, "").endsWith("_test")) {
    throw new Error("Realtime resilience E2E requires the isolated _test database.");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

test.afterAll(async () => {
  const db = database();
  const conversations = await db.chatConversation.findMany({ where: { contactEmail: email }, select: { visitorId: true } });
  await db.analyticsVisitor.deleteMany({ where: { id: { in: conversations.map(({ visitorId }) => visitorId) } } });
  await db.$disconnect();
});

test("keeps mobile chat durable and usable when realtime token delivery is unavailable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/chat/token", async (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ code: "REALTIME_UNAVAILABLE" }) }));
  await page.goto("/");
  await page.getByRole("button", { name: "Reject analytics" }).click();
  await page.getByRole("button", { name: "Chat With Us" }).click();
  await page.getByLabel("Work email (optional)").fill(email);
  await page.getByRole("button", { name: "Start conversation" }).click();

  await expect(page.getByText("Messages are saved · Live updates unavailable")).toBeVisible();
  const dialog = page.getByRole("dialog", { name: "Chat with ZYRON" });
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box?.width).toBeLessThanOrEqual(390);
  expect(box?.height).toBeLessThanOrEqual(844);

  await page.getByRole("textbox", { name: "Message", exact: true }).fill(message);
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText(message)).toHaveCount(1);
  await page.reload();
  await page.getByRole("button", { name: "Chat With Us" }).click();
  await expect(page.getByText(message)).toBeVisible();

  const db = database();
  expect(await db.chatMessage.count({ where: { conversation: { contactEmail: email }, body: message } })).toBe(1);
  await db.$disconnect();
});
