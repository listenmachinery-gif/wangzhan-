import { pathToFileURL } from "node:url";

import type { PrismaClient } from "@prisma/client";

import { ROLES, type Principal, type RoleKey } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import type { PageDocument, PageNode } from "@/lib/page-builder/schema";
import { DEFAULT_PRODUCT_EXPLORER_CONTENT } from "@/lib/product-explorer/config";
import { parsePageDocument, PageService } from "@/lib/services/page-service";

const RELEASE_APPROVAL = "APPROVED_2026_11_27";

const requiredCategorySlugs = [
  "shearing-machines",
  "bending-machines",
  "laser-cutting-machines",
  "plate-rolling-machines",
  "press-machines",
  "rectangular-duct-production",
  "round-duct-production",
  "shredders",
] as const;

type CategoryRecord = { id: string; slug: string; name: string; position: number };
type PublishEnvironment = Record<string, string | undefined>;

function canonicalJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, canonicalJson(item)]));
  }
  return value;
}

function sameValue(left: unknown, right: unknown) {
  return JSON.stringify(canonicalJson(left)) === JSON.stringify(canonicalJson(right));
}

export function buildProductsExplorerDocument(
  categories: CategoryRecord[],
  existing: PageDocument,
): PageDocument {
  const ids = new Map(categories.map((category) => [category.slug, category.id]));
  const mappedCategories = DEFAULT_PRODUCT_EXPLORER_CONTENT.categories.map((slot, index) => {
    const requiredSlug = requiredCategorySlugs[index];
    const categoryId = ids.get(requiredSlug);
    if (!categoryId) throw new Error(`Missing required product category: ${requiredSlug}`);
    return { ...slot, categoryId, seriesHref: `/products/series/${requiredSlug}` };
  });
  const explorer: PageNode = {
    id: "products-interactive-explorer",
    type: "PRODUCT_EXPLORER",
    placement: "REPLACE_LEGACY",
    content: { ...DEFAULT_PRODUCT_EXPLORER_CONTENT, categories: mappedCategories },
  };
  const preserved = existing.nodes.filter((node) => node.type !== "PRODUCT_EXPLORER");
  return { schemaVersion: 1, renderMode: "REPLACE_LEGACY", nodes: [explorer, ...preserved] };
}

async function productionPrincipal(database: PrismaClient, email: string): Promise<Principal> {
  const user = await database.user.findUnique({
    where: { email },
    include: { roles: { include: { role: true } } },
  });
  if (!user || !user.isActive) throw new Error(`Active publishing administrator not found: ${email}`);
  const roles = user.roles.map(({ role }) => role.key).filter((role): role is RoleKey => ROLES.includes(role as RoleKey));
  if (!roles.length) throw new Error(`Publishing administrator has no recognized role: ${email}`);
  return { id: user.id, email: user.email, name: user.name, roles };
}

export async function publishProductsExplorer({
  database,
  env,
  apply = false,
  revalidate = () => undefined,
}: {
  database: PrismaClient;
  env: PublishEnvironment;
  apply?: boolean;
  revalidate?: (path: string) => void | Promise<void>;
}) {
  if (!apply) throw new Error("Products explorer publisher is in preview mode. Pass --apply to write.");
  if (env.VERCEL_ENV !== "production" || env.ZYRON_PRODUCTS_RELEASE !== RELEASE_APPROVAL) {
    throw new Error("Products explorer production approval gate is closed; no content was changed.");
  }
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is required for Products explorer publication.");

  const principal = await productionPrincipal(database, env.TARGET_ADMIN_EMAIL?.trim().toLowerCase() || "admin@zyroncnc.com");
  const categories = await database.productCategory.findMany({
    where: { status: "PUBLISHED", publishedAt: { not: null } },
    select: { id: true, slug: true, name: true, position: true },
    orderBy: [{ position: "asc" }, { slug: "asc" }],
  });
  const service = new PageService(database, revalidate);
  let page = await service.getBySlug(principal, "products");
  const existing = page ? parsePageDocument(page.draftContent) : { schemaVersion: 1 as const, nodes: [] };
  const document = buildProductsExplorerDocument(categories, existing);
  let changed = false;

  if (!page) {
    page = await service.create(principal, { name: "产品总页", slug: "products", pageType: "PRODUCT_INDEX", document });
    changed = true;
  } else {
    const published = page.publishedContent ? parsePageDocument(page.publishedContent) : null;
    if (!sameValue(existing, document) || !published || !sameValue(published, document)) {
      page = await service.saveDraft(principal, page.id, { version: page.version, name: "产品总页", document });
      changed = true;
    }
  }
  if (changed || page.status !== "PUBLISHED") page = await service.publish(principal, page.id, { version: page.version });
  return { changed, pageId: page.id, version: page.version };
}

async function main() {
  try {
    const result = await publishProductsExplorer({ database: db, env: process.env, apply: process.argv.includes("--apply") });
    console.log(`Products explorer ${result.changed ? "published" : "already current"}: page=${result.pageId} version=${result.version}`);
  } finally {
    await db.$disconnect();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Products explorer publication failed.");
    process.exitCode = 1;
  });
}
