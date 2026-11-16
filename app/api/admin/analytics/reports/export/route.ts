import { NextRequest, NextResponse } from "next/server";

import { analyticsReportQuery } from "@/lib/analytics/report-query";
import { requirePermission } from "@/lib/auth/guards";
import { analyticsErrorResponse } from "@/lib/http/analytics-response";
import { AnalyticsReportService } from "@/lib/services/analytics-report-service";

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export async function GET(request: NextRequest) {
  try {
    const principal = await requirePermission("analytics.export");
    const query = analyticsReportQuery(request.nextUrl.searchParams);
    const rows = new AnalyticsReportService().exportRows(principal, query);
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          controller.enqueue(encoder.encode("\uFEFF日期,环境,维度,维度值,访客,会话,浏览量,事件,询盘\r\n"));
          for await (const row of rows) {
            controller.enqueue(encoder.encode([
              row.date, row.environment, row.dimension, row.dimensionValue, row.visitors,
              row.sessions, row.pageViews, row.events, row.inquiries,
            ].map(csvCell).join(",") + "\r\n"));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="zyron-analytics-report-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof RangeError || error instanceof TypeError) {
      return NextResponse.json({ code: "INVALID_ANALYTICS_RANGE" }, { status: 400 });
    }
    return analyticsErrorResponse(error);
  }
}
