import type { Metadata } from "next";
import type { PrismaClient, SeoRecord } from "@prisma/client";

import { db } from "@/lib/db/client";

export type PublishedSeoRecord = SeoRecord & {
  openGraphMedia: { id: string; lifecycleStatus: string; mimeType: string } | null;
};

type PublishedSnapshot = Pick<SeoRecord,
  "pathname" | "productId" | "title" | "description" | "canonicalUrl" | "openGraphTitle" |
  "openGraphDescription" | "openGraphMediaId" | "robotsIndex" | "targetKeyword" | "version"
>;

function snapshotFrom(value: unknown): PublishedSnapshot | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const snapshot = value as Record<string, unknown>;
  if (typeof snapshot.pathname !== "string" || typeof snapshot.title !== "string" || typeof snapshot.description !== "string"
    || typeof snapshot.robotsIndex !== "boolean" || typeof snapshot.version !== "number") return null;
  return snapshot as unknown as PublishedSnapshot;
}

type ProductVisibility = {
  status: string;
  publishedAt: Date | null;
  category: { status: string; publishedAt: Date | null };
};

const productVisibilitySelect = {
  status: true,
  publishedAt: true,
  category: { select: { status: true, publishedAt: true } },
} as const;

async function publishedRecord(record: SeoRecord & { product: ProductVisibility | null }, database: PrismaClient) {
  if (record.productId && (
    record.product?.status !== "PUBLISHED"
    || !record.product.publishedAt
    || record.product.category.status !== "PUBLISHED"
    || !record.product.category.publishedAt
  )) return null;
  const publication = await database.auditLog.findFirst({
    where: { entityType: "SeoRecord", entityId: record.id, action: "seo.publish" },
    select: { after: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  const snapshot = snapshotFrom(publication?.after);
  if (!snapshot || snapshot.pathname !== record.pathname) return null;
  const openGraphMedia = snapshot.openGraphMediaId
    ? await database.mediaAsset.findUnique({
      where: { id: snapshot.openGraphMediaId },
      select: { id: true, lifecycleStatus: true, mimeType: true },
    })
    : null;
  return {
    ...record,
    ...snapshot,
    status: "PUBLISHED" as const,
    publishedAt: publication?.createdAt ?? record.publishedAt,
    openGraphMedia,
  } satisfies PublishedSeoRecord;
}

export async function getPublishedSeoByPath(pathname: string, database: PrismaClient = db) {
  const record = await database.seoRecord.findFirst({
    where: { pathname, status: "PUBLISHED", publishedAt: { not: null } },
    include: { product: { select: productVisibilitySelect } },
  });
  return record ? publishedRecord(record, database) : null;
}

export async function listIndexableSeoPaths(database: PrismaClient = db) {
  const records = await database.seoRecord.findMany({
    where: { status: "PUBLISHED", publishedAt: { not: null } },
    include: { product: { select: productVisibilitySelect } },
    orderBy: { pathname: "asc" },
  });
  const published = await Promise.all(records.map((record) => publishedRecord(record, database)));
  return published.filter((record) => Boolean(record?.robotsIndex)).map((record) => record!.pathname);
}

export async function listNoindexSeoPaths(database: PrismaClient = db) {
  const records = await database.seoRecord.findMany({
    where: { status: "PUBLISHED", publishedAt: { not: null } },
    include: { product: { select: productVisibilitySelect } },
  });
  const published = await Promise.all(records.map((record) => publishedRecord(record, database)));
  return new Set(published.filter((record) => record?.robotsIndex === false).map((record) => record!.pathname));
}

export function seoRecordToMetadata(record: PublishedSeoRecord, fallback: Metadata = {}): Metadata {
  const image = record.openGraphMedia?.lifecycleStatus === "ACTIVE" && record.openGraphMedia.mimeType.startsWith("image/")
    ? [{ url: `/api/media/${record.openGraphMedia.id}` }]
    : undefined;
  return {
    ...fallback,
    title: record.title,
    description: record.description,
    alternates: { ...fallback.alternates, canonical: record.canonicalUrl || record.pathname },
    robots: { index: record.robotsIndex, follow: record.robotsIndex },
    openGraph: {
      ...fallback.openGraph,
      title: record.openGraphTitle || record.title,
      description: record.openGraphDescription || record.description,
      url: record.canonicalUrl || record.pathname,
      ...(image ? { images: image } : {}),
    },
    twitter: {
      ...fallback.twitter,
      title: record.openGraphTitle || record.title,
      description: record.openGraphDescription || record.description,
      ...(image ? { images: image.map(({ url }) => url) } : {}),
    },
  };
}

export async function overlayPublishedSeo(pathname: string, fallback: Metadata, database: PrismaClient = db) {
  const record = await getPublishedSeoByPath(pathname, database);
  return record ? seoRecordToMetadata(record, fallback) : fallback;
}
