import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AuthenticationRequiredError, PermissionDeniedError } from "@/lib/auth/guards";
import { UntrustedOriginError } from "@/lib/auth/request-security";
import {
  LeadConflictError,
  LeadNotFoundError,
  LeadPermissionError,
  LeadValidationError,
} from "@/lib/services/lead-service";

export function leadErrorResponse(error: unknown) {
  if (error instanceof AuthenticationRequiredError) return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  if (error instanceof PermissionDeniedError || error instanceof LeadPermissionError) return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  if (error instanceof UntrustedOriginError) return NextResponse.json({ code: "UNTRUSTED_ORIGIN" }, { status: 403 });
  if (error instanceof LeadNotFoundError) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  if (error instanceof LeadConflictError) return NextResponse.json({ code: "VERSION_CONFLICT", message: error.message }, { status: 409 });
  if (error instanceof LeadValidationError || error instanceof ZodError) return NextResponse.json({ code: "INVALID_LEAD", message: error.message }, { status: 400 });
  if (error instanceof SyntaxError) return NextResponse.json({ code: "INVALID_LEAD", message: "Malformed JSON body." }, { status: 400 });
  console.error("Lead administration API error", error);
  return NextResponse.json({ code: "LEAD_OPERATION_FAILED" }, { status: 500 });
}
