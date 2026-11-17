import "server-only";

import type { PrismaClient } from "@prisma/client";

import { db } from "@/lib/db/client";
import { DEFAULT_NAVIGATION } from "@/lib/navigation/default-navigation";
import { parseNavigationSnapshot, type NavigationSnapshot } from "@/lib/navigation/schema";

type PublishedNavigationRow = {
  publishedAt: Date | null;
  publishedContent: unknown;
};

export function parsePublishedNavigation(row: PublishedNavigationRow | null): NavigationSnapshot | null {
  if (!row?.publishedAt || !row.publishedContent) return null;
  try {
    return parseNavigationSnapshot(row.publishedContent);
  } catch {
    return null;
  }
}

export async function getPublishedNavigation(database: PrismaClient = db) {
  const row = await database.navigationDocument.findUnique({
    where: { key: "PRIMARY" },
    select: { publishedAt: true, publishedContent: true },
  });
  return parsePublishedNavigation(row);
}

export async function resolvePublicNavigation(database: PrismaClient = db) {
  return await getPublishedNavigation(database) ?? DEFAULT_NAVIGATION;
}

