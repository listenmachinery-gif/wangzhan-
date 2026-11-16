import { NextRequest, NextResponse } from "next/server";

import { currentAnalyticsEnvironment } from "@/lib/analytics/first-party/environment";
import { readOrCreateAnalyticsIdentity } from "@/lib/analytics/first-party/identity";
import { issueChatToken } from "@/lib/auth/chat-token";
import { chatErrorResponse } from "@/lib/http/chat-response";
import { ChatService } from "@/lib/services/chat-service";
import { chatTokenRequestSchema } from "@/lib/validation/chat";

export async function POST(request: NextRequest) {
  try {
    const identity = readOrCreateAnalyticsIdentity(request);
    const environment = currentAnalyticsEnvironment();
    const input = chatTokenRequestSchema.parse(await request.json());
    await new ChatService().assertVisitorConversation({
      anonymousId: identity.visitorId,
      sessionKey: identity.sessionId,
      environment,
    }, input.conversationId);
    const token = issueChatToken({
      subjectType: "visitor",
      subjectId: identity.visitorId,
      conversationId: input.conversationId,
      environment,
    });
    const response = NextResponse.json({ token, expiresInSeconds: 300 });
    for (const cookie of identity.cookieHeaders) response.headers.append("set-cookie", cookie);
    return response;
  } catch (error) {
    return chatErrorResponse(error);
  }
}
