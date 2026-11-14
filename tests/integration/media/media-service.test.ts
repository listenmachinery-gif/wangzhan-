import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import {
  MediaInUseError,
  MediaService,
  MediaServicePermissionError,
  MediaUsageInvariantError,
} from "@/lib/services/media-service";
import type { StorageAdapter, StoragePutInput } from "@/lib/storage/storage-adapter";

class TestStorage implements StorageAdapter {
  readonly objects = new Map<string, { body: Uint8Array; contentType: string }>();
  failNextPut = false;
  failNextDelete = false;

  async put(input: StoragePutInput) {
    if (this.failNextPut) {
      this.failNextPut = false;
      throw new Error("storage unavailable");
    }
    if (this.objects.has(input.key)) throw new Error("object already exists");
    this.objects.set(input.key, { body: input.body, contentType: input.contentType });
  }

  async getSignedUrl(key: string) {
    if (!this.objects.has(key)) throw new Error("missing object");
    return `https://storage.test/${encodeURIComponent(key)}`;
  }

  async delete(key: string) {
    if (this.failNextDelete) {
      this.failNextDelete = false;
      throw new Error("delete unavailable");
    }
    this.objects.delete(key);
  }
}

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

describe("MediaService", () => {
  let storage: TestStorage;
  let service: MediaService;
  let administrator: Principal;
  let sales: Principal;

  beforeEach(async () => {
    await resetTestDatabase();
    storage = new TestStorage();
    service = new MediaService(storage);

    const [adminUser, salesUser] = await Promise.all([
      db.user.create({
        data: { email: "admin@zyron.test", name: "Admin", passwordHash: "test" },
      }),
      db.user.create({
        data: { email: "sales@zyron.test", name: "Sales", passwordHash: "test" },
      }),
    ]);

    administrator = {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      roles: ["SUPER_ADMIN"],
    };
    sales = {
      id: salesUser.id,
      email: salesUser.email,
      name: salesUser.name,
      roles: ["SALES"],
    };
  });

  afterAll(() => db.$disconnect());

  it("stores content and persists complete active metadata with an audit record", async () => {
    const asset = await service.createUpload(administrator, {
      filename: "machine.png",
      declaredMime: "image/png",
      bytes: png,
      altText: "Electric shearing machine",
      category: "products",
      usage: "EDITORIAL_IMAGE",
    });

    const persisted = await db.mediaAsset.findUniqueOrThrow({ where: { id: asset.id } });
    expect(persisted).toMatchObject({
      originalName: "machine.png",
      mimeType: "image/png",
      byteSize: png.byteLength,
      width: 1,
      height: 1,
      usage: "EDITORIAL_IMAGE",
      altText: "Electric shearing machine",
      category: "products",
      lifecycleStatus: "ACTIVE",
      uploadedById: administrator.id,
    });
    expect(storage.objects.get(persisted.objectKey)?.body).toEqual(png);
    await expect(
      db.auditLog.findFirstOrThrow({ where: { entityId: asset.id, action: "media.upload" } }),
    ).resolves.toMatchObject({ actorId: administrator.id, entityType: "MediaAsset" });
  });

  it("does not leave database metadata behind when object storage fails", async () => {
    storage.failNextPut = true;

    await expect(
      service.createUpload(administrator, {
        filename: "machine.png",
        declaredMime: "image/png",
        bytes: png,
        altText: "Machine",
        usage: "EDITORIAL_IMAGE",
      }),
    ).rejects.toThrow("storage unavailable");

    await expect(db.mediaAsset.count()).resolves.toBe(0);
    await expect(db.auditLog.count()).resolves.toBe(0);
  });

  it("enforces duplicate checks under concurrent uploads", async () => {
    const input = {
      filename: "duplicate.png",
      declaredMime: "image/png",
      bytes: png,
      altText: "Machine",
      usage: "EDITORIAL_IMAGE" as const,
    };

    const results = await Promise.allSettled([
      service.createUpload(administrator, input),
      service.createUpload(administrator, input),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
    await expect(db.mediaAsset.count()).resolves.toBe(1);
    expect(storage.objects.size).toBe(1);
  });

  it("creates an immutable object and replacement asset instead of overwriting the old key", async () => {
    const original = await service.createUpload(administrator, {
      filename: "machine.png",
      declaredMime: "image/png",
      bytes: png,
      altText: "Original machine",
      usage: "EDITORIAL_IMAGE",
    });
    const replacementBytes = Buffer.concat([png, Buffer.from([0x01])]);
    const replacement = await service.replace(administrator, original.id, {
      filename: "machine-new.png",
      declaredMime: "image/png",
      bytes: replacementBytes,
      altText: "Updated machine",
      usage: "EDITORIAL_IMAGE",
    });

    expect(replacement.objectKey).not.toBe(original.objectKey);
    expect(storage.objects.has(original.objectKey)).toBe(true);
    expect(storage.objects.has(replacement.objectKey)).toBe(true);
    await expect(db.mediaAsset.findUniqueOrThrow({ where: { id: original.id } })).resolves.toMatchObject({
      replacedById: replacement.id,
    });
  });

  it("lists references and rejects deletion while an asset is referenced", async () => {
    const asset = await service.createUpload(administrator, {
      filename: "machine.png",
      declaredMime: "image/png",
      bytes: png,
      altText: "Machine",
      usage: "EDITORIAL_IMAGE",
    });
    await db.mediaReference.create({
      data: { mediaAssetId: asset.id, entityType: "Product", entityId: "product-1", field: "hero" },
    });

    await expect(service.listReferences(administrator, asset.id)).resolves.toEqual([
      expect.objectContaining({ entityType: "Product", entityId: "product-1", field: "hero" }),
    ]);
    await expect(service.deleteUnreferenced(administrator, asset.id)).rejects.toBeInstanceOf(MediaInUseError);
    await expect(db.mediaAsset.findUniqueOrThrow({ where: { id: asset.id } })).resolves.toMatchObject({
      lifecycleStatus: "ACTIVE",
    });
    expect(storage.objects.has(asset.objectKey)).toBe(true);
  });

  it("rejects deletion while an asset is used by a direct Banner relation", async () => {
    const asset = await service.createUpload(administrator, {
      filename: "banner.png",
      declaredMime: "image/png",
      bytes: png,
      altText: "Banner",
      usage: "EDITORIAL_IMAGE",
    });
    await db.banner.create({
      data: { name: "Home", title: "Home banner", desktopMediaId: asset.id },
    });

    await expect(service.deleteUnreferenced(administrator, asset.id)).rejects.toBeInstanceOf(MediaInUseError);
    expect(storage.objects.has(asset.objectKey)).toBe(true);
  });

  it("tombstones, removes, and audits an unreferenced asset", async () => {
    const asset = await service.createUpload(administrator, {
      filename: "machine.png",
      declaredMime: "image/png",
      bytes: png,
      altText: "Machine",
      usage: "EDITORIAL_IMAGE",
    });

    await service.deleteUnreferenced(administrator, asset.id);

    expect(storage.objects.has(asset.objectKey)).toBe(false);
    await expect(db.mediaAsset.findUniqueOrThrow({ where: { id: asset.id } })).resolves.toMatchObject({
      lifecycleStatus: "DELETED",
      deletedAt: expect.any(Date),
    });
    await expect(
      db.auditLog.findFirstOrThrow({ where: { entityId: asset.id, action: "media.delete" } }),
    ).resolves.toMatchObject({ actorId: administrator.id });
  });

  it("records a durable tombstone before deletion and can retry cleanup", async () => {
    const asset = await service.createUpload(administrator, {
      filename: "retry.png",
      declaredMime: "image/png",
      bytes: png,
      altText: "Retry machine",
      usage: "EDITORIAL_IMAGE",
    });
    storage.failNextDelete = true;

    await expect(service.deleteUnreferenced(administrator, asset.id)).rejects.toThrow("delete unavailable");
    await expect(db.mediaAsset.findUniqueOrThrow({ where: { id: asset.id } })).resolves.toMatchObject({
      lifecycleStatus: "TOMBSTONED",
    });
    await expect(
      db.auditLog.findFirstOrThrow({ where: { entityId: asset.id, action: "media.delete.requested" } }),
    ).resolves.toBeTruthy();

    await service.cleanupTombstoned(asset.id);
    expect(storage.objects.has(asset.objectKey)).toBe(false);
    await expect(db.mediaAsset.findUniqueOrThrow({ where: { id: asset.id } })).resolves.toMatchObject({
      lifecycleStatus: "DELETED",
    });
  });

  it("does not allow editorial alt text to be cleared after upload", async () => {
    const asset = await service.createUpload(administrator, {
      filename: "editorial.png",
      declaredMime: "image/png",
      bytes: png,
      altText: "Required description",
      usage: "EDITORIAL_IMAGE",
    });

    await expect(service.updateMetadata(administrator, asset.id, { altText: null })).rejects.toBeInstanceOf(
      MediaUsageInvariantError,
    );
  });

  it("rejects upload, reference access, and deletion without the required permission", async () => {
    await expect(
      service.createUpload(sales, {
        filename: "machine.png",
        declaredMime: "image/png",
        bytes: png,
        altText: "Machine",
        usage: "EDITORIAL_IMAGE",
      }),
    ).rejects.toBeInstanceOf(MediaServicePermissionError);
    await expect(service.listReferences(sales, "missing")).rejects.toBeInstanceOf(
      MediaServicePermissionError,
    );
    await expect(service.deleteUnreferenced(sales, "missing")).rejects.toBeInstanceOf(
      MediaServicePermissionError,
    );
  });
});
