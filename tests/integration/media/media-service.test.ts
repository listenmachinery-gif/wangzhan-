import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { MediaInUseError, MediaService, MediaServicePermissionError } from "@/lib/services/media-service";
import type { StorageAdapter, StoragePutInput } from "@/lib/storage/storage-adapter";

class TestStorage implements StorageAdapter {
  readonly objects = new Map<string, { body: Uint8Array; contentType: string }>();
  failNextPut = false;

  async put(input: StoragePutInput) {
    if (this.failNextPut) {
      this.failNextPut = false;
      throw new Error("storage unavailable");
    }
    this.objects.set(input.key, { body: input.body, contentType: input.contentType });
  }

  async getSignedUrl(key: string) {
    if (!this.objects.has(key)) throw new Error("missing object");
    return `https://storage.test/${encodeURIComponent(key)}`;
  }

  async delete(key: string) {
    this.objects.delete(key);
  }
}

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);

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
      filename: "machine.jpg",
      declaredMime: "image/jpeg",
      bytes: jpeg,
      altText: "Electric shearing machine",
      category: "products",
      usage: "EDITORIAL_IMAGE",
    });

    const persisted = await db.mediaAsset.findUniqueOrThrow({ where: { id: asset.id } });
    expect(persisted).toMatchObject({
      originalName: "machine.jpg",
      mimeType: "image/jpeg",
      byteSize: jpeg.byteLength,
      altText: "Electric shearing machine",
      category: "products",
      lifecycleStatus: "ACTIVE",
      uploadedById: administrator.id,
    });
    expect(storage.objects.get(persisted.objectKey)?.body).toEqual(jpeg);
    await expect(
      db.auditLog.findFirstOrThrow({ where: { entityId: asset.id, action: "media.upload" } }),
    ).resolves.toMatchObject({ actorId: administrator.id, entityType: "MediaAsset" });
  });

  it("does not leave database metadata behind when object storage fails", async () => {
    storage.failNextPut = true;

    await expect(
      service.createUpload(administrator, {
        filename: "machine.jpg",
        declaredMime: "image/jpeg",
        bytes: jpeg,
        altText: "Machine",
        usage: "EDITORIAL_IMAGE",
      }),
    ).rejects.toThrow("storage unavailable");

    await expect(db.mediaAsset.count()).resolves.toBe(0);
    await expect(db.auditLog.count()).resolves.toBe(0);
  });

  it("creates an immutable object and replacement asset instead of overwriting the old key", async () => {
    const original = await service.createUpload(administrator, {
      filename: "machine.jpg",
      declaredMime: "image/jpeg",
      bytes: jpeg,
      altText: "Original machine",
      usage: "EDITORIAL_IMAGE",
    });
    const replacementBytes = Buffer.concat([jpeg, Buffer.from([0x01])]);
    const replacement = await service.replace(administrator, original.id, {
      filename: "machine-new.jpg",
      declaredMime: "image/jpeg",
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
      filename: "machine.jpg",
      declaredMime: "image/jpeg",
      bytes: jpeg,
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

  it("tombstones, removes, and audits an unreferenced asset", async () => {
    const asset = await service.createUpload(administrator, {
      filename: "machine.jpg",
      declaredMime: "image/jpeg",
      bytes: jpeg,
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

  it("rejects upload, reference access, and deletion without the required permission", async () => {
    await expect(
      service.createUpload(sales, {
        filename: "machine.jpg",
        declaredMime: "image/jpeg",
        bytes: jpeg,
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
