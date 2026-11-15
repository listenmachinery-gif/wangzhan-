import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthenticationRequiredError, PermissionDeniedError } from "@/lib/auth/guards";
import { UntrustedOriginError } from "@/lib/auth/request-security";
import { SeoConflictError, SeoNotFoundError, SeoPermissionError, SeoValidationError } from "@/lib/services/seo-service";

export function seoErrorResponse(error: unknown) {
  if (error instanceof AuthenticationRequiredError) return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  if (error instanceof PermissionDeniedError || error instanceof SeoPermissionError) return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  if (error instanceof UntrustedOriginError) return NextResponse.json({ code: "UNTRUSTED_ORIGIN" }, { status: 403 });
  if (error instanceof SeoNotFoundError) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  if (error instanceof SeoConflictError) return NextResponse.json({ code: "VERSION_CONFLICT", message: error.message }, { status: 409 });
  if (error instanceof SeoValidationError || error instanceof ZodError || error instanceof SyntaxError) return NextResponse.json({ code: "INVALID_SEO", message: error.message }, { status: 400 });
  console.error("SEO administration API error", error instanceof Error ? error.name : "UnknownError");
  return NextResponse.json({ code: "SEO_OPERATION_FAILED" }, { status: 500 });
}
