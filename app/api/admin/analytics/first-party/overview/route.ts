import type { AnalyticsEnvironment } from "@prisma/client";
import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { analyticsErrorResponse } from "@/lib/http/analytics-response";
import { VisitorAnalyticsQueryService } from "@/lib/services/visitor-analytics-query-service";

function currentEnvironment(): AnalyticsEnvironment {
  if (process.env.VERCEL_ENV === "production") return "PRODUCTION";
  if (process.env.VERCEL_ENV === "preview") return "PREVIEW";
  return "TEST";
}

export async function GET() {
  try {
    const principal = await requirePermission("analytics.read.summary");
    const generatedAt = new Date();
    const environment = currentEnvironment();
    const summary = await new VisitorAnalyticsQueryService().getRealtimeSummary(principal, generatedAt, environment);

    return NextResponse.json({ generatedAt: generatedAt.toISOString(), environment, summary });
  } catch (error) {
    return analyticsErrorResponse(error);
  }
}
