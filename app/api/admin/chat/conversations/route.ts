import { NextRequest, NextResponse } from "next/server";

import { currentAnalyticsEnvironment } from "@/lib/analytics/first-party/environment";
import { AuthenticationRequiredError } from "@/lib/auth/guards";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { chatErrorResponse } from "@/lib/http/chat-response";
import { ChatService } from "@/lib/services/chat-service";

export async function GET(request: NextRequest) {
  try {
    const principal = await getCurrentPrincipal();
    if (!principal) throw new AuthenticationRequiredError("Authentication required.");
    const query = {
      ...Object.fromEntries(request.nextUrl.searchParams),
      environment: currentAnalyticsEnvironment(),
    };
    return NextResponse.json(await new ChatService().listAdminConversations(principal, query));
  } catch (error) {
    return chatErrorResponse(error);
  }
}
