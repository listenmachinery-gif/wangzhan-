import { NextResponse } from "next/server";

import { AnalyticsOverviewService } from "@/lib/analytics/overview-service";
import { requirePermission } from "@/lib/auth/guards";
import { analyticsErrorResponse } from "@/lib/http/analytics-response";

export async function GET() {
  try {
    await requirePermission("settings.write");
    return NextResponse.json(await new AnalyticsOverviewService().getStatus());
  } catch (error) {
    return analyticsErrorResponse(error);
  }
}
