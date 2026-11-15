import { NextResponse } from "next/server";
import { AuthenticationRequiredError, PermissionDeniedError } from "@/lib/auth/guards";
import { UntrustedOriginError } from "@/lib/auth/request-security";
import { SettingsConflictError, SettingsPermissionError, SettingsValidationError } from "@/lib/services/settings-service";
import { UserAdminConflictError, UserAdminNotFoundError, UserAdminPermissionError, UserAdminValidationError } from "@/lib/services/user-admin-service";

export function administrationErrorResponse(error: unknown) {
  if (error instanceof AuthenticationRequiredError) return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  if (error instanceof PermissionDeniedError || error instanceof SettingsPermissionError || error instanceof UserAdminPermissionError) return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  if (error instanceof UntrustedOriginError) return NextResponse.json({ code: "UNTRUSTED_ORIGIN" }, { status: 403 });
  if (error instanceof UserAdminNotFoundError) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  if (error instanceof SettingsConflictError || error instanceof UserAdminConflictError) return NextResponse.json({ code: "VERSION_CONFLICT", message: error.message }, { status: 409 });
  if (error instanceof SettingsValidationError || error instanceof UserAdminValidationError || error instanceof SyntaxError) return NextResponse.json({ code: "INVALID_INPUT", message: error.message }, { status: 400 });
  console.error("Administration API error", error instanceof Error ? error.name : "UnknownError");
  return NextResponse.json({ code: "OPERATION_FAILED" }, { status: 500 });
}
