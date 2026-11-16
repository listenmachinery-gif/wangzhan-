import { NextRequest, NextResponse } from "next/server";

import { currentAnalyticsEnvironment } from "@/lib/analytics/first-party/environment";
import { requirePermission } from "@/lib/auth/guards";
import { visitorAnalyticsErrorResponse } from "@/lib/http/visitor-analytics-response";
import { PrivacyPermissionError, PrivacyRetentionService, PrivacyVisitorNotFoundError } from "@/lib/services/privacy-retention-service";
import { visitorAnalyticsIdSchema } from "@/lib/validation/visitor-analytics";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const principal = await requirePermission("analytics.delete");
    const { id } = await params;
    return NextResponse.json(await new PrivacyRetentionService().deleteVisitorData(
      visitorAnalyticsIdSchema.parse(id), currentAnalyticsEnvironment(), principal,
    ));
  } catch (error) {
    if (error instanceof PrivacyVisitorNotFoundError) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
    if (error instanceof PrivacyPermissionError) return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
    return visitorAnalyticsErrorResponse(error);
  }
}
