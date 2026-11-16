import { NextRequest, NextResponse } from "next/server";

import { currentAnalyticsEnvironment } from "@/lib/analytics/first-party/environment";
import { readOrCreateAnalyticsIdentity } from "@/lib/analytics/first-party/identity";
import { chatErrorResponse } from "@/lib/http/chat-response";
import { ChatService } from "@/lib/services/chat-service";

type Context = { params: Promise<{ id: string }> };

function ownerFromRequest(request: NextRequest) {
  const identity = readOrCreateAnalyticsIdentity(request);
  return {
    identity,
    owner: {
      anonymousId: identity.visitorId,
      sessionKey: identity.sessionId,
      environment: currentAnalyticsEnvironment(),
    },
  };
}

function withIdentityCookies(response: NextResponse, cookieHeaders: string[]) {
  for (const cookie of cookieHeaders) response.headers.append("set-cookie", cookie);
  return response;
}

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { identity, owner } = ownerFromRequest(request);
    const { id } = await params;
    const cursor = request.nextUrl.searchParams.get("cursor") ?? undefined;
    const result = await new ChatService().listMessages(owner, id, cursor ? { cursor } : {});
    return withIdentityCookies(NextResponse.json(result), identity.cookieHeaders);
  } catch (error) {
    return chatErrorResponse(error);
  }
}

export async function POST(request: NextRequest, { params }: Context) {
  try {
    const { identity, owner } = ownerFromRequest(request);
    const { id } = await params;
    const result = await new ChatService().sendVisitorMessage(owner, id, await request.json());
    return withIdentityCookies(NextResponse.json(result, { status: 201 }), identity.cookieHeaders);
  } catch (error) {
    return chatErrorResponse(error);
  }
}
