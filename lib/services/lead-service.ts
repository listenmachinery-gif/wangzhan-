import "server-only";

import { Prisma, type PrismaClient } from "@prisma/client";

import { can, type Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import {
  escapeInquirySpreadsheetCell,
  leadActivitySchema,
  leadAssignmentSchema,
  leadListQuerySchema,
  leadUpdateSchema,
  type LeadListQuery,
} from "@/lib/validation/inquiries";

export class LeadPermissionError extends Error {
  constructor() {
    super("Permission denied for this lead.");
    this.name = "LeadPermissionError";
  }
}

export class LeadNotFoundError extends Error {
  constructor() {
    super("Lead was not found.");
    this.name = "LeadNotFoundError";
  }
}

export class LeadConflictError extends Error {
  constructor() {
    super("The lead has changed. Reload before saving.");
    this.name = "LeadConflictError";
  }
}

export class LeadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeadValidationError";
  }
}

const leadDetailInclude = {
  interestedProduct: { select: { id: true, name: true, slug: true } },
  assignments: {
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      assignedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { assignedAt: "desc" as const },
  },
  activities: {
    include: { actor: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" as const },
  },
  notificationAttempts: { orderBy: { attemptedAt: "desc" as const } },
} as const;

function currentAssignment(lead: { assignments: Array<{ assigneeId: string; endedAt: Date | null }> }) {
  return lead.assignments.find(({ endedAt }) => endedAt === null) ?? null;
}

function assignedWhere(principal: Principal): Prisma.LeadWhereInput {
  return { assignments: { some: { assigneeId: principal.id, endedAt: null } } };
}

function assertRead(principal: Principal, assignment: { assigneeId: string; endedAt: Date | null } | null) {
  if (can(principal, "lead.read.all")) return;
  if (can(principal, "lead.read.assigned", {
    assigneeId: assignment?.assigneeId,
    assignmentActive: assignment?.endedAt === null,
  })) return;
  throw new LeadPermissionError();
}

function assertUpdate(principal: Principal, assignment: { assigneeId: string; endedAt: Date | null } | null) {
  if (can(principal, "lead.update.all")) return;
  if (can(principal, "lead.update.assigned", {
    assigneeId: assignment?.assigneeId,
    assignmentActive: assignment?.endedAt === null,
  })) return;
  throw new LeadPermissionError();
}

function queryWhere(principal: Principal, query: LeadListQuery): Prisma.LeadWhereInput {
  const scope = can(principal, "lead.read.all") ? {} : assignedWhere(principal);
  return {
    ...scope,
    status: query.status,
    createdAt: query.createdFrom || query.createdTo ? { gte: query.createdFrom, lte: query.createdTo } : undefined,
    assignments: query.assigneeId
      ? { some: { assigneeId: query.assigneeId, endedAt: null } }
      : scope.assignments,
    OR: query.query ? [
      { name: { contains: query.query, mode: "insensitive" } },
      { email: { contains: query.query, mode: "insensitive" } },
      { company: { contains: query.query, mode: "insensitive" } },
    ] : undefined,
  };
}

function csvCell(value: unknown) {
  const safe = escapeInquirySpreadsheetCell(value === null || value === undefined ? "" : String(value));
  return /[",\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}

async function runLeadSerializable<T>(
  database: PrismaClient,
  work: (transaction: Prisma.TransactionClient) => Promise<T>,
) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      return await database.$transaction(work, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      const retryable = (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034")
        || (error instanceof Error && error.message.includes("TransactionWriteConflict"));
      if (!retryable || attempt === 3) throw error;
      await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 5));
    }
  }
  throw new Error("Serializable lead transaction exhausted retries.");
}

export class LeadService {
  constructor(private readonly database: PrismaClient = db) {}

  async list(principal: Principal, rawQuery: unknown) {
    if (!can(principal, "lead.read.all") && !can(principal, "lead.read.assigned", {
      assigneeId: principal.id,
      assignmentActive: true,
    })) throw new LeadPermissionError();
    const query = leadListQuerySchema.parse(rawQuery);
    if (!can(principal, "lead.read.all") && query.assigneeId && query.assigneeId !== principal.id) {
      throw new LeadPermissionError();
    }
    const where = queryWhere(principal, query);
    const [items, total] = await this.database.$transaction([
      this.database.lead.findMany({
        where,
        include: {
          assignments: {
            where: { endedAt: null },
            include: { assignee: { select: { id: true, name: true, email: true } } },
          },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.database.lead.count({ where }),
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async get(principal: Principal, leadId: string) {
    const lead = await this.database.lead.findUnique({ where: { id: leadId }, include: leadDetailInclude });
    if (!lead) throw new LeadNotFoundError();
    assertRead(principal, currentAssignment(lead));
    return lead;
  }

  async assign(principal: Principal, leadId: string, rawInput: unknown) {
    if (!can(principal, "lead.assign")) throw new LeadPermissionError();
    const input = leadAssignmentSchema.parse(rawInput);
    return runLeadSerializable(this.database, async (transaction) => {
      const [lead, assignee] = await Promise.all([
        transaction.lead.findUnique({ where: { id: leadId }, include: { assignments: true } }),
        transaction.user.findFirst({
          where: { id: input.assigneeId, isActive: true, roles: { some: { role: { key: "SALES" } } } },
        }),
      ]);
      if (!lead) throw new LeadNotFoundError();
      if (!assignee) throw new LeadValidationError("Assignee must be an active Sales user.");
      if (lead.version !== input.version) throw new LeadConflictError();
      const active = currentAssignment(lead);
      if (active?.assigneeId === assignee.id) return lead;
      await transaction.leadAssignment.updateMany({
        where: { leadId, endedAt: null },
        data: { endedAt: new Date() },
      });
      await transaction.leadAssignment.create({
        data: { leadId, assigneeId: assignee.id, assignedById: principal.id },
      });
      const updated = await transaction.lead.update({
        where: { id: leadId },
        data: { version: { increment: 1 } },
      });
      await Promise.all([
        transaction.leadActivity.create({
          data: {
            leadId,
            actorId: principal.id,
            type: "ASSIGNMENT",
            content: `Assigned to ${assignee.name}.`,
            metadata: { fromAssigneeId: active?.assigneeId ?? null, toAssigneeId: assignee.id },
          },
        }),
        transaction.auditLog.create({
          data: {
            actorId: principal.id,
            action: "lead.assign",
            entityType: "Lead",
            entityId: leadId,
            before: { assigneeId: active?.assigneeId ?? null, version: lead.version },
            after: { assigneeId: assignee.id, version: updated.version },
          },
        }),
      ]);
      return updated;
    });
  }

  async update(principal: Principal, leadId: string, rawInput: unknown) {
    const input = leadUpdateSchema.parse(rawInput);
    return runLeadSerializable(this.database, async (transaction) => {
      const lead = await transaction.lead.findUnique({ where: { id: leadId }, include: { assignments: true } });
      if (!lead) throw new LeadNotFoundError();
      const assignment = currentAssignment(lead);
      assertUpdate(principal, assignment);
      const assignedOnly = !can(principal, "lead.update.all");
      if (assignedOnly && ["WON", "LOST", "SPAM"].includes(lead.status) && input.status && input.status !== lead.status) {
        throw new LeadPermissionError();
      }
      const updatedCount = await transaction.lead.updateMany({
        where: { id: leadId, version: input.version },
        data: {
          status: input.status,
          nextFollowUpAt: input.nextFollowUpAt,
          version: { increment: 1 },
        },
      });
      if (updatedCount.count !== 1) throw new LeadConflictError();
      const updated = await transaction.lead.findUniqueOrThrow({ where: { id: leadId } });
      if (input.status && input.status !== lead.status) {
        await transaction.leadActivity.create({
          data: {
            leadId,
            actorId: principal.id,
            type: "STATUS_CHANGE",
            content: `Status changed from ${lead.status} to ${input.status}.`,
            metadata: { from: lead.status, to: input.status },
          },
        });
      }
      await transaction.auditLog.create({
        data: {
          actorId: principal.id,
          action: "lead.update",
          entityType: "Lead",
          entityId: leadId,
          before: { status: lead.status, nextFollowUpAt: lead.nextFollowUpAt, version: lead.version },
          after: { status: updated.status, nextFollowUpAt: updated.nextFollowUpAt, version: updated.version },
        },
      });
      return updated;
    });
  }

  async addActivity(principal: Principal, leadId: string, rawInput: unknown) {
    const input = leadActivitySchema.parse(rawInput);
    return runLeadSerializable(this.database, async (transaction) => {
      const lead = await transaction.lead.findUnique({ where: { id: leadId }, include: { assignments: true } });
      if (!lead) throw new LeadNotFoundError();
      assertUpdate(principal, currentAssignment(lead));
      const activity = await transaction.leadActivity.create({ data: { leadId, actorId: principal.id, ...input } });
      await transaction.auditLog.create({
        data: {
          actorId: principal.id,
          action: "lead.activity.create",
          entityType: "Lead",
          entityId: leadId,
          after: { activityId: activity.id, type: activity.type },
        },
      });
      return activity;
    });
  }

  async exportCsv(principal: Principal, rawQuery: unknown) {
    const all = can(principal, "lead.export.all");
    const assigned = can(principal, "lead.export.assigned", { assigneeId: principal.id, assignmentActive: true });
    if (!all && !assigned) throw new LeadPermissionError();
    const query = leadListQuerySchema.parse({ ...(rawQuery as object), page: 1, pageSize: 100 });
    if (!all && query.assigneeId && query.assigneeId !== principal.id) throw new LeadPermissionError();
    const where = queryWhere(principal, query);
    const leads = await this.database.lead.findMany({
      where,
      include: { assignments: { where: { endedAt: null }, include: { assignee: { select: { email: true } } } } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 10_000,
    });
    const header = ["id", "createdAt", "status", "name", "company", "email", "phone", "country", "assignee", "message"];
    const rows = leads.map((lead) => [
      lead.id,
      lead.createdAt.toISOString(),
      lead.status,
      lead.name,
      lead.company,
      lead.email,
      lead.whatsapp ?? lead.phone,
      lead.country,
      lead.assignments[0]?.assignee.email,
      lead.message,
    ].map(csvCell).join(","));
    return [header.join(","), ...rows].join("\r\n");
  }
}
