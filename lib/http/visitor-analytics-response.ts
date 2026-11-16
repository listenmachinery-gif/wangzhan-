import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AuthenticationRequiredError, PermissionDeniedError } from "@/lib/auth/guards";
import { VisitorAnalyticsNotFoundError, VisitorAnalyticsPermissionError } from "@/lib/services/visitor-analytics-query-service";

export function visitorAnalyticsErrorResponse(error: unknown) {
  if (error instanceof AuthenticationRequiredError) return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  if (error instanceof PermissionDeniedError || error instanceof VisitorAnalyticsPermissionError) {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  }
  if (error instanceof VisitorAnalyticsNotFoundError) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  if (error instanceof ZodError) return NextResponse.json({ code: "INVALID_VISITOR_FILTERS", message: error.message }, { status: 400 });
  console.error("Visitor analytics API error", error instanceof Error ? error.name : "UnknownError");
  return NextResponse.json({ code: "VISITOR_ANALYTICS_UNAVAILABLE" }, { status: 500 });
}
