import { NextRequest, NextResponse } from "next/server";

import { currentAnalyticsEnvironment } from "@/lib/analytics/first-party/environment";
import { requirePermission } from "@/lib/auth/guards";
import { visitorAnalyticsErrorResponse } from "@/lib/http/visitor-analytics-response";
import { VisitorAnalyticsQueryService } from "@/lib/services/visitor-analytics-query-service";
import { visitorListQuerySchema } from "@/lib/validation/visitor-analytics";

export async function GET(request: NextRequest) {
  try {
    const principal = await requirePermission("analytics.read.visitors");
    const query = visitorListQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    return NextResponse.json(await new VisitorAnalyticsQueryService().listVisitors(principal, {
      environment: currentAnalyticsEnvironment(),
      ...query,
    }));
  } catch (error) {
    return visitorAnalyticsErrorResponse(error);
  }
}
