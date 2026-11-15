import type { PrismaClient } from "@prisma/client";

import { db } from "@/lib/db/client";
import { validateModule } from "@/lib/product-modules/schemas";
import type { ProductModule, ProductModuleType } from "@/lib/product-modules/types";
import {
  getLegacyProductFallback,
  type LegacyPublishedProduct,
} from "@/lib/repositories/legacy-product-fallback";

const REGISTERED_WIDGETS = new Set(["small-electric-selector"]);

export function isRegisteredProductWidget(value: string | null): value is string {
  return Boolean(value && REGISTERED_WIDGETS.has(value));
}

export type DatabasePublishedProduct = {
  source: "database";
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string | null;
  categorySlug: string;
  categoryName: string;
  registeredWidget: string | null;
  publishedAt: Date;
  modules: ProductModule<unknown>[];
};

export type PublishedProduct = DatabasePublishedProduct | LegacyPublishedProduct;

type RepositoryOptions = {
  database?: PrismaClient;
  allowLegacyFallback?: boolean;
};

export async function listPublishedProductSlugs(options: RepositoryOptions = {}) {
  const database = options.database ?? db;
  const rows = await database.product.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { not: null },
      category: { status: "PUBLISHED", publishedAt: { not: null } },
    },
    select: { slug: true },
    orderBy: [{ position: "asc" }, { slug: "asc" }],
  });
  return rows.map(({ slug }) => slug);
}

export async function getPublishedProductBySlug(
  slug: string,
  options: RepositoryOptions = {},
): Promise<PublishedProduct | null> {
  const database = options.database ?? db;
  const product = await database.product.findUnique({
    where: { slug },
    include: {
      category: { select: { slug: true, name: true, status: true, publishedAt: true } },
      sections: { where: { visible: true }, orderBy: [{ position: "asc" }, { type: "asc" }] },
    },
  });

  if (!product) return options.allowLegacyFallback ? getLegacyProductFallback(slug) : null;
  if (
    product.status !== "PUBLISHED"
    || !product.publishedAt
    || product.category.status !== "PUBLISHED"
    || !product.category.publishedAt
  ) return null;

  const modules = product.sections.map((section) => {
    const type = section.type as ProductModuleType;
    return {
      type,
      position: section.position,
      visible: true,
      data: validateModule(type, section.content),
    } satisfies ProductModule<unknown>;
  });

  return {
    source: "database",
    id: product.id,
    slug: product.slug,
    name: product.name,
    summary: product.summary,
    description: product.description,
    categorySlug: product.category.slug,
    categoryName: product.category.name,
    registeredWidget: isRegisteredProductWidget(product.registeredWidget)
      ? product.registeredWidget
      : null,
    publishedAt: product.publishedAt!,
    modules,
  };
}
