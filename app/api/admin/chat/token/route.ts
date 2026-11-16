import { NextRequest, NextResponse } from "next/server";

import { currentAnalyticsEnvironment } from "@/lib/analytics/first-party/environment";
import { AuthenticationRequiredError } from "@/lib/auth/guards";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { issueChatToken } from "@/lib/auth/chat-token";
import { chatErrorResponse } from "@/lib/http/chat-response";
import { ChatService } from "@/lib/services/chat-service";
import { chatTokenRequestSchema } from "@/lib/validation/chat";

export async function POST(request: NextRequest) {
  try {
    const principal = await getCurrentPrincipal();
    if (!principal) throw new AuthenticationRequiredError("Authentication required.");
    const environment = currentAnalyticsEnvironment();
    const input = chatTokenRequestSchema.parse(await request.json());
    await new ChatService().listMessages(principal, input.conversationId, { environment });
    return NextResponse.json({
      token: issueChatToken({
        subjectType: "admin",
        subjectId: principal.id,
        conversationId: input.conversationId,
        environment,
      }),
      expiresInSeconds: 300,
    });
  } catch (error) {
    return chatErrorResponse(error);
  }
}
