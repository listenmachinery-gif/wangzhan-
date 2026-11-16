import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { UntrustedOriginError } from "@/lib/auth/request-security";
import { AnalyticsEventTimeError } from "@/lib/services/first-party-analytics-service";
import {
  AnalyticsPayloadTooLargeError,
  MalformedAnalyticsJsonError,
} from "@/lib/validation/first-party-analytics";

export function firstPartyAnalyticsErrorResponse(error: unknown) {
  if (error instanceof UntrustedOriginError) {
    return NextResponse.json({ code: "UNTRUSTED_ORIGIN" }, { status: 403 });
  }
  if (error instanceof AnalyticsPayloadTooLargeError) {
    return NextResponse.json({ code: "ANALYTICS_BATCH_TOO_LARGE" }, { status: 413 });
  }
  if (error instanceof MalformedAnalyticsJsonError || error instanceof AnalyticsEventTimeError || error instanceof ZodError) {
    return NextResponse.json({ code: "INVALID_ANALYTICS_BATCH" }, { status: 400 });
  }
  console.error("First-party analytics collection failed.", error instanceof Error ? error.name : "UnknownError");
  return NextResponse.json({ code: "ANALYTICS_UNAVAILABLE" }, { status: 503 });
}
