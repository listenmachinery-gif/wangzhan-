import { NextRequest, NextResponse } from "next/server";

import { currentAnalyticsEnvironment } from "@/lib/analytics/first-party/environment";
import { requirePermission } from "@/lib/auth/guards";
import { analyticsErrorResponse } from "@/lib/http/analytics-response";
import { VisitorAnalyticsQueryService } from "@/lib/services/visitor-analytics-query-service";

export async function GET(request: NextRequest) {
  try {
    const rawSince = request.nextUrl.searchParams.get("since");
    const since = rawSince ? new Date(rawSince) : undefined;
    if (since && Number.isNaN(since.getTime())) {
      return NextResponse.json({ code: "INVALID_REALTIME_CURSOR" }, { status: 400 });
    }
    const principal = await requirePermission("analytics.read.summary");
    const generatedAt = new Date();
    const environment = currentAnalyticsEnvironment();
    const overview = await new VisitorAnalyticsQueryService().getRealtimeOverview(principal, generatedAt, environment, since);

    return NextResponse.json({ generatedAt: generatedAt.toISOString(), environment, ...overview });
  } catch (error) {
    return analyticsErrorResponse(error);
  }
}
