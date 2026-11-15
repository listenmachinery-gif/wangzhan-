import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AuthenticationRequiredError, PermissionDeniedError } from "@/lib/auth/guards";
import { UntrustedOriginError } from "@/lib/auth/request-security";
import {
  SpecificationConflictError,
  SpecificationNotFoundError,
  SpecificationPermissionError,
  SpecificationValidationError,
} from "@/lib/services/specification-service";

export function specificationErrorResponse(error: unknown) {
  if (error instanceof AuthenticationRequiredError) return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  if (error instanceof PermissionDeniedError || error instanceof SpecificationPermissionError) {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  }
  if (error instanceof UntrustedOriginError) return NextResponse.json({ code: "UNTRUSTED_ORIGIN" }, { status: 403 });
  if (error instanceof SpecificationNotFoundError) return NextResponse.json({ code: "NOT_FOUND", message: error.message }, { status: 404 });
  if (error instanceof SpecificationConflictError) return NextResponse.json({ code: "VERSION_CONFLICT", message: error.message }, { status: 409 });
  if (error instanceof SpecificationValidationError || error instanceof ZodError) {
    return NextResponse.json({ code: "INVALID_SPECIFICATION", message: error.message }, { status: 400 });
  }
  console.error("Specification API error", error);
  return NextResponse.json({ code: "SPECIFICATION_OPERATION_FAILED" }, { status: 500 });
}
