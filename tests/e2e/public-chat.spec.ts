import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";

const contactEmail = "public-chat-e2e@example.com";

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required for E2E tests.");
  if (!new URL(connectionString).pathname.replace(/^\//, "").endsWith("_test")) throw new Error("Chat E2E requires the protected test database.");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

test.afterAll(async () => {
  const db = database();
  const conversations = await db.chatConversation.findMany({ where: { contactEmail }, select: { visitorId: true } });
  await db.analyticsVisitor.deleteMany({ where: { id: { in: conversations.map(({ visitorId }) => visitorId) } } });
  await db.$disconnect();
});

test("anonymous chat persists messages and survives a page refresh in HTTP fallback mode", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Reject analytics" }).click();
  await page.getByRole("button", { name: "Chat With Us" }).click();
  await page.getByLabel("Work email (optional)").fill(contactEmail);
  await page.getByRole("button", { name: "Start conversation" }).click();

  await expect(page.getByText("Messages are saved · Live updates unavailable")).toBeVisible();
  await page.getByRole("textbox", { name: "Message", exact: true }).fill("Please quote the compact electric shearing machine.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Please quote the compact electric shearing machine.")).toHaveCount(1);

  await page.reload();
  await page.getByRole("button", { name: "Chat With Us" }).click();
  await expect(page.getByText("Please quote the compact electric shearing machine.")).toBeVisible();
});
