import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { expect, test } from "@playwright/test";

const email = "seo-admin-e2e@example.com";
const password = "e2e-seo-admin-password";
const slug = "e2e-seo-machine";
const pathname = `/products/${slug}`;

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required.");
  if (!new URL(connectionString).pathname.replace(/^\//, "").endsWith("_test")) throw new Error("SEO E2E requires the protected test database.");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

test.beforeAll(async () => {
  const db = database();
  await db.seoRecord.deleteMany({ where: { pathname } });
  await db.product.deleteMany({ where: { slug } });
  await db.productCategory.deleteMany({ where: { slug: "e2e-seo-category" } });
  const role = await db.role.upsert({ where: { key: "ADMIN" }, update: {}, create: { key: "ADMIN", name: "Admin" } });
  const user = await db.user.upsert({ where: { email }, update: { passwordHash: await hash(password), isActive: true }, create: { email, name: "E2E SEO Admin", passwordHash: await hash(password) } });
  await db.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: role.id } }, update: {}, create: { userId: user.id, roleId: role.id } });
  const category = await db.productCategory.create({ data: { name: "E2E SEO Category", slug: "e2e-seo-category", status: "PUBLISHED", publishedAt: new Date() } });
  const product = await db.product.create({ data: { categoryId: category.id, name: "E2E SEO Machine", slug, summary: "Original fallback product summary.", status: "PUBLISHED", publishedAt: new Date(), sections: { create: { type: "HERO", position: 0, content: { eyebrow: "SEO", title: "E2E SEO Machine", subtitle: "Visible machine", images: { desktop: "/products/product-center-hero.png", alt: "E2E SEO Machine" }, primaryCta: { label: "Request", href: "/contact" } } as Prisma.InputJsonValue } } } });
  await db.seoRecord.create({ data: { pathname, productId: product.id, title: "Draft SEO title", description: "Draft SEO description for the browser workflow.", canonicalUrl: pathname } });
  await db.$disconnect();
});

test.afterAll(async () => {
  const db = database();
  const seo = await db.seoRecord.findUnique({ where: { pathname }, select: { id: true } });
  if (seo) await db.auditLog.deleteMany({ where: { entityType: "SeoRecord", entityId: seo.id } });
  await db.seoRecord.deleteMany({ where: { pathname } });
  const product = await db.product.findUnique({ where: { slug }, select: { id: true } });
  if (product) await db.product.delete({ where: { id: product.id } });
  await db.productCategory.deleteMany({ where: { slug: "e2e-seo-category" } });
  await db.$disconnect();
});

test("edits and publishes metadata without changing the product URL", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("管理员邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录 ZYRON CMS" }).click();
  await page.getByRole("link", { name: "SEO 管理" }).click();
  await page.getByRole("row", { name: new RegExp(pathname) }).getByRole("link", { name: "编辑" }).click();
  await page.getByLabel("SEO 标题").fill("Published E2E SEO Machine | ZYRON");
  await page.getByLabel("SEO 描述").fill("Published database metadata visible on the unchanged product URL.");
  await page.getByLabel("Canonical URL").fill(pathname);
  await page.getByRole("button", { name: "保存草稿" }).click();
  await expect(page.getByRole("status")).toContainText("已保存");
  await page.getByRole("button", { name: "发布 SEO" }).click();
  await expect(page.getByRole("status")).toContainText("已发布到前台");

  await page.goto(pathname);
  await expect(page).toHaveURL(new RegExp(`${pathname}$`));
  await expect(page).toHaveTitle("Published E2E SEO Machine | ZYRON");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", "Published database metadata visible on the unchanged product URL.");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://www.zyroncnc.com${pathname}`);
});
