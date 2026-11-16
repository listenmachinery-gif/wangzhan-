import type { LeadStatus } from "@prisma/client";

export const DEFAULT_CRM_STAGES = Object.freeze([
  "NEW_INQUIRY",
  "TO_CONTACT",
  "CONTACTED",
  "REQUIREMENT_CONFIRMED",
  "SOLUTION_PREPARATION",
  "QUOTATION_SENT",
  "NEGOTIATION",
  "AWAITING_DECISION",
  "ORDER_CONFIRMED",
  "WON",
  "LOST",
  "ON_HOLD",
] as const);

export type CrmStageCode = (typeof DEFAULT_CRM_STAGES)[number];

const defaultStageByStatus: Readonly<Record<LeadStatus, CrmStageCode | null>> = {
  NEW: "NEW_INQUIRY",
  CONTACTED: "CONTACTED",
  IN_DISCUSSION: "NEGOTIATION",
  QUOTED: "QUOTATION_SENT",
  WON: "WON",
  LOST: "LOST",
  SPAM: null,
};

const statusByStage: Readonly<Record<CrmStageCode, Exclude<LeadStatus, "SPAM">>> = {
  NEW_INQUIRY: "NEW",
  TO_CONTACT: "NEW",
  CONTACTED: "CONTACTED",
  REQUIREMENT_CONFIRMED: "CONTACTED",
  SOLUTION_PREPARATION: "CONTACTED",
  QUOTATION_SENT: "QUOTED",
  NEGOTIATION: "IN_DISCUSSION",
  AWAITING_DECISION: "IN_DISCUSSION",
  ORDER_CONFIRMED: "WON",
  WON: "WON",
  LOST: "LOST",
  ON_HOLD: "IN_DISCUSSION",
};

export function legacyStatusToDefaultStage(status: LeadStatus): CrmStageCode | null {
  return defaultStageByStatus[status];
}

export function stageToLegacyStatus(code: CrmStageCode): LeadStatus {
  return statusByStage[code];
}

export function sameLegacyCompatibilityGroup(currentStage: CrmStageCode | null, requestedStatus: LeadStatus): boolean {
  return currentStage !== null && stageToLegacyStatus(currentStage) === requestedStatus;
}
