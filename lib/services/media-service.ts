import { randomUUID } from "node:crypto";
import path from "node:path";

import type { MediaAsset, PrismaClient } from "@prisma/client";

import { can, type Permission, type Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import {
  inspectMediaUpload,
  type MediaUsage,
} from "@/lib/storage/file-signatures";
import type { StorageAdapter } from "@/lib/storage/storage-adapter";

export type MediaUploadInput = {
  filename: string;
  declaredMime: string;
  bytes: Uint8Array;
  altText?: string | null;
  category?: string | null;
  usage: MediaUsage;
};

export class MediaServicePermissionError extends Error {
  constructor(permission: Permission) {
    super(`Missing required permission: ${permission}`);
    this.name = "MediaServicePermissionError";
  }
}

export class MediaInUseError extends Error {
  constructor(public readonly references: Array<{ entityType: string; entityId: string; field: string }>) {
    super("Media asset is referenced and cannot be deleted.");
    this.name = "MediaInUseError";
  }
}

export class MediaNotFoundError extends Error {
  constructor() {
    super("Media asset was not found.");
    this.name = "MediaNotFoundError";
  }
}

function assertPermission(principal: Principal, permission: Permission) {
  if (!can(principal, permission)) throw new MediaServicePermissionError(permission);
}

function objectKeyFor(filename: string) {
  const extension = path.extname(filename).toLowerCase();
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "/");
  return `media/${date}/${randomUUID()}${extension}`;
}

export class MediaService {
  constructor(
    private readonly storage: StorageAdapter,
    private readonly database: PrismaClient = db,
  ) {}

  async createUpload(principal: Principal, input: MediaUploadInput): Promise<MediaAsset> {
    assertPermission(principal, "media.write");
    const existing = await this.database.mediaAsset.findMany({
      where: { lifecycleStatus: { not: "DELETED" } },
      select: { checksum: true },
    });
    const inspection = await inspectMediaUpload({
      ...input,
      existingChecksums: new Set(existing.map((asset) => asset.checksum)),
    });
    const objectKey = objectKeyFor(input.filename);

    await this.storage.put({
      key: objectKey,
      body: input.bytes,
      contentType: inspection.detectedMime,
      cacheControl: "public, max-age=31536000, immutable",
    });

    try {
      return await this.database.$transaction(async (transaction) => {
        const asset = await transaction.mediaAsset.create({
          data: {
            objectKey,
            originalName: input.filename,
            mimeType: inspection.detectedMime,
            byteSize: inspection.byteSize,
            checksum: inspection.checksum,
            altText: input.altText?.trim() || null,
            category: input.category?.trim() || null,
            uploadedById: principal.id,
          },
        });
        await transaction.auditLog.create({
          data: {
            actorId: principal.id,
            action: "media.upload",
            entityType: "MediaAsset",
            entityId: asset.id,
            after: {
              objectKey: asset.objectKey,
              originalName: asset.originalName,
              mimeType: asset.mimeType,
              byteSize: asset.byteSize,
            },
          },
        });
        return asset;
      });
    } catch (error) {
      await this.storage.delete(objectKey).catch(() => undefined);
      throw error;
    }
  }

  async replace(principal: Principal, mediaId: string, input: MediaUploadInput) {
    assertPermission(principal, "media.write");
    const original = await this.database.mediaAsset.findFirst({
      where: { id: mediaId, lifecycleStatus: "ACTIVE" },
    });
    if (!original) throw new MediaNotFoundError();

    const replacement = await this.createUpload(principal, input);
    try {
      await this.database.$transaction([
        this.database.mediaAsset.update({
          where: { id: original.id },
          data: { replacedById: replacement.id },
        }),
        this.database.auditLog.create({
          data: {
            actorId: principal.id,
            action: "media.replace",
            entityType: "MediaAsset",
            entityId: original.id,
            before: { replacedById: null },
            after: { replacedById: replacement.id },
          },
        }),
      ]);
      return replacement;
    } catch (error) {
      await this.deleteUnreferenced(principal, replacement.id).catch(() => undefined);
      throw error;
    }
  }

  async listReferences(principal: Principal, mediaId: string) {
    assertPermission(principal, "media.read");
    return this.database.mediaReference.findMany({
      where: { mediaAssetId: mediaId },
      select: { id: true, entityType: true, entityId: true, field: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
  }

  async deleteUnreferenced(principal: Principal, mediaId: string) {
    assertPermission(principal, "media.delete");
    const asset = await this.database.mediaAsset.findFirst({
      where: { id: mediaId, lifecycleStatus: "ACTIVE" },
      include: { references: { select: { entityType: true, entityId: true, field: true } } },
    });
    if (!asset) throw new MediaNotFoundError();
    if (asset.references.length > 0) throw new MediaInUseError(asset.references);

    await this.database.mediaAsset.update({
      where: { id: asset.id },
      data: { lifecycleStatus: "TOMBSTONED" },
    });
    await this.storage.delete(asset.objectKey);
    return this.database.$transaction(async (transaction) => {
      const deleted = await transaction.mediaAsset.update({
        where: { id: asset.id },
        data: { lifecycleStatus: "DELETED", deletedAt: new Date() },
      });
      await transaction.auditLog.create({
        data: {
          actorId: principal.id,
          action: "media.delete",
          entityType: "MediaAsset",
          entityId: asset.id,
          before: { lifecycleStatus: "ACTIVE", objectKey: asset.objectKey },
          after: { lifecycleStatus: "DELETED" },
        },
      });
      return deleted;
    });
  }

  async updateMetadata(
    principal: Principal,
    mediaId: string,
    data: { altText?: string | null; category?: string | null },
  ) {
    assertPermission(principal, "media.write");
    const before = await this.database.mediaAsset.findFirst({
      where: { id: mediaId, lifecycleStatus: "ACTIVE" },
    });
    if (!before) throw new MediaNotFoundError();
    return this.database.$transaction(async (transaction) => {
      const updated = await transaction.mediaAsset.update({ where: { id: mediaId }, data });
      await transaction.auditLog.create({
        data: {
          actorId: principal.id,
          action: "media.update",
          entityType: "MediaAsset",
          entityId: mediaId,
          before: { altText: before.altText, category: before.category },
          after: { altText: updated.altText, category: updated.category },
        },
      });
      return updated;
    });
  }

  async list(principal: Principal, input: { query?: string; cursor?: string; limit: number }) {
    assertPermission(principal, "media.read");
    const assets = await this.database.mediaAsset.findMany({
      where: {
        lifecycleStatus: "ACTIVE",
        ...(input.query
          ? {
              OR: [
                { originalName: { contains: input.query, mode: "insensitive" as const } },
                { altText: { contains: input.query, mode: "insensitive" as const } },
                { category: { contains: input.query, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      include: { _count: { select: { references: true } } },
    });
    const hasMore = assets.length > input.limit;
    const items = hasMore ? assets.slice(0, input.limit) : assets;
    return { items, nextCursor: hasMore ? items.at(-1)?.id ?? null : null };
  }
}
