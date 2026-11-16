import { timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { currentAnalyticsEnvironment } from "@/lib/analytics/first-party/environment";
import { PrivacyRetentionService } from "@/lib/services/privacy-retention-service";

export const runtime = "nodejs";

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || !supplied) return false;
  const expected = Buffer.from(secret);
  const received = Buffer.from(supplied);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  const result = await new PrivacyRetentionService().applyRetention(new Date(), currentAnalyticsEnvironment());
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
