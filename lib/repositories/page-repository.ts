import "server-only";

import type { PrismaClient } from "@prisma/client";

import { db } from "@/lib/db/client";
import type { PageDocument } from "@/lib/page-builder/schema";
import { parsePageDocument } from "@/lib/services/page-service";

type PublishedPageRow = {
  status: string;
  publishedAt: Date | null;
  publishedContent: unknown;
};

export function parsePublishedPage(row: PublishedPageRow | null): PageDocument | null {
  if (!row || row.status !== "PUBLISHED" || !row.publishedAt || !row.publishedContent) return null;
  try { return parsePageDocument(row.publishedContent); }
  catch { return null; }
}

export async function getPublishedPageBySlug(slug: string, database: PrismaClient = db) {
  const row = await database.sitePage.findUnique({
    where: { slug },
    select: { status: true, publishedAt: true, publishedContent: true },
  });
  return parsePublishedPage(row);
}
