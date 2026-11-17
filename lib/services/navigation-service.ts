import "server-only";

import { revalidatePath } from "next/cache";
import { Prisma, type PrismaClient } from "@prisma/client";
import { z, ZodError } from "zod";

import { can, type Permission, type Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { DEFAULT_NAVIGATION } from "@/lib/navigation/default-navigation";
import { parseNavigationSnapshot, type NavigationSnapshot } from "@/lib/navigation/schema";

type Revalidate = (path: string) => void | Promise<void>;

export class NavigationPermissionError extends Error {
  constructor(permission: Permission) {
    super(`Missing required permission: ${permission}`);
    this.name = "NavigationPermissionError";
  }
}

export class NavigationNotFoundError extends Error {}
export class NavigationConflictError extends Error {}
export class NavigationValidationError extends Error {}

const saveSchema = z.object({
  version: z.number().int().min(0),
  document: z.unknown(),
}).strict();
const versionSchema = z.object({ version: z.number().int().positive() }).strict();
const rollbackSchema = versionSchema.extend({ targetVersion: z.number().int().positive() }).strict();

const navigationPaths = ["/", "/products", "/factory", "/news", "/shipping-highlights", "/contact"] as const;

function assertPermission(principal: Principal, permission: Permission) {
  if (!can(principal, permission)) throw new NavigationPermissionError(permission);
}

function json(document: NavigationSnapshot) {
  return document as unknown as Prisma.InputJsonValue;
}

function parseDocument(raw: unknown) {
  try {
    return parseNavigationSnapshot(raw);
  } catch (error) {
    if (error instanceof ZodError) throw new NavigationValidationError(error.message);
    throw error;
  }
}

export function isNavigationTransactionConflict(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2034";
}

function isUniqueConflict(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function throwTransactionError(error: unknown): never {
  if (isNavigationTransactionConflict(error) || isUniqueConflict(error)) {
    throw new NavigationConflictError("Navigation changed concurrently. Reload before retrying.");
  }
  throw error;
}

export class NavigationService {
  constructor(
    private readonly database: PrismaClient = db,
    private readonly revalidate: Revalidate = revalidatePath,
  ) {}

  async get(principal: Principal) {
    assertPermission(principal, "navigation.read");
    const document = await this.database.navigationDocument.findUnique({ where: { key: "PRIMARY" } });
    return document ?? {
      id: null,
      key: "PRIMARY",
      status: "DRAFT" as const,
      draftContent: DEFAULT_NAVIGATION,
      publishedContent: null,
      version: 0,
      publishedVersion: null,
      publishedAt: null,
      createdAt: null,
      updatedAt: null,
    };
  }

  async saveDraft(principal: Principal, rawInput: unknown) {
    assertPermission(principal, "navigation.write");
    const input = saveSchema.parse(rawInput);
    const document = parseDocument(input.document);
    try {
      return await this.database.$transaction(async (transaction) => {
        const current = await transaction.navigationDocument.findUnique({ where: { key: "PRIMARY" } });
        if (!current) {
          if (input.version !== 0) throw new NavigationConflictError("Navigation changed. Reload before saving.");
          const created = await transaction.navigationDocument.create({
            data: { key: "PRIMARY", draftContent: json(document) },
          });
          await transaction.navigationVersion.create({
            data: {
              navigationDocumentId: created.id,
              version: created.version,
              snapshot: json(document),
              action: "CREATE",
              createdById: principal.id,
            },
          });
          await transaction.auditLog.create({
            data: {
              actorId: principal.id,
              action: "navigation.create",
              entityType: "NavigationDocument",
              entityId: created.id,
              after: { key: created.key, version: created.version },
            },
          });
          return created;
        }

        const nextVersion = current.version + 1;
        const changed = await transaction.navigationDocument.updateMany({
          where: { id: current.id, version: input.version },
          data: { draftContent: json(document), status: "DRAFT", version: { increment: 1 } },
        });
        if (changed.count !== 1) throw new NavigationConflictError("Navigation changed. Reload before saving.");
        await transaction.navigationVersion.create({
          data: {
            navigationDocumentId: current.id,
            version: nextVersion,
            snapshot: json(document),
            action: "SAVE",
            createdById: principal.id,
          },
        });
        const updated = await transaction.navigationDocument.findUniqueOrThrow({ where: { id: current.id } });
        await transaction.auditLog.create({
          data: {
            actorId: principal.id,
            action: "navigation.save",
            entityType: "NavigationDocument",
            entityId: current.id,
            before: { version: current.version },
            after: { version: updated.version },
          },
        });
        return updated;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof NavigationConflictError) throw error;
      throwTransactionError(error);
    }
  }

  async publish(principal: Principal, rawInput: unknown) {
    assertPermission(principal, "navigation.publish");
    const input = versionSchema.parse(rawInput);
    let published;
    try {
      published = await this.database.$transaction(async (transaction) => {
        const current = await transaction.navigationDocument.findUnique({ where: { key: "PRIMARY" } });
        if (!current) throw new NavigationNotFoundError("Navigation was not found.");
        const document = parseDocument(current.draftContent);
        const nextVersion = current.version + 1;
        const publishedAt = new Date();
        const changed = await transaction.navigationDocument.updateMany({
          where: { id: current.id, version: input.version },
          data: {
            status: "PUBLISHED",
            publishedContent: json(document),
            publishedVersion: nextVersion,
            publishedAt,
            version: { increment: 1 },
          },
        });
        if (changed.count !== 1) throw new NavigationConflictError("Navigation changed. Reload before publishing.");
        await transaction.navigationVersion.create({
          data: {
            navigationDocumentId: current.id,
            version: nextVersion,
            snapshot: json(document),
            action: "PUBLISH",
            createdById: principal.id,
            publishedAt,
          },
        });
        const updated = await transaction.navigationDocument.findUniqueOrThrow({ where: { id: current.id } });
        await transaction.auditLog.create({
          data: {
            actorId: principal.id,
            action: "navigation.publish",
            entityType: "NavigationDocument",
            entityId: current.id,
            before: { status: current.status, version: current.version },
            after: { status: updated.status, version: updated.version, publishedVersion: updated.publishedVersion },
          },
        });
        return updated;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof NavigationConflictError || error instanceof NavigationNotFoundError || error instanceof NavigationValidationError) throw error;
      throwTransactionError(error);
    }

    for (const path of navigationPaths) {
      try {
        await this.revalidate(path);
      } catch (error) {
        console.error("Navigation published but cache invalidation failed", path, error instanceof Error ? error.message : "UnknownError");
      }
    }
    return published;
  }

  async versions(principal: Principal) {
    assertPermission(principal, "navigation.read");
    const document = await this.database.navigationDocument.findUnique({ where: { key: "PRIMARY" }, select: { id: true } });
    if (!document) return [];
    return this.database.navigationVersion.findMany({
      where: { navigationDocumentId: document.id },
      select: {
        id: true,
        version: true,
        snapshot: true,
        action: true,
        createdAt: true,
        publishedAt: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { version: "desc" },
    });
  }

  async rollback(principal: Principal, rawInput: unknown) {
    assertPermission(principal, "navigation.write");
    const input = rollbackSchema.parse(rawInput);
    try {
      return await this.database.$transaction(async (transaction) => {
        const current = await transaction.navigationDocument.findUnique({ where: { key: "PRIMARY" } });
        if (!current) throw new NavigationNotFoundError("Navigation was not found.");
        const target = await transaction.navigationVersion.findUnique({
          where: { navigationDocumentId_version: { navigationDocumentId: current.id, version: input.targetVersion } },
        });
        if (!target) throw new NavigationNotFoundError("Navigation version was not found.");
        const document = parseDocument(target.snapshot);
        const nextVersion = current.version + 1;
        const changed = await transaction.navigationDocument.updateMany({
          where: { id: current.id, version: input.version },
          data: { draftContent: json(document), status: "DRAFT", version: { increment: 1 } },
        });
        if (changed.count !== 1) throw new NavigationConflictError("Navigation changed. Reload before rolling back.");
        await transaction.navigationVersion.create({
          data: {
            navigationDocumentId: current.id,
            version: nextVersion,
            snapshot: json(document),
            action: "ROLLBACK",
            createdById: principal.id,
          },
        });
        const updated = await transaction.navigationDocument.findUniqueOrThrow({ where: { id: current.id } });
        await transaction.auditLog.create({
          data: {
            actorId: principal.id,
            action: "navigation.rollback",
            entityType: "NavigationDocument",
            entityId: current.id,
            before: { version: current.version },
            after: { version: updated.version, targetVersion: input.targetVersion },
          },
        });
        return updated;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof NavigationConflictError || error instanceof NavigationNotFoundError || error instanceof NavigationValidationError) throw error;
      throwTransactionError(error);
    }
  }
}
