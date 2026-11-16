import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { visitorAnalyticsErrorResponse } from "@/lib/http/visitor-analytics-response";
import { VisitorAnalyticsQueryService } from "@/lib/services/visitor-analytics-query-service";
import { visitorAnalyticsIdSchema } from "@/lib/validation/visitor-analytics";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const principal = await requirePermission("analytics.read.visitors");
    const { id } = await params;
    return NextResponse.json(await new VisitorAnalyticsQueryService().getVisitorTimeline(principal, visitorAnalyticsIdSchema.parse(id)));
  } catch (error) {
    return visitorAnalyticsErrorResponse(error);
  }
}
