import { NextRequest, NextResponse } from "next/server";

import { analyticsReportQuery } from "@/lib/analytics/report-query";
import { requirePermission } from "@/lib/auth/guards";
import { analyticsErrorResponse } from "@/lib/http/analytics-response";
import { AnalyticsReportService } from "@/lib/services/analytics-report-service";

export async function GET(request: NextRequest) {
  try {
    const principal = await requirePermission("analytics.read.summary");
    const report = await new AnalyticsReportService().getReport(principal, analyticsReportQuery(request.nextUrl.searchParams));
    return NextResponse.json(report, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof RangeError || error instanceof TypeError) {
      return NextResponse.json({ code: "INVALID_ANALYTICS_RANGE" }, { status: 400 });
    }
    return analyticsErrorResponse(error);
  }
}
