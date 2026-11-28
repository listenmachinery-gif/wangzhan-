import type { PrismaClient } from "@prisma/client";

import { db } from "@/lib/db/client";

type RepositoryOptions = { database?: PrismaClient };

const categorySelect = {
  id: true,
  slug: true,
  name: true,
  summary: true,
  description: true,
  position: true,
  publishedAt: true,
} as const;

export async function listPublishedCategories(options: RepositoryOptions = {}) {
  const database = options.database ?? db;
  return database.productCategory.findMany({
    where: { status: "PUBLISHED", publishedAt: { not: null } },
    select: {
      ...categorySelect,
      products: {
        where: { status: "PUBLISHED", publishedAt: { not: null } },
        select: {
          id: true,
          slug: true,
          name: true,
          summary: true,
          description: true,
          position: true,
          publishedAt: true,
          models: {
            where: { active: true },
            select: {
              id: true,
              name: true,
              sku: true,
              values: {
                select: { value: true, field: { select: { name: true, unit: true } } },
              },
            },
            orderBy: [{ position: "asc" }, { name: "asc" }],
          },
          sections: {
            where: { type: "HERO", visible: true },
            select: { content: true },
            take: 1,
          },
        },
        orderBy: [{ position: "asc" }, { slug: "asc" }],
      },
    },
    orderBy: [{ position: "asc" }, { slug: "asc" }],
  });
}

export async function getPublishedCategoryBySlug(slug: string, options: RepositoryOptions = {}) {
  const database = options.database ?? db;
  return database.productCategory.findFirst({
    where: { slug, status: "PUBLISHED", publishedAt: { not: null } },
    select: {
      ...categorySelect,
      products: {
        where: { status: "PUBLISHED", publishedAt: { not: null } },
        select: {
          id: true,
          slug: true,
          name: true,
          summary: true,
          description: true,
          position: true,
          publishedAt: true,
          models: {
            where: { active: true },
            select: {
              id: true,
              name: true,
              sku: true,
              values: {
                select: { value: true, field: { select: { name: true, unit: true } } },
              },
            },
            orderBy: [{ position: "asc" }, { name: "asc" }],
          },
          sections: {
            where: { type: "HERO", visible: true },
            select: { content: true },
            take: 1,
          },
        },
        orderBy: [{ position: "asc" }, { slug: "asc" }],
      },
    },
  });
}
