import { NextResponse } from "next/server";

import { currentAnalyticsEnvironment } from "@/lib/analytics/first-party/environment";
import { readOrCreateAnalyticsIdentity } from "@/lib/analytics/first-party/identity";
import { hashNetworkKey } from "@/lib/analytics/first-party/rules";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { firstPartyAnalyticsErrorResponse } from "@/lib/http/first-party-analytics-response";
import { FirstPartyAnalyticsService } from "@/lib/services/first-party-analytics-service";
import {
  AnalyticsPayloadTooLargeError,
  decodeAnalyticsJson,
  MAX_ANALYTICS_BODY_BYTES,
  parseAnalyticsBatch,
} from "@/lib/validation/first-party-analytics";

export const runtime = "nodejs";

function cookieValue(request: Request, name: string) {
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const [cookieName, ...value] = part.trim().split("=");
    if (cookieName === name) return value.join("=");
  }
  return undefined;
}

function boundedHeader(request: Request, name: string, maximum: number) {
  const value = request.headers.get(name)?.trim();
  return value ? value.slice(0, maximum) : undefined;
}

function deviceMetadata(userAgent: string) {
  const isBot = /bot|crawler|spider|headless|slurp|bingpreview/i.test(userAgent);
  const deviceType = /ipad|tablet/i.test(userAgent)
    ? "tablet"
    : /mobile|iphone|android/i.test(userAgent) ? "mobile" : "desktop";
  const browser = /edg\//i.test(userAgent)
    ? "Edge"
    : /chrome|crios/i.test(userAgent) ? "Chrome"
      : /safari/i.test(userAgent) ? "Safari"
        : /firefox|fxios/i.test(userAgent) ? "Firefox" : "Other";
  const operatingSystem = /windows/i.test(userAgent)
    ? "Windows"
    : /iphone|ipad|ios/i.test(userAgent) ? "iOS"
      : /mac os|macintosh/i.test(userAgent) ? "macOS"
        : /android/i.test(userAgent) ? "Android"
          : /linux/i.test(userAgent) ? "Linux" : "Other";
  return { isBot, deviceType, browser, operatingSystem };
}

function networkKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || "unknown";
}

export async function POST(request: Request) {
  try {
    if (cookieValue(request, "zyron_analytics_consent") !== "accepted") {
      return new NextResponse(null, { status: 204 });
    }
    assertSameOriginMutation(request);
    const declaredLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_ANALYTICS_BODY_BYTES) {
      throw new AnalyticsPayloadTooLargeError();
    }
    const batch = parseAnalyticsBatch(decodeAnalyticsJson(await request.text()));
    const now = new Date();
    const identity = readOrCreateAnalyticsIdentity(request, now);
    const userAgent = request.headers.get("user-agent") ?? "";
    const result = await new FirstPartyAnalyticsService().collectAnalyticsBatch(identity, batch, {
      environment: currentAnalyticsEnvironment(),
      now,
      countryCode: boundedHeader(request, "x-vercel-ip-country", 2)?.toUpperCase(),
      region: boundedHeader(request, "x-vercel-ip-country-region", 100),
      city: boundedHeader(request, "x-vercel-ip-city", 100),
      ...deviceMetadata(userAgent),
      ipHash: hashNetworkKey(networkKey(request), now.toISOString().slice(0, 7)),
    });
    const response = NextResponse.json(result, { status: 202 });
    for (const cookie of identity.cookieHeaders) response.headers.append("set-cookie", cookie);
    return response;
  } catch (error) {
    return firstPartyAnalyticsErrorResponse(error);
  }
}
