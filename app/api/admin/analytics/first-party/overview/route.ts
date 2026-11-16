import { NextResponse } from "next/server";

import { currentAnalyticsEnvironment } from "@/lib/analytics/first-party/environment";
import { requirePermission } from "@/lib/auth/guards";
import { analyticsErrorResponse } from "@/lib/http/analytics-response";
import { VisitorAnalyticsQueryService } from "@/lib/services/visitor-analytics-query-service";

export async function GET() {
  try {
    const principal = await requirePermission("analytics.read.summary");
    const generatedAt = new Date();
    const environment = currentAnalyticsEnvironment();
    const summary = await new VisitorAnalyticsQueryService().getRealtimeSummary(principal, generatedAt, environment);

    return NextResponse.json({ generatedAt: generatedAt.toISOString(), environment, summary });
  } catch (error) {
    return analyticsErrorResponse(error);
  }
}
