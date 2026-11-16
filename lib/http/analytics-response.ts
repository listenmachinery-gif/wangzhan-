import { NextResponse } from "next/server";

import { AuthenticationRequiredError, PermissionDeniedError } from "@/lib/auth/guards";

export class InvalidAnalyticsRangeError extends Error {
  constructor() {
    super("Unsupported analytics date range.");
    this.name = "InvalidAnalyticsRangeError";
  }
}

export function analyticsErrorResponse(error: unknown) {
  if (error instanceof AuthenticationRequiredError) {
    return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  }
  if (error instanceof PermissionDeniedError) {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  }
  if (error instanceof InvalidAnalyticsRangeError) {
    return NextResponse.json({ code: "INVALID_ANALYTICS_RANGE" }, { status: 400 });
  }
  console.error("Analytics API error", error instanceof Error ? error.name : "UnknownError");
  return NextResponse.json({ code: "ANALYTICS_UNAVAILABLE" }, { status: 500 });
}
