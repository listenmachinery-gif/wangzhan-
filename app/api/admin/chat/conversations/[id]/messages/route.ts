import { NextRequest, NextResponse } from "next/server";

import { currentAnalyticsEnvironment } from "@/lib/analytics/first-party/environment";
import { AuthenticationRequiredError } from "@/lib/auth/guards";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { chatErrorResponse } from "@/lib/http/chat-response";
import { ChatService } from "@/lib/services/chat-service";

type Context = { params: Promise<{ id: string }> };

async function principal() {
  const current = await getCurrentPrincipal();
  if (!current) throw new AuthenticationRequiredError("Authentication required.");
  return current;
}

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const current = await principal();
    const { id } = await params;
    const cursor = request.nextUrl.searchParams.get("cursor") ?? undefined;
    return NextResponse.json(await new ChatService().listMessages(current, id, {
      environment: currentAnalyticsEnvironment(),
      ...(cursor ? { cursor } : {}),
    }));
  } catch (error) {
    return chatErrorResponse(error);
  }
}

export async function POST(request: NextRequest, { params }: Context) {
  try {
    const current = await principal();
    const { id } = await params;
    const result = await new ChatService().sendAgentMessage(
      current,
      id,
      await request.json(),
      currentAnalyticsEnvironment(),
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return chatErrorResponse(error);
  }
}
