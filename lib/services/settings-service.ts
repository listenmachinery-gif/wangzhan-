import "server-only";

import { Prisma, type PrismaClient } from "@prisma/client";
import { can, type Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { SETTING_KEYS, settingInputSchema } from "@/lib/validation/settings";

export class SettingsPermissionError extends Error {}
export class SettingsConflictError extends Error {}
export class SettingsValidationError extends Error {}

export class SettingsService {
  constructor(private readonly database: PrismaClient = db) {}

  async list(principal: Principal) {
    if (!can(principal, "settings.write")) throw new SettingsPermissionError("Settings permission is required.");
    return this.database.siteSetting.findMany({
      where: { key: { in: [...SETTING_KEYS] } },
      select: { id: true, key: true, value: true, version: true, updatedAt: true },
      orderBy: { key: "asc" },
    });
  }

  async save(principal: Principal, rawInput: unknown) {
    const [record] = await this.saveMany(principal, [rawInput]);
    return record;
  }

  async saveMany(principal: Principal, rawInputs: unknown[]) {
    if (!can(principal, "settings.write")) throw new SettingsPermissionError("Settings permission is required.");
    if (!Array.isArray(rawInputs) || rawInputs.length < 1 || rawInputs.length > SETTING_KEYS.length) throw new SettingsValidationError("Invalid settings batch.");
    const inputs = rawInputs.map((rawInput) => {
      const parsed = settingInputSchema.safeParse(rawInput);
      if (!parsed.success) throw new SettingsValidationError(parsed.error.issues[0]?.message ?? "Invalid setting.");
      return parsed.data;
    });
    if (new Set(inputs.map(({ key }) => key)).size !== inputs.length) throw new SettingsValidationError("Setting keys must be unique.");
    try {
      return await this.database.$transaction(async (transaction) => {
        const records = [];
        for (const input of inputs) {
          const current = await transaction.siteSetting.findUnique({ where: { key: input.key } });
          if (!current) {
            if (input.version !== 0) throw new SettingsConflictError("Setting changed. Reload before saving.");
            const created = await transaction.siteSetting.create({ data: { key: input.key, value: input.value, version: 1 } });
            await transaction.auditLog.create({ data: { actorId: principal.id, action: "settings.update", entityType: "SiteSetting", entityId: input.key, after: { version: 1 } } });
            records.push(created);
            continue;
          }
          const changed = await transaction.siteSetting.updateMany({ where: { id: current.id, version: input.version }, data: { value: input.value, version: { increment: 1 } } });
          if (changed.count !== 1) throw new SettingsConflictError("Setting changed. Reload before saving.");
          const updated = await transaction.siteSetting.findUniqueOrThrow({ where: { id: current.id } });
          await transaction.auditLog.create({ data: { actorId: principal.id, action: "settings.update", entityType: "SiteSetting", entityId: input.key, before: { version: current.version }, after: { version: updated.version } } });
          records.push(updated);
        }
        return records;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2002", "P2034"].includes(error.code)) {
        throw new SettingsConflictError("Settings changed. Reload before saving.");
      }
      throw error;
    }
  }
}
