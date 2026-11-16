import "server-only";

import { randomUUID } from "node:crypto";
import { Prisma, type PrismaClient } from "@prisma/client";

import { can, type Principal } from "@/lib/auth/permissions";
import { stageToLegacyStatus } from "@/lib/crm/stages";
import { db } from "@/lib/db/client";
import { leadWhereForScope, resolveCrmAccessScope } from "@/lib/services/crm-access-service";
import { prepareInquiryCustomerLinks } from "@/lib/services/customer-service";
import { inquiryListQuerySchema, manualInquirySchema, type InquiryListQuery } from "@/lib/validation/crm";
import {
  LeadConflictError,
  LeadNotFoundError,
  LeadPermissionError,
  LeadValidationError,
  transitionLeadStage,
  type LeadStageChange,
} from "@/lib/services/crm-stage-service";
import {
  escapeInquirySpreadsheetCell,
  leadActivitySchema,
  leadAssignmentSchema,
  leadStageUpdateSchema,
  leadUpdateSchema,
} from "@/lib/validation/inquiries";

export {
  LeadConflictError,
  LeadNotFoundError,
  LeadPermissionError,
  LeadValidationError,
};

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

function assertReadPermission(principal: Principal) {
  if (!can(principal, "lead.read.all") && !can(principal, "lead.read.team") &&
    !can(principal, "lead.read.assigned", { assigneeId: principal.id, assignmentActive: true })) throw new LeadPermissionError();
}

function assertUpdate(principal: Principal, assignment: { assigneeId: string; endedAt: Date | null } | null) {
  if (can(principal, "lead.update.all")) return;
  if (can(principal, "lead.update.assigned", {
    assigneeId: assignment?.assigneeId,
    assignmentActive: assignment?.endedAt === null,
  })) return;
  throw new LeadPermissionError();
}

async function authorizeStageUpdate(
  transaction: Prisma.TransactionClient,
  principal: Principal,
  assignment: { assigneeId: string; endedAt: Date | null } | null,
): Promise<boolean> {
  if (can(principal, "lead.update.all")) return true;
  if (assignment && can(principal, "lead.update.team")) {
    const now = new Date();
    const activeMembership = { startsAt: { lte: now }, OR: [{ endsAt: null }, { endsAt: { gt: now } }] };
    const managedTeam = await transaction.crmTeam.findFirst({
      where: {
        AND: [
          { memberships: { some: { ...activeMembership, userId: principal.id, role: "MANAGER" } } },
          { memberships: { some: { ...activeMembership, userId: assignment.assigneeId } } },
        ],
      },
      select: { id: true },
    });
    if (managedTeam) return true;
  }
  assertUpdate(principal, assignment);
  return false;
}

/** Current-owner authorization is independent of destination user eligibility. */
async function resolveAssignmentScope(
  transaction: Prisma.TransactionClient,
  principal: Principal,
  assignment: { assigneeId: string; endedAt: Date | null } | null,
) {
  if (can(principal, "lead.assign")) return { kind: "ALL" as const };
  if (!can(principal, "lead.assign.team") || !assignment) return { kind: "NONE" as const };
  const scope = await resolveCrmAccessScope(transaction, { ...principal, roles: ["SALES_MANAGER"] });
  return scope.kind === "ASSIGNEES" && scope.assigneeIds.includes(assignment.assigneeId)
    ? scope : { kind: "NONE" as const };
}

async function mutationCapabilities(
  transaction: Prisma.TransactionClient,
  principal: Principal,
  assignment: { assigneeId: string; endedAt: Date | null } | null,
) {
  const [canEditStage, assignmentScope] = await Promise.all([
    authorizeStageUpdate(transaction, principal, assignment).then(() => true, (error: unknown) => {
      if (error instanceof LeadPermissionError) return false;
      throw error;
    }),
    resolveAssignmentScope(transaction, principal, assignment),
  ]);
  // Basic notes use the same authorizer as stage updates in addActivity.
  return { canEditStage, canAddNote: canEditStage, canAssign: assignmentScope.kind !== "NONE" };
}

async function queryWhere(database: Pick<PrismaClient, "crmTeamMembership">, principal: Principal, query: InquiryListQuery): Promise<Prisma.LeadWhereInput> {
  const scope = await resolveCrmAccessScope(database, principal);
  const owner = query.ownerId ?? query.assigneeId;
  if (owner && scope.kind !== "ALL" && (scope.kind === "NONE" || !scope.assigneeIds.includes(owner))) throw new LeadPermissionError();
  return { AND: [leadWhereForScope(scope), {
    status: query.status,
    stage: query.stageCode ? { code: query.stageCode } : undefined,
    customerLevel: query.customerLevel,
    country: query.country ?? undefined,
    sourceChannel: query.sourceChannel,
    createdAt: query.createdFrom || query.createdTo ? { gte: query.createdFrom, lte: query.createdTo } : undefined,
    nextFollowUpAt: query.nextFollowUpFrom || query.nextFollowUpTo ? { gte: query.nextFollowUpFrom, lte: query.nextFollowUpTo } : undefined,
    assignments: owner ? { some: { assigneeId: owner, endedAt: null } } : undefined,
    OR: query.query ? [
      { name: { contains: query.query, mode: "insensitive" } },
      { email: { contains: query.query, mode: "insensitive" } },
      { company: { contains: query.query, mode: "insensitive" } },
      { inquiryNumber: { contains: query.query, mode: "insensitive" } },
    ] : undefined,
  }, query.overdue === undefined ? {} : query.overdue ? {
    nextFollowUpAt: { lt: new Date() }, status: { notIn: ["WON", "LOST", "SPAM"] },
  } : { OR: [{ nextFollowUpAt: null }, { nextFollowUpAt: { gte: new Date() } }, { status: { in: ["WON", "LOST", "SPAM"] } }] }] };
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

  async createManual(principal: Principal, rawInput: unknown) {
    if (!can(principal, "inquiry.create")) throw new LeadPermissionError();
    const input = manualInquirySchema.parse(rawInput);
    if (!can(principal, "lead.read.all") && !input.assigneeId) throw new LeadValidationError("Choose an initial assignee.");
    return runLeadSerializable(this.database, async (transaction) => {
      if (input.assigneeId) {
        if (!can(principal, "lead.assign")) {
          const scope = await resolveCrmAccessScope(transaction, { ...principal, roles: ["SALES_MANAGER"] });
          if (scope.kind !== "ASSIGNEES" || !scope.assigneeIds.includes(input.assigneeId)) throw new LeadPermissionError();
        }
        const assignee = await transaction.user.findFirst({
          where: { id: input.assigneeId, isActive: true, roles: { some: { role: { key: "SALES" } } } },
          select: { id: true },
        });
        if (!assignee) throw new LeadValidationError("Assignee must be an active Sales user.");
      }
      const links = await prepareInquiryCustomerLinks(transaction, principal, input);
      const stage = await transaction.crmStage.findFirst({ where: { code: "NEW_INQUIRY", isActive: true }, select: { id: true } });
      if (!stage) throw new LeadValidationError("Default inquiry stage is unavailable.");
      const inquiry = await transaction.lead.create({ data: {
        name: input.name, email: input.email, message: input.message,
        phone: input.phone, whatsapp: input.whatsapp, country: input.country,
        company: input.companyName ?? input.company?.name,
        inquiryNumber: `INQ-${randomUUID().toUpperCase()}`,
        recordOrigin: "MANUAL", sourceChannel: input.sourceChannel,
        customerLevel: input.customerLevel, nextFollowUpAt: input.nextFollowUpAt,
        contactId: links.contactId, companyId: links.companyId, stageId: stage.id,
        createdById: principal.id, updatedById: principal.id,
      } });
      if (input.assigneeId) await transaction.leadAssignment.create({ data: {
        leadId: inquiry.id, assigneeId: input.assigneeId, assignedById: principal.id,
      } });
      await transaction.leadStageHistory.create({ data: {
        leadId: inquiry.id, newStageId: stage.id, newStatus: "NEW", source: "CRM_API", actorId: principal.id,
      } });
      await transaction.auditLog.create({ data: {
        actorId: principal.id, action: "inquiry.create", entityType: "Lead", entityId: inquiry.id,
        after: { version: inquiry.version, stageId: stage.id, contactId: inquiry.contactId, companyId: inquiry.companyId, assigneeId: input.assigneeId ?? null },
      } });
      return { inquiry, duplicateCandidates: links.duplicateCandidates };
    });
  }

  async listStages(principal: Principal) {
    assertReadPermission(principal);
    return this.database.crmStage.findMany({
      where: { isActive: true }, orderBy: [{ position: "asc" }, { id: "asc" }],
      select: { id: true, code: true, name: true, color: true, position: true, isTerminal: true, requiresReason: true },
    });
  }

  async listAssignees(principal: Principal, mode: "read" | "assign") {
    if (mode === "read") assertReadPermission(principal);
    else if (!can(principal, "lead.assign") && !can(principal, "lead.assign.team")) throw new LeadPermissionError();

    const scope = mode === "assign" && can(principal, "lead.assign")
      ? { kind: "ALL" as const }
      : await resolveCrmAccessScope(this.database, mode === "assign" ? { ...principal, roles: ["SALES_MANAGER"] } : principal);
    if (scope.kind === "NONE") return [];

    return this.database.user.findMany({
      where: {
        isActive: true,
        roles: { some: { role: { key: "SALES" } } },
        id: scope.kind === "ASSIGNEES" ? { in: scope.assigneeIds } : undefined,
      },
      select: { id: true, name: true },
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });
  }

  async list(principal: Principal, rawQuery: unknown) {
    assertReadPermission(principal);
    const query = inquiryListQuerySchema.parse(rawQuery);
    return this.database.$transaction(async (transaction) => {
      const where = await queryWhere(transaction, principal, query);
      const [items, total] = await Promise.all([
        transaction.lead.findMany({
          where,
          include: { interestedProduct: { select: { name: true } }, stage: true, assignments: { where: { endedAt: null }, include: { assignee: { select: { id: true, name: true, email: true } } } } },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (query.page - 1) * query.pageSize, take: query.pageSize,
        }),
        transaction.lead.count({ where }),
      ]);
      return { items, total, page: query.page, pageSize: query.pageSize };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  }

  async get(principal: Principal, leadId: string) {
    assertReadPermission(principal);
    return this.database.$transaction(async (transaction) => {
      const scope = await resolveCrmAccessScope(transaction, principal);
      const lead = await transaction.lead.findFirst({ where: { AND: [{ id: leadId }, leadWhereForScope(scope)] }, include: { ...leadDetailInclude, stage: true } });
      if (!lead) {
        if (await transaction.lead.count({ where: { id: leadId } })) throw new LeadPermissionError();
        throw new LeadNotFoundError();
      }
      return { ...lead, capabilities: await mutationCapabilities(transaction, principal, currentAssignment(lead)) };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  }

  async assign(principal: Principal, leadId: string, rawInput: unknown) {
    if (!can(principal, "lead.assign") && !can(principal, "lead.assign.team")) throw new LeadPermissionError();
    const input = leadAssignmentSchema.parse(rawInput);
    return runLeadSerializable(this.database, async (transaction) => {
      const [lead, assignee] = await Promise.all([
        transaction.lead.findUnique({ where: { id: leadId }, include: { assignments: true } }),
        transaction.user.findFirst({
          where: { id: input.assigneeId, isActive: true, roles: { some: { role: { key: "SALES" } } } },
        }),
      ]);
      if (!lead) throw new LeadNotFoundError();
      const assignmentScope = await resolveAssignmentScope(transaction, principal, currentAssignment(lead));
      if (assignmentScope.kind === "NONE" ||
        (assignmentScope.kind === "ASSIGNEES" && !assignmentScope.assigneeIds.includes(input.assigneeId))) throw new LeadPermissionError();
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
    if (input.status !== undefined) {
      return this.applyStageChange(principal, {
        leadId,
        expectedVersion: input.version,
        legacyStatus: input.status,
        nextFollowUpAt: input.nextFollowUpAt,
        source: "LEGACY_API",
      });
    }
    return runLeadSerializable(this.database, async (transaction) => {
      const lead = await transaction.lead.findUnique({ where: { id: leadId }, include: { assignments: true } });
      if (!lead) throw new LeadNotFoundError();
      await authorizeStageUpdate(transaction, principal, currentAssignment(lead));
      const updatedCount = await transaction.lead.updateMany({
        where: { id: leadId, version: input.version },
        data: { nextFollowUpAt: input.nextFollowUpAt, version: { increment: 1 } },
      });
      if (updatedCount.count !== 1) throw new LeadConflictError();
      const updated = await transaction.lead.findUniqueOrThrow({ where: { id: leadId } });
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

  async updateStage(principal: Principal, leadId: string, rawInput: unknown) {
    const { version, ...input } = leadStageUpdateSchema.parse(rawInput);
    return this.applyStageChange(principal, {
      ...input,
      leadId,
      expectedVersion: version,
      source: "CRM_API",
    });
  }

  private async applyStageChange(principal: Principal, input: LeadStageChange) {
    return runLeadSerializable(this.database, async (transaction) => {
      const lead = await transaction.lead.findUnique({
        where: { id: input.leadId },
        select: { status: true, version: true, assignments: { where: { endedAt: null } } },
      });
      if (!lead) throw new LeadNotFoundError();

      const allowRollback = await authorizeStageUpdate(transaction, principal, currentAssignment(lead));
      const status = input.source === "CRM_API" ? stageToLegacyStatus(input.stageCode) : input.legacyStatus;
      if (!allowRollback && ["WON", "LOST", "SPAM"].includes(lead.status) && status !== lead.status) {
        throw new LeadPermissionError();
      }
      if (lead.version !== input.expectedVersion) throw new LeadConflictError();

      return transitionLeadStage(transaction, { ...input, actorId: principal.id, allowRollback });
    });
  }

  async addActivity(principal: Principal, leadId: string, rawInput: unknown) {
    const input = leadActivitySchema.parse(rawInput);
    return runLeadSerializable(this.database, async (transaction) => {
      const lead = await transaction.lead.findUnique({ where: { id: leadId }, include: { assignments: true } });
      if (!lead) throw new LeadNotFoundError();
      await authorizeStageUpdate(transaction, principal, currentAssignment(lead));
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
    if (!all && !assigned && !can(principal, "lead.export.team")) throw new LeadPermissionError();
    const query = inquiryListQuerySchema.parse({ ...(rawQuery as object), page: 1, pageSize: 100 });
    // Export action scope excludes viewer-only teams even when the principal also holds CRM_VIEWER.
    const exportPrincipal = !all
      ? { ...principal, roles: principal.roles.filter((role) => role !== "CRM_VIEWER") } : principal;
    const where = await queryWhere(this.database, exportPrincipal, query);
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
