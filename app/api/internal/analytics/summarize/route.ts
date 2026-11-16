import { timingSafeEqual } from "node:crypto";

import type { AnalyticsEnvironment } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { currentAnalyticsEnvironment } from "@/lib/analytics/first-party/environment";
import { AnalyticsSummaryService } from "@/lib/services/analytics-summary-service";

export const runtime = "nodejs";

const environments = new Set<AnalyticsEnvironment>(["DEVELOPMENT", "PREVIEW", "PRODUCTION", "TEST"]);

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || !supplied) return false;
  const expectedBuffer = Buffer.from(secret);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });

  try {
    const input = await request.json() as { day?: unknown; environment?: unknown };
    if (typeof input.day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input.day)) {
      return NextResponse.json({ code: "INVALID_REPORTING_DAY" }, { status: 400 });
    }
    if (typeof input.environment !== "string" || !environments.has(input.environment as AnalyticsEnvironment)) {
      return NextResponse.json({ code: "INVALID_ANALYTICS_ENVIRONMENT" }, { status: 400 });
    }
    const day = new Date(`${input.day}T00:00:00.000Z`);
    if (Number.isNaN(day.getTime()) || day.toISOString().slice(0, 10) !== input.day) {
      return NextResponse.json({ code: "INVALID_REPORTING_DAY" }, { status: 400 });
    }
    const result = await new AnalyticsSummaryService().summarizeDay(day, input.environment as AnalyticsEnvironment);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ code: "INVALID_JSON" }, { status: 400 });
    throw error;
  }
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  const now = new Date();
  const yesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
  const result = await new AnalyticsSummaryService().summarizeDay(yesterday, currentAnalyticsEnvironment());
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
