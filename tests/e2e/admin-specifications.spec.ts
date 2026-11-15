import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { expect, test } from "@playwright/test";

const email = "specifications-e2e@example.com";
const password = "e2e-specifications-password";
const productSlug = "e2e-specification-product";
const categorySlug = "e2e-specification-category";

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
    create: { email, name: "E2E Specification Editor", passwordHash: await hash(password) },
  });
  await db.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: role.id } }, update: {}, create: { userId: user.id, roleId: role.id } });
  const category = await db.productCategory.create({ data: { name: "E2E Specification Category", slug: categorySlug, status: "PUBLISHED", publishedAt: new Date() } });
  const product = await db.product.create({
    data: {
      categoryId: category.id,
      name: "E2E Specification Product",
      slug: productSlug,
      summary: "E2E specification product",
      status: "PUBLISHED",
      publishedAt: new Date(),
      sections: {
        create: {
          type: "TECHNICAL",
          position: 0,
          content: {
            eyebrow: "Technical parameters",
            title: "Model specifications",
            paragraphs: ["Verified model data."],
            columns: [{ key: "legacy-model", label: "Model" }],
            rows: [{ "legacy-model": "Pending" }],
          } as Prisma.InputJsonValue,
        },
      },
    },
  });
  await db.specificationTemplate.create({
    data: {
      categoryId: category.id,
      name: "E2E shearing parameters",
      fields: {
        create: [
          { name: "Rated model", valueType: "TEXT", position: 0 },
          { name: "Cutting width", unit: "mm", valueType: "NUMBER", position: 1 },
        ],
      },
    },
  });
  await db.auditLog.deleteMany({ where: { entityType: "Product", entityId: product.id } });
  await db.$disconnect();
});

test.afterAll(async () => {
  const db = database();
  const product = await db.product.findUnique({ where: { slug: productSlug }, select: { id: true } });
  if (product) {
    await db.auditLog.deleteMany({ where: { entityType: "Product", entityId: product.id } });
    await db.product.delete({ where: { id: product.id } });
  }
  const category = await db.productCategory.findUnique({ where: { slug: categorySlug }, select: { id: true } });
  if (category) {
    const templates = await db.specificationTemplate.findMany({ where: { categoryId: category.id }, select: { id: true } });
    await db.auditLog.deleteMany({ where: { entityType: "SpecificationTemplate", entityId: { in: templates.map(({ id }) => id) } } });
    await db.specificationTemplate.deleteMany({ where: { categoryId: category.id } });
    await db.productCategory.delete({ where: { id: category.id } });
  }
  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (user) {
    await db.auditLog.updateMany({ where: { actorId: user.id }, data: { actorId: null } });
    await db.session.deleteMany({ where: { userId: user.id } });
    await db.userRole.deleteMany({ where: { userId: user.id } });
    await db.user.delete({ where: { id: user.id } });
  }
  await db.$disconnect();
});

test("edits models, rejects a bad import, accepts a valid import, and updates the public table", async ({ page }) => {
  await page.goto("/admin/login");
  const unauthenticated = await page.evaluate(async () => (await fetch("/api/admin/specifications/templates", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  })).status);
  expect(unauthenticated).toBe(401);
  const untrusted = await page.request.post("/api/admin/specifications/templates", {
    headers: { origin: "https://attacker.test", "sec-fetch-site": "cross-site", "content-type": "application/json" },
    data: {},
  });
  expect(untrusted.status()).toBe(403);
  await page.getByLabel("管理员邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录 ZYRON CMS" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.getByRole("link", { name: "型号参数" }).click();
  await expect(page.getByRole("heading", { name: "型号参数管理" })).toBeVisible();
  await page.getByLabel("模板名称").fill("ZZ E2E secondary template");
  await page.getByLabel("适用分类").selectOption({ label: "E2E Specification Category" });
  await page.getByLabel("字段名称 1").fill("Model code");
  await page.getByRole("button", { name: "创建参数模板" }).click();
  await expect(page.getByRole("status")).toContainText("模板已创建");

  const db = database();
  const product = await db.product.findUniqueOrThrow({ where: { slug: productSlug }, select: { id: true } });
  await db.$disconnect();
  await page.goto(`/admin/products/${product.id}/specifications`);
  await expect(page.getByRole("heading", { name: "型号参数" })).toBeVisible();
  await page.getByRole("button", { name: "新增型号" }).click();
  await page.getByLabel("型号名称 1").fill("Q11G-2x650");
  await page.getByLabel("Rated model 1").fill("Q11G-2x650");
  await page.getByLabel("Cutting width 1").fill("650");
  await page.getByRole("button", { name: "保存型号参数" }).click();
  await expect(page.getByRole("status")).toContainText("已保存");

  await page.getByLabel("导入参数文件").setInputFiles({
    name: "invalid.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("Model,SKU,Active,Rated model,Cutting width [mm]\nQ11G-bad,,true,Q11G-bad,not-a-number"),
  });
  await page.getByRole("button", { name: "导入并校验" }).click();
  await expect(page.getByText("第 2 行")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Numeric value required.")).toBeVisible();

  await page.getByLabel("导入参数文件").setInputFiles({
    name: "valid.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("Model,SKU,Active,Rated model,Cutting width [mm]\nQ11G-2x800,Q11G-2X800,true,Q11G-2x800,800"),
  });
  await page.getByRole("button", { name: "导入并校验" }).click();
  await expect(page.getByRole("status")).toContainText("成功导入 1 行");

  await page.goto(`/products/${productSlug}`);
  const technical = page.locator("[data-product-module='TECHNICAL']");
  await expect(technical.getByRole("cell", { name: "Q11G-2x800", exact: true }).first()).toBeVisible();
  await expect(technical.locator("td").filter({ hasText: /^Q11G-2X800$/ }).first()).toBeVisible();
  await expect(technical.getByRole("cell", { name: "800", exact: true })).toBeVisible();
});
