import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AuthenticationRequiredError, PermissionDeniedError } from "@/lib/auth/guards";
import { UntrustedOriginError } from "@/lib/auth/request-security";
import {
  ProductAdminConflictError,
  ProductAdminNotFoundError,
  ProductAdminPermissionError,
  ProductAdminValidationError,
} from "@/lib/services/product-admin-service";

export function productAdminErrorResponse(error: unknown) {
  if (error instanceof AuthenticationRequiredError) return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  if (error instanceof PermissionDeniedError || error instanceof ProductAdminPermissionError) {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  }
  if (error instanceof UntrustedOriginError) return NextResponse.json({ code: "UNTRUSTED_ORIGIN" }, { status: 403 });
  if (error instanceof ProductAdminNotFoundError) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  if (error instanceof ProductAdminConflictError) {
    return NextResponse.json({ code: "VERSION_CONFLICT", message: error.message }, { status: 409 });
  }
  if (error instanceof ProductAdminValidationError || error instanceof ZodError) {
    return NextResponse.json({ code: "INVALID_PRODUCT", message: error.message }, { status: 400 });
  }
  console.error("Product administration API error", error);
  return NextResponse.json({ code: "PRODUCT_OPERATION_FAILED" }, { status: 500 });
}
