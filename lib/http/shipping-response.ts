import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AuthenticationRequiredError, PermissionDeniedError } from "@/lib/auth/guards";
import { UntrustedOriginError } from "@/lib/auth/request-security";
import {
  ShippingConflictError,
  ShippingNotFoundError,
  ShippingPermissionError,
  ShippingValidationError,
} from "@/lib/services/shipping-highlight-service";

export function shippingErrorResponse(error: unknown) {
  if (error instanceof AuthenticationRequiredError) return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  if (error instanceof PermissionDeniedError || error instanceof ShippingPermissionError) return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  if (error instanceof UntrustedOriginError) return NextResponse.json({ code: "UNTRUSTED_ORIGIN" }, { status: 403 });
  if (error instanceof ShippingNotFoundError) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  if (error instanceof ShippingConflictError) return NextResponse.json({ code: "VERSION_CONFLICT", message: error.message }, { status: 409 });
  if (error instanceof ShippingValidationError) {
    return NextResponse.json({ code: "INVALID_SHIPPING_HIGHLIGHT", message: error.message, details: error.details }, { status: 400 });
  }
  if (error instanceof ZodError || error instanceof SyntaxError) {
    return NextResponse.json({ code: "INVALID_SHIPPING_HIGHLIGHT", message: error.message }, { status: 400 });
  }
  console.error("Shipping highlight administration API error", error instanceof Error ? error.name : "UnknownError");
  return NextResponse.json({ code: "SHIPPING_HIGHLIGHT_OPERATION_FAILED" }, { status: 500 });
}
