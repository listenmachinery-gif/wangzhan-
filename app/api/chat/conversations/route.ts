import { NextRequest, NextResponse } from "next/server";

import { currentAnalyticsEnvironment } from "@/lib/analytics/first-party/environment";
import { readOrCreateAnalyticsIdentity } from "@/lib/analytics/first-party/identity";
import { chatErrorResponse } from "@/lib/http/chat-response";
import { ChatService } from "@/lib/services/chat-service";

export async function POST(request: NextRequest) {
  try {
    const identity = readOrCreateAnalyticsIdentity(request);
    const owner = {
      anonymousId: identity.visitorId,
      sessionKey: identity.sessionId,
      environment: currentAnalyticsEnvironment(),
    };
    const conversation = await new ChatService().createOrResumeConversation(owner, await request.json());
    const response = NextResponse.json({
      id: conversation.id,
      status: conversation.status,
      contactName: conversation.contactName,
      contactEmail: conversation.contactEmail,
      contactWhatsapp: conversation.contactWhatsapp,
      lastMessageAt: conversation.lastMessageAt,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    }, { status: 201 });
    for (const cookie of identity.cookieHeaders) response.headers.append("set-cookie", cookie);
    return response;
  } catch (error) {
    return chatErrorResponse(error);
  }
}
