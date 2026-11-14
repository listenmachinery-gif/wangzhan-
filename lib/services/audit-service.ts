import { db } from "@/lib/db/client";

export type AuditInput = {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  before?: object;
  after?: object;
  requestId?: string;
  ipHash?: string;
};

export function recordAudit(input: AuditInput) {
  return db.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      before: input.before,
      after: input.after,
      requestId: input.requestId,
      ipHash: input.ipHash,
    },
  });
}
