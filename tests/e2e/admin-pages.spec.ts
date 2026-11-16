import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { expect, test } from "@playwright/test";

import { defaultHomepageDocument } from "../../lib/page-builder/default-homepage";

const email = "pages-e2e@example.com";
const password = "e2e-pages-secure-password";
const pageName = "E2E Managed Homepage";

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString)
    throw new Error("DATABASE_URL is required for E2E tests.");
  if (
    !new URL(connectionString).pathname.replace(/^\//, "").endsWith("_test")
  ) {
    throw new Error(
      "Page Builder E2E cleanup is restricted to a database whose name ends with _test.",
    );
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

test.beforeAll(async () => {
  const db = database();
  const role = await db.role.upsert({
    where: { key: "CONTENT_EDITOR" },
    update: {},
    create: { key: "CONTENT_EDITOR", name: "Content Editor" },
  });
  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash: await hash(password), isActive: true },
    create: {
      email,
      name: "E2E Page Editor",
      passwordHash: await hash(password),
    },
  });
  await db.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    update: {},
    create: { userId: user.id, roleId: role.id },
  });
  await db.auditLog.deleteMany({ where: { entityType: "SitePage" } });
  await db.sitePage.deleteMany({ where: { slug: "home" } });
  const page = await db.sitePage.create({
    data: {
      name: pageName,
      slug: "home",
      pageType: "HOME",
      draftContent: defaultHomepageDocument as unknown as Prisma.InputJsonValue,
    },
  });
  await db.pageVersion.create({
    data: {
      pageId: page.id,
      version: 1,
      snapshot: defaultHomepageDocument as unknown as Prisma.InputJsonValue,
      action: "CREATE",
      createdById: user.id,
    },
  });
  await db.$disconnect();
});

test.afterAll(async () => {
  const db = database();
  const pages = await db.sitePage.findMany({
    where: { slug: "home" },
    select: { id: true },
  });
  await db.auditLog.deleteMany({
    where: {
      entityType: "SitePage",
      entityId: { in: pages.map(({ id }) => id) },
    },
  });
  await db.sitePage.deleteMany({
    where: { id: { in: pages.map(({ id }) => id) } },
  });
  await db.$disconnect();
});

test("edits, previews, publishes, and restores a homepage version", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await page.getByLabel("管理员邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录 ZYRON CMS" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.getByRole("link", { name: "页面设计" }).click();
  await page
    .getByRole("row")
    .filter({ hasText: pageName })
    .getByRole("link", { name: "打开设计器" })
    .click();
  await expect(page.getByRole("heading", { name: pageName })).toBeVisible();

  const heading = page.getByRole("textbox", { name: "标题", exact: true });
  await heading.fill("E2E published company strength");
  await expect(page.getByTestId("page-canvas")).toContainText(
    "E2E published company strength",
  );
  await page.getByRole("button", { name: "手机预览" }).click();
  await expect(page.getByTestId("page-canvas")).toHaveAttribute(
    "data-device",
    "mobile",
  );
  await page.getByRole("button", { name: "保存草稿" }).click();
  await expect(page.getByText(/草稿已保存|已自动保存/)).toBeVisible();
  await page.getByRole("button", { name: "发布", exact: true }).click();
  await expect(page.getByText("已发布到前台")).toBeVisible();

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "E2E published company strength" }),
  ).toBeVisible();

  await page.goto("/admin/pages");
  await page
    .getByRole("row")
    .filter({ hasText: pageName })
    .getByRole("link", { name: "打开设计器" })
    .click();
  await page
    .getByRole("textbox", { name: "标题", exact: true })
    .fill("E2E second published company strength");
  await page.getByRole("button", { name: "发布", exact: true }).click();
  await expect(page.getByText("已发布到前台")).toBeVisible();
  await page.getByRole("button", { name: "历史" }).click();
  const saveVersion = page
    .getByRole("article")
    .filter({ hasText: "SAVE" })
    .last();
  await saveVersion.getByRole("button", { name: "恢复为草稿" }).click();
  await expect(page.getByText(/已恢复 v\d+ 为新草稿/)).toBeVisible();

  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "E2E second published company strength",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("E2E published company strength", { exact: true }),
  ).toHaveCount(0);
});
