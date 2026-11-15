import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { expect, test } from "@playwright/test";

const email = "product-editor-e2e@example.com";
const password = "e2e-product-editor-password";
const salesEmail = "product-sales-e2e@example.com";
const salesPassword = "e2e-product-sales-password";
const productSlug = "e2e-admin-product";
const categorySlug = "e2e-admin-category";

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required for E2E tests.");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

test.beforeAll(async () => {
  const db = database();
  await db.product.deleteMany({ where: { slug: productSlug } });
  await db.productCategory.deleteMany({ where: { slug: categorySlug } });
  const role = await db.role.upsert({ where: { key: "PRODUCT_EDITOR" }, update: {}, create: { key: "PRODUCT_EDITOR", name: "Product Editor" } });
  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash: await hash(password), isActive: true },
    create: { email, name: "E2E Product Editor", passwordHash: await hash(password) },
  });
  await db.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: role.id } }, update: {}, create: { userId: user.id, roleId: role.id } });
  const salesRole = await db.role.upsert({ where: { key: "SALES" }, update: {}, create: { key: "SALES", name: "Sales" } });
  const salesUser = await db.user.upsert({
    where: { email: salesEmail },
    update: { passwordHash: await hash(salesPassword), isActive: true },
    create: { email: salesEmail, name: "E2E Product Sales", passwordHash: await hash(salesPassword) },
  });
  await db.userRole.upsert({ where: { userId_roleId: { userId: salesUser.id, roleId: salesRole.id } }, update: {}, create: { userId: salesUser.id, roleId: salesRole.id } });
  const category = await db.productCategory.create({ data: { name: "E2E Admin Category", slug: categorySlug, summary: "E2E", status: "PUBLISHED", publishedAt: new Date() } });
  await db.product.create({
    data: {
      categoryId: category.id,
      name: "E2E Admin Product",
      slug: productSlug,
      summary: "E2E draft product",
      sections: {
        create: [
          {
            type: "HERO",
            position: 0,
            content: {
              eyebrow: "E2E",
              title: "E2E Admin Product",
              subtitle: "Draft content",
              images: { desktop: "/products/product-center-hero.png", alt: "E2E admin product" },
              primaryCta: { label: "Request a Quote", href: "/contact" },
            } as Prisma.InputJsonValue,
          },
          {
            type: "OVERVIEW",
            position: 1,
            content: { eyebrow: "Overview", title: "Draft Overview", paragraphs: ["Draft overview content."] } as Prisma.InputJsonValue,
          },
        ],
      },
    },
  });
  await db.$disconnect();
});

test.afterAll(async () => {
  const db = database();
  const product = await db.product.findUnique({ where: { slug: productSlug }, select: { id: true } });
  if (product) {
    const sectionIds = (await db.productSection.findMany({ where: { productId: product.id }, select: { id: true } })).map(({ id }) => id);
    await db.mediaReference.deleteMany({ where: { entityType: "ProductSection", entityId: { in: sectionIds } } });
    await db.auditLog.deleteMany({ where: { entityType: "Product", entityId: product.id } });
    await db.product.delete({ where: { id: product.id } });
  }
  await db.productCategory.deleteMany({ where: { slug: categorySlug } });
  const users = await db.user.findMany({ where: { email: { in: [email, salesEmail] } }, select: { id: true } });
  for (const user of users) {
    await db.auditLog.updateMany({ where: { actorId: user.id }, data: { actorId: null } });
    await db.session.deleteMany({ where: { userId: user.id } });
    await db.userRole.deleteMany({ where: { userId: user.id } });
    await db.user.delete({ where: { id: user.id } });
  }
  await db.$disconnect();
});

test("edits, validates, reorders, hides, publishes, and updates the unchanged public URL", async ({ page, browser }) => {
  await page.goto("/admin/login");
  const unauthenticated = await page.evaluate(async () => (await fetch("/api/admin/products", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  })).status);
  expect(unauthenticated).toBe(401);
  const untrusted = await page.request.post("/api/admin/products", {
    headers: { origin: "https://attacker.test", "sec-fetch-site": "cross-site", "content-type": "application/json" },
    data: {},
  });
  expect(untrusted.status()).toBe(403);
  const salesContext = await browser.newContext();
  const salesPage = await salesContext.newPage();
  await salesPage.goto("/admin/login");
  await salesPage.getByLabel("管理员邮箱").fill(salesEmail);
  await salesPage.getByLabel("密码").fill(salesPassword);
  await salesPage.getByRole("button", { name: "登录 ZYRON CMS" }).click();
  await expect(salesPage).toHaveURL(/\/admin$/);
  await expect(salesPage.getByRole("heading", { name: "数据总览" })).toBeVisible();
  const forbidden = await salesPage.evaluate(async () => (await fetch("/api/admin/products", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  })).status);
  expect(forbidden).toBe(403);
  await salesContext.close();
  await page.getByLabel("管理员邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录 ZYRON CMS" }).click();
  await page.getByRole("link", { name: "产品管理" }).click();
  await expect(page.getByRole("heading", { name: "产品管理" })).toBeVisible();
  await page.getByRole("row", { name: /E2E Admin Product/ }).getByRole("link", { name: "编辑" }).click();

  const hero = page.locator("[data-module-editor='HERO']");
  const overview = page.locator("[data-module-editor='OVERVIEW']");
  await hero.getByLabel("Title", { exact: true }).fill("");
  await page.getByRole("button", { name: "保存模块顺序与内容" }).click();
  await expect(page.getByRole("status")).toContainText("Too small");

  await hero.getByLabel("Title", { exact: true }).fill("Published E2E Machine");
  await overview.getByRole("checkbox", { name: "显示" }).uncheck();
  await overview.getByRole("button", { name: "上移模块" }).click();
  await page.getByRole("button", { name: "保存模块顺序与内容" }).click();
  await expect(page.getByRole("status")).toContainText("模块已保存");
  await page.getByRole("button", { name: "发布到前台" }).click();
  await expect(page.getByRole("status")).toContainText("产品已发布");

  await page.goto(`/products/${productSlug}`);
  await expect(page).toHaveURL(new RegExp(`/products/${productSlug}$`));
  await expect(page.getByRole("heading", { level: 1, name: "Published E2E Machine" })).toBeVisible();
  await expect(page.locator("[data-product-module]" )).toHaveCount(1);
});
