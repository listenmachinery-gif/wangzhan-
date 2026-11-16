import { NextRequest, NextResponse } from "next/server";

import { ANALYTICS_RANGES, type AnalyticsRange } from "@/lib/analytics/types";
import { AnalyticsOverviewService } from "@/lib/analytics/overview-service";
import { requirePermission } from "@/lib/auth/guards";
import { analyticsErrorResponse, InvalidAnalyticsRangeError } from "@/lib/http/analytics-response";

function parseRange(value: string | null): AnalyticsRange {
  const range = value ?? "28d";
  if (!ANALYTICS_RANGES.includes(range as AnalyticsRange)) throw new InvalidAnalyticsRangeError();
  return range as AnalyticsRange;
}

export async function GET(request: NextRequest) {
  try {
    await requirePermission("settings.write");
    const range = parseRange(request.nextUrl.searchParams.get("range"));
    return NextResponse.json(await new AnalyticsOverviewService().getOverview(range));
  } catch (error) {
    return analyticsErrorResponse(error);
  }
}
