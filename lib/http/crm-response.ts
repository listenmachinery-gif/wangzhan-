import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthenticationRequiredError, PermissionDeniedError } from "@/lib/auth/guards";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { UntrustedOriginError } from "@/lib/auth/request-security";
import { LeadConflictError, LeadNotFoundError, LeadPermissionError, LeadValidationError } from "@/lib/services/lead-service";
import { CustomerConflictError, CustomerDuplicateConfirmationError, CustomerNotFoundError, CustomerPermissionError, CustomerValidationError } from "@/lib/services/customer-service";

export async function crmPrincipal() {
  const principal = await getCurrentPrincipal();
  if (!principal) throw new AuthenticationRequiredError("Authentication required.");
  return principal;
}

export function crmErrorResponse(error: unknown) {
  if (error instanceof AuthenticationRequiredError) return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  if (error instanceof UntrustedOriginError) return NextResponse.json({ code: "UNTRUSTED_ORIGIN" }, { status: 403 });
  if (error instanceof PermissionDeniedError || error instanceof LeadPermissionError || error instanceof CustomerPermissionError) return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  if (error instanceof LeadNotFoundError || error instanceof CustomerNotFoundError) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  if (error instanceof CustomerDuplicateConfirmationError) return NextResponse.json({ code: "DUPLICATE_CONFIRMATION_REQUIRED", duplicateCandidates: error.duplicateCandidates }, { status: 409 });
  if (error instanceof LeadConflictError || error instanceof CustomerConflictError) return NextResponse.json({ code: "VERSION_CONFLICT", message: error.message }, { status: 409 });
  if (error instanceof SyntaxError) return NextResponse.json({ code: "INVALID_LEAD", message: "Malformed JSON body." }, { status: 400 });
  if (error instanceof LeadValidationError || error instanceof CustomerValidationError || error instanceof ZodError) return NextResponse.json({ code: "INVALID_LEAD", message: error.message }, { status: 400 });
  console.error("CRM administration API error", error);
  return NextResponse.json({ code: "LEAD_OPERATION_FAILED" }, { status: 500 });
}

// Explicit boundary projection, shared by legacy and CRM aliases. Never spread database rows.
const leadFields = ["id", "name", "email", "phone", "whatsapp", "country", "company", "interestedProductId", "message", "sourcePage", "material", "thickness", "workingLength", "quantity", "voltage", "budget", "status", "nextFollowUpAt", "inquiryNumber", "recordOrigin", "sourceChannel", "companyId", "contactId", "stageId", "customerLevel", "intentScore", "estimatedDealAmount", "estimatedCurrency", "estimatedCloseDate", "lastFollowUpAt", "lastResultCode", "lostReasonCode", "lostReasonNote", "wonOrderNumber", "wonAmount", "wonCurrency", "version", "createdAt", "updatedAt"] as const;
function pick(row: Record<string, unknown>, fields: readonly string[]) {
  return Object.fromEntries(fields.filter((field) => row[field] !== undefined).map((field) => [field, row[field]]));
}
function person(value: unknown) {
  return value && typeof value === "object" ? pick(value as Record<string, unknown>, ["id", "name", "email"]) : null;
}
export function inquiryDto(row: Record<string, unknown>) {
  const result = pick(row, leadFields);
  if (row.stage && typeof row.stage === "object") result.stage = pick(row.stage as Record<string, unknown>, ["id", "code", "name", "color", "position", "isTerminal", "requiresReason"]);
  if (row.interestedProduct && typeof row.interestedProduct === "object") result.interestedProduct = pick(row.interestedProduct as Record<string, unknown>, ["id", "name", "slug"]);
  if (Array.isArray(row.assignments)) result.assignments = row.assignments.map((entry) => ({ ...pick(entry, ["id", "assigneeId", "assignedAt", "endedAt"]), assignee: person(entry.assignee), assignedBy: person(entry.assignedBy) }));
  if (Array.isArray(row.activities)) result.activities = row.activities.map((entry) => ({ ...pick(entry, ["id", "type", "content", "createdAt"]), actor: person(entry.actor) }));
  return result;
}
