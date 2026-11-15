import { revalidatePath } from "next/cache";
import { Prisma, type PrismaClient } from "@prisma/client";

import { can, type Permission, type Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import {
  bannerCreateSchema,
  bannerPublishSchema,
  bannerUpdateSchema,
  type BannerCreateInput,
  type BannerUpdateInput,
} from "@/lib/validation/banners";

type Revalidate = (path: string) => void | Promise<void>;

export class BannerPermissionError extends Error {
  constructor(permission: Permission) {
    super(`Missing required permission: ${permission}`);
    this.name = "BannerPermissionError";
  }
}

export class BannerNotFoundError extends Error {
  constructor() {
    super("Banner was not found.");
    this.name = "BannerNotFoundError";
  }
}

export class BannerConflictError extends Error {
  constructor() {
    super("The banner has changed. Reload before saving.");
    this.name = "BannerConflictError";
  }
}

export class BannerValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BannerValidationError";
  }
}

function assertPermission(principal: Principal, permission: Permission) {
  if (!can(principal, permission)) throw new BannerPermissionError(permission);
}

const mediaInclude = {
  desktopMedia: { select: { id: true, originalName: true, altText: true, mimeType: true, lifecycleStatus: true } },
  tabletMedia: { select: { id: true, originalName: true, altText: true, mimeType: true, lifecycleStatus: true } },
  mobileMedia: { select: { id: true, originalName: true, altText: true, mimeType: true, lifecycleStatus: true } },
} as const;

async function assertBannerMedia(
  transaction: Prisma.TransactionClient,
  ids: Array<string | null | undefined>,
) {
  const uniqueIds = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  const media = await transaction.mediaAsset.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, mimeType: true, lifecycleStatus: true },
  });
  const validIds = new Set(media.filter((asset) => asset.lifecycleStatus === "ACTIVE" && (asset.mimeType.startsWith("image/") || asset.mimeType.startsWith("video/"))).map(({ id }) => id));
  if (uniqueIds.some((id) => !validIds.has(id))) {
    throw new BannerValidationError("Every banner media selection must be an active image or video.");
  }
}

async function runSerializable<T>(
  database: PrismaClient,
  work: (transaction: Prisma.TransactionClient) => Promise<T>,
) {
  try {
    return await database.$transaction(work, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      throw new BannerConflictError();
    }
    throw error;
  }
}

export class BannerService {
  constructor(
    private readonly database: PrismaClient = db,
    private readonly revalidate: Revalidate = revalidatePath,
  ) {}

  async list(principal: Principal) {
    assertPermission(principal, "banner.read");
    return this.database.banner.findMany({
      include: mediaInclude,
      orderBy: [{ position: "asc" }, { updatedAt: "desc" }, { id: "asc" }],
    });
  }

  async get(principal: Principal, id: string) {
    assertPermission(principal, "banner.read");
    const banner = await this.database.banner.findUnique({ where: { id }, include: mediaInclude });
    if (!banner) throw new BannerNotFoundError();
    return banner;
  }

  async create(principal: Principal, rawInput: BannerCreateInput) {
    assertPermission(principal, "banner.write");
    const input = bannerCreateSchema.parse(rawInput);
    return this.database.$transaction(async (transaction) => {
      await assertBannerMedia(transaction, [input.desktopMediaId, input.tabletMediaId, input.mobileMediaId]);
      const banner = await transaction.banner.create({ data: input, include: mediaInclude });
      await transaction.auditLog.create({
        data: {
          actorId: principal.id,
          action: "banner.create",
          entityType: "Banner",
          entityId: banner.id,
          after: { name: banner.name, status: banner.status, version: banner.version },
        },
      });
      return banner;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  async update(principal: Principal, id: string, rawInput: BannerUpdateInput) {
    assertPermission(principal, "banner.write");
    const patch = bannerUpdateSchema.parse(rawInput);
    const result = await runSerializable(this.database, async (transaction) => {
      const current = await transaction.banner.findUnique({ where: { id } });
      if (!current) throw new BannerNotFoundError();
      if (current.version !== patch.version) throw new BannerConflictError();
      if (current.status === "PUBLISHED") assertPermission(principal, "banner.publish");
      const changes: Partial<typeof patch> = { ...patch };
      delete changes.version;
      const merged = bannerCreateSchema.parse({
        name: changes.name ?? current.name,
        title: changes.title ?? current.title,
        subtitle: changes.subtitle === undefined ? current.subtitle : changes.subtitle,
        buttonText: changes.buttonText === undefined ? current.buttonText : changes.buttonText,
        buttonUrl: changes.buttonUrl === undefined ? current.buttonUrl : changes.buttonUrl,
        textColor: changes.textColor === undefined ? current.textColor : changes.textColor,
        textPosition: changes.textPosition === undefined ? current.textPosition : changes.textPosition,
        maskOpacity: changes.maskOpacity === undefined ? current.maskOpacity : changes.maskOpacity,
        desktopMediaId: changes.desktopMediaId ?? current.desktopMediaId,
        tabletMediaId: changes.tabletMediaId === undefined ? current.tabletMediaId : changes.tabletMediaId,
        mobileMediaId: changes.mobileMediaId === undefined ? current.mobileMediaId : changes.mobileMediaId,
        enabled: changes.enabled ?? current.enabled,
        position: changes.position ?? current.position,
        startsAt: changes.startsAt === undefined ? current.startsAt : changes.startsAt,
        endsAt: changes.endsAt === undefined ? current.endsAt : changes.endsAt,
      });
      await assertBannerMedia(transaction, [merged.desktopMediaId, merged.tabletMediaId, merged.mobileMediaId]);
      const updated = await transaction.banner.updateMany({
        where: { id, version: patch.version },
        data: { ...changes, version: { increment: 1 } },
      });
      if (updated.count !== 1) throw new BannerConflictError();
      const banner = await transaction.banner.findUniqueOrThrow({ where: { id }, include: mediaInclude });
      await transaction.auditLog.create({
        data: {
          actorId: principal.id,
          action: "banner.update",
          entityType: "Banner",
          entityId: id,
          before: { name: current.name, status: current.status, version: current.version },
          after: { name: banner.name, status: banner.status, version: banner.version },
        },
      });
      return banner;
    });
    if (result.status === "PUBLISHED") await this.revalidate("/");
    return result;
  }

  async publish(principal: Principal, id: string, rawInput: { version: number }) {
    assertPermission(principal, "banner.publish");
    const input = bannerPublishSchema.parse(rawInput);
    const banner = await runSerializable(this.database, async (transaction) => {
      const current = await transaction.banner.findUnique({ where: { id } });
      if (!current) throw new BannerNotFoundError();
      if (current.version !== input.version) throw new BannerConflictError();
      await assertBannerMedia(transaction, [current.desktopMediaId, current.tabletMediaId, current.mobileMediaId]);
      const updated = await transaction.banner.updateMany({
        where: { id, version: input.version },
        data: { status: "PUBLISHED", publishedAt: new Date(), version: { increment: 1 } },
      });
      if (updated.count !== 1) throw new BannerConflictError();
      const result = await transaction.banner.findUniqueOrThrow({ where: { id }, include: mediaInclude });
      await transaction.auditLog.create({
        data: {
          actorId: principal.id,
          action: "banner.publish",
          entityType: "Banner",
          entityId: id,
          before: { status: current.status, version: current.version },
          after: { status: result.status, version: result.version },
        },
      });
      return result;
    });
    await this.revalidate("/");
    return banner;
  }

  async archive(principal: Principal, id: string, rawInput: { version: number }) {
    assertPermission(principal, "banner.write");
    const input = bannerPublishSchema.parse(rawInput);
    const result = await runSerializable(this.database, async (transaction) => {
      const current = await transaction.banner.findUnique({ where: { id } });
      if (!current) throw new BannerNotFoundError();
      if (current.version !== input.version) throw new BannerConflictError();
      if (current.status === "PUBLISHED") assertPermission(principal, "banner.publish");
      const updated = await transaction.banner.updateMany({
        where: { id, version: input.version },
        data: { status: "ARCHIVED", enabled: false, version: { increment: 1 } },
      });
      if (updated.count !== 1) throw new BannerConflictError();
      const banner = await transaction.banner.findUniqueOrThrow({ where: { id }, include: mediaInclude });
      await transaction.auditLog.create({
        data: {
          actorId: principal.id,
          action: "banner.archive",
          entityType: "Banner",
          entityId: id,
          before: { status: current.status, version: current.version },
          after: { status: banner.status, version: banner.version },
        },
      });
      return { banner, wasPublished: current.status === "PUBLISHED" };
    });
    if (result.wasPublished) await this.revalidate("/");
    return result.banner;
  }
}
