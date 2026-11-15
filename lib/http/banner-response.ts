import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AuthenticationRequiredError, PermissionDeniedError } from "@/lib/auth/guards";
import { UntrustedOriginError } from "@/lib/auth/request-security";
import {
  BannerConflictError,
  BannerNotFoundError,
  BannerPermissionError,
  BannerValidationError,
} from "@/lib/services/banner-service";

export function bannerErrorResponse(error: unknown) {
  if (error instanceof AuthenticationRequiredError) return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  if (error instanceof PermissionDeniedError || error instanceof BannerPermissionError) return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  if (error instanceof UntrustedOriginError) return NextResponse.json({ code: "UNTRUSTED_ORIGIN" }, { status: 403 });
  if (error instanceof BannerNotFoundError) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  if (error instanceof BannerConflictError) return NextResponse.json({ code: "VERSION_CONFLICT", message: error.message }, { status: 409 });
  if (error instanceof BannerValidationError || error instanceof ZodError) return NextResponse.json({ code: "INVALID_BANNER", message: error.message }, { status: 400 });
  console.error("Banner administration API error", error);
  return NextResponse.json({ code: "BANNER_OPERATION_FAILED" }, { status: 500 });
}

