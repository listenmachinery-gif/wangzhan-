import "server-only";

import { Prisma } from "@prisma/client";
import { z } from "zod";

import { db } from "@/lib/db/client";
import { isIsoCountryCode } from "@/lib/shipping/countries";
import { parseShippingHighlightDocument, type ShippingHighlightDocument } from "@/lib/shipping/schema";

export type PublishedShippingHighlight = {
  id: string;
  slug: string;
  publishedAt: Date;
  updatedAt: Date;
  shipmentDate: Date;
  countryCode: string;
  categorySlug: string | null;
  document: ShippingHighlightDocument;
};

type PublishedRow = {
  id: string;
  slug: string;
  publishedAt: Date | null;
  updatedAt: Date;
  publishedShipmentDate: Date | null;
  publishedCountryCode: string | null;
  publishedCategorySlug: string | null;
  publishedContent: unknown;
};

const optionsSchema = z.object({
  countryCode: z.string().trim().transform((value) => value.toUpperCase()).refine(isIsoCountryCode).optional(),
  categorySlug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  sort: z.enum(["newest", "oldest"]).default("newest"),
  limit: z.number().int().min(1).max(24).default(12),
  cursor: z.string().trim().min(1).max(120).optional(),
}).strict();

function parseRow(row: PublishedRow): PublishedShippingHighlight | null {
  if (!row.publishedAt || !row.publishedShipmentDate || !row.publishedCountryCode || !row.publishedContent) return null;
  try {
    return {
      id: row.id,
      slug: row.slug,
      publishedAt: row.publishedAt,
      updatedAt: row.updatedAt,
      shipmentDate: row.publishedShipmentDate,
      countryCode: row.publishedCountryCode,
      categorySlug: row.publishedCategorySlug,
      document: parseShippingHighlightDocument(row.publishedContent),
    };
  } catch {
    console.error("Invalid published shipping highlight snapshot", { id: row.id, slug: row.slug });
    return null;
  }
}

const publicSelect = {
  id: true,
  slug: true,
  publishedAt: true,
  updatedAt: true,
  publishedShipmentDate: true,
  publishedCountryCode: true,
  publishedCategorySlug: true,
  publishedContent: true,
} as const;

export async function listPublishedShippingHighlights(rawOptions: {
  countryCode?: string;
  categorySlug?: string;
  sort?: "newest" | "oldest";
  limit?: number;
  cursor?: string;
} = {}) {
  const options = optionsSchema.parse(rawOptions);
  const direction = options.sort === "oldest" ? "asc" : "desc";
  const rows = await db.shippingHighlight.findMany({
    where: {
      status: { not: "ARCHIVED" },
      publishedAt: { not: null },
      publishedContent: { not: Prisma.DbNull },
      publishedCountryCode: options.countryCode,
      publishedCategorySlug: options.categorySlug,
    },
    select: publicSelect,
    orderBy: [{ publishedShipmentDate: direction }, { id: direction }],
    cursor: options.cursor ? { id: options.cursor } : undefined,
    skip: options.cursor ? 1 : undefined,
    take: options.limit + 1,
  });
  const hasNextPage = rows.length > options.limit;
  const visibleRows = rows.slice(0, options.limit);
  const items = visibleRows.map(parseRow).filter((item): item is PublishedShippingHighlight => item !== null);
  return { items, nextCursor: hasNextPage ? visibleRows.at(-1)?.id ?? null : null };
}

export async function getPublishedShippingHighlightBySlug(slug: string) {
  const row = await db.shippingHighlight.findFirst({
    where: { slug, status: { not: "ARCHIVED" }, publishedAt: { not: null }, publishedContent: { not: Prisma.DbNull } },
    select: publicSelect,
  });
  return row ? parseRow(row) : null;
}

export async function listLatestPublishedShippingHighlights(limit = 3) {
  return (await listPublishedShippingHighlights({ limit, sort: "newest" })).items;
}
