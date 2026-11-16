import "server-only";

import type { Lead, LeadStatus, Prisma } from "@prisma/client";

import {
  DEFAULT_CRM_STAGES,
  legacyStatusToDefaultStage,
  sameLegacyCompatibilityGroup,
  stageToLegacyStatus,
  type CrmStageCode,
} from "@/lib/crm/stages";

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

export type LeadStageChange = {
  leadId: string;
  expectedVersion: number;
  reasonCode?: string;
  reasonNote?: string;
  nextFollowUpAt?: Date | null;
} & (
  | { source: "LEGACY_API"; legacyStatus: LeadStatus; stageCode?: never }
  | { source: "CRM_API"; stageCode: CrmStageCode; legacyStatus?: never }
);

type StageTransitionInput = LeadStageChange & {
  actorId: string;
  allowRollback?: boolean;
};

export async function transitionLeadStage(
  transaction: Prisma.TransactionClient,
  input: StageTransitionInput,
): Promise<Lead> {
  const { leadId, actorId, expectedVersion, source } = input;
  const lead = await transaction.lead.findUnique({
    where: { id: leadId },
    include: { stage: true, preSpamStage: true },
  });
  if (!lead) throw new LeadNotFoundError();
  if (lead.version !== expectedVersion) throw new LeadConflictError();

  const status = input.source === "CRM_API" ? stageToLegacyStatus(input.stageCode) : input.legacyStatus;
  const wasSpam = lead.status === "SPAM";
  const isSpam = status === "SPAM";
  const currentStage = wasSpam ? lead.preSpamStage ?? lead.stage : lead.stage;
  const currentCode = DEFAULT_CRM_STAGES.find((code) => code === currentStage?.code) ?? null;
  const keepCurrentStage = isSpam || (
    (source === "LEGACY_API" || wasSpam) && sameLegacyCompatibilityGroup(currentCode, status)
  );
  const targetCode = input.stageCode ?? legacyStatusToDefaultStage(isSpam ? lead.status : status);
  let nextStage = keepCurrentStage ? currentStage : null;
  if (!nextStage && targetCode) {
    nextStage = await transaction.crmStage.findUnique({ where: { code: targetCode } });
    if (!nextStage) throw new LeadValidationError(`CRM stage "${targetCode}" is unavailable.`);
  }

  if (!input.allowRollback && currentStage && nextStage && nextStage.position < currentStage.position) {
    throw new LeadPermissionError();
  }

  const suppliedReason = input.reasonCode?.trim();
  if (source === "CRM_API" && (status === "LOST" || nextStage?.requiresReason) && !suppliedReason) {
    throw new LeadValidationError("A reason code is required for this stage.");
  }

  const preserveLossReason = status === "LOST" && source === "LEGACY_API" && !suppliedReason &&
    (lead.status === "LOST" || (wasSpam && currentStage?.code === "LOST"));
  const reasonCode = suppliedReason || (status === "LOST"
    ? (preserveLossReason && lead.lostReasonCode) || "LEGACY_API_NO_REASON"
    : null);
  const reasonNote = input.reasonNote?.trim() || (preserveLossReason ? lead.lostReasonNote : null);

  const stageId = nextStage?.id ?? null;
  const preSpamStageId = isSpam ? stageId : null;
  const [updated] = await transaction.lead.updateManyAndReturn({
    where: { id: leadId, version: expectedVersion },
    data: {
      status,
      stageId,
      preSpamStageId,
      nextFollowUpAt: input.nextFollowUpAt,
      lostReasonCode: status === "LOST" ? reasonCode : isSpam ? undefined : null,
      lostReasonNote: status === "LOST" ? reasonNote : isSpam ? undefined : null,
      version: { increment: 1 },
    },
  });
  if (!updated) throw new LeadConflictError();

  if (stageId && (stageId !== lead.stageId || isSpam !== wasSpam)) {
    await transaction.leadStageHistory.create({
      data: {
        leadId,
        previousStageId: lead.stageId,
        newStageId: stageId,
        previousStatus: lead.status,
        newStatus: status,
        actorId,
        reasonCode,
        reasonNote,
        source,
      },
    });
  }
  if (status !== lead.status) {
    await transaction.leadActivity.create({
      data: {
        leadId,
        actorId,
        type: "STATUS_CHANGE",
        content: `Status changed from ${lead.status} to ${status}.`,
        metadata: { from: lead.status, to: status },
      },
    });
  }
  await transaction.auditLog.create({
    data: {
      actorId,
      action: "lead.update",
      entityType: "Lead",
      entityId: leadId,
      before: {
        status: lead.status,
        stageId: lead.stageId,
        preSpamStageId: lead.preSpamStageId,
        nextFollowUpAt: lead.nextFollowUpAt,
        version: lead.version,
      },
      after: {
        status: updated.status,
        stageId: updated.stageId,
        preSpamStageId: updated.preSpamStageId,
        nextFollowUpAt: updated.nextFollowUpAt,
        version: updated.version,
        reasonCode,
        reasonNote,
        source,
      },
    },
  });
  return updated;
}
