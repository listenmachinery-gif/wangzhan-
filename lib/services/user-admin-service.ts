import "server-only";

import { Prisma, type PrismaClient } from "@prisma/client";
import { can, type Principal, type RoleKey } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { userUpdateSchema } from "@/lib/validation/users";

export class UserAdminPermissionError extends Error {}
export class UserAdminConflictError extends Error {}
export class UserAdminNotFoundError extends Error {}
export class UserAdminValidationError extends Error {}

const userSelect = {
  id: true, email: true, name: true, isActive: true, twoFactorEnabled: true, createdAt: true, updatedAt: true,
  roles: { select: { role: { select: { key: true, name: true } } }, orderBy: { role: { key: "asc" as const } } },
} as const;

function present<T extends { twoFactorEnabled: boolean }>(user: T) {
  if (user.twoFactorEnabled) throw new UserAdminValidationError("2FA enrollment is not supported in P0.");
  const { twoFactorEnabled, ...rest } = user;
  void twoFactorEnabled;
  return { ...rest, twoFactor: { enabled: false, configurable: false } };
}

export class UserAdminService {
  constructor(private readonly database: PrismaClient = db) {}

  async list(principal: Principal) {
    if (!can(principal, "user.manage")) throw new UserAdminPermissionError("User management permission is required.");
    const users = await this.database.user.findMany({ select: userSelect, orderBy: { email: "asc" } });
    return users.map(present);
  }

  async get(principal: Principal, id: string) {
    if (!can(principal, "user.manage")) throw new UserAdminPermissionError("User management permission is required.");
    const user = await this.database.user.findUnique({ where: { id }, select: userSelect });
    if (!user) throw new UserAdminNotFoundError("User was not found.");
    const roles = user.roles.map(({ role }) => role.key as RoleKey);
    if (!can(principal, "user.manage", { targetRoles: roles })) throw new UserAdminPermissionError("This account is protected.");
    return present(user);
  }

  async update(principal: Principal, id: string, rawInput: unknown) {
    const parsed = userUpdateSchema.safeParse(rawInput);
    if (!parsed.success) throw new UserAdminValidationError(parsed.error.issues[0]?.message ?? "Invalid user update.");
    const input = parsed.data;
    const current = await this.database.user.findUnique({ where: { id }, include: { roles: { include: { role: true } } } });
    if (!current) throw new UserAdminNotFoundError("User was not found.");
    const currentRoles = current.roles.map(({ role }) => role.key as RoleKey);
    if (!can(principal, "user.manage", { targetRoles: currentRoles }) || !can(principal, "user.manage", { targetRoles: input.roles })) {
      throw new UserAdminPermissionError("Role escalation or protected-account changes are not allowed.");
    }
    try {
      return await this.database.$transaction(async (transaction) => {
        if (currentRoles.includes("SUPER_ADMIN") && (!input.isActive || !input.roles.includes("SUPER_ADMIN"))) {
          const activeSuperAdmins = await transaction.user.count({ where: { isActive: true, roles: { some: { role: { key: "SUPER_ADMIN" } } } } });
          if (activeSuperAdmins <= 1) throw new UserAdminValidationError("The last active Super Admin cannot be disabled or demoted.");
        }
        const changed = await transaction.user.updateMany({ where: { id, updatedAt: new Date(input.updatedAt) }, data: { name: input.name, isActive: input.isActive } });
        if (changed.count !== 1) throw new UserAdminConflictError("User changed. Reload before saving.");
        const roles = await transaction.role.findMany({ where: { key: { in: input.roles } }, select: { id: true, key: true } });
        if (roles.length !== input.roles.length) throw new UserAdminValidationError("One or more roles are not configured.");
        await transaction.userRole.deleteMany({ where: { userId: id } });
        await transaction.userRole.createMany({ data: roles.map((role) => ({ userId: id, roleId: role.id })) });
        if (!input.isActive) await transaction.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
        await transaction.auditLog.create({ data: { actorId: principal.id, action: "user.update", entityType: "User", entityId: id, before: { isActive: current.isActive, roles: currentRoles }, after: { isActive: input.isActive, roles: input.roles } } });
        return present(await transaction.user.findUniqueOrThrow({ where: { id }, select: userSelect }));
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") throw new UserAdminConflictError("User changed. Reload before saving.");
      throw error;
    }
  }
}
