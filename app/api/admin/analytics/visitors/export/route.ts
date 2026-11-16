import { NextRequest } from "next/server";

import { currentAnalyticsEnvironment } from "@/lib/analytics/first-party/environment";
import { requirePermission } from "@/lib/auth/guards";
import { visitorAnalyticsErrorResponse } from "@/lib/http/visitor-analytics-response";
import { VisitorAnalyticsQueryService } from "@/lib/services/visitor-analytics-query-service";
import { visitorListQuerySchema } from "@/lib/validation/visitor-analytics";

export async function GET(request: NextRequest) {
  try {
    const principal = await requirePermission("analytics.export");
    const query = visitorListQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const csv = await new VisitorAnalyticsQueryService().exportCsv(principal, {
      environment: currentAnalyticsEnvironment(),
      ...query,
    });
    return new Response(`\uFEFF${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="zyron-visitors-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return visitorAnalyticsErrorResponse(error);
  }
}
