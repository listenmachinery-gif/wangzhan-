import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AuthenticationRequiredError } from "@/lib/auth/guards";
import { ChatTokenError } from "@/lib/auth/chat-token";
import {
  ChatConflictError,
  ChatNotFoundError,
  ChatPermissionError,
  ChatRateLimitError,
} from "@/lib/services/chat-service";

export function chatErrorResponse(error: unknown) {
  if (error instanceof AuthenticationRequiredError) return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  if (error instanceof ChatPermissionError) return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  if (error instanceof ChatNotFoundError) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  if (error instanceof ChatConflictError) return NextResponse.json({ code: "CONVERSATION_UNAVAILABLE", message: error.message }, { status: 409 });
  if (error instanceof ChatRateLimitError) return NextResponse.json({ code: "RATE_LIMITED" }, { status: 429 });
  if (error instanceof ChatTokenError) return NextResponse.json({ code: "REALTIME_UNAVAILABLE" }, { status: 503 });
  if (error instanceof ZodError || error instanceof SyntaxError) {
    return NextResponse.json({ code: "INVALID_CHAT_REQUEST" }, { status: 400 });
  }
  console.error("Chat API error", error instanceof Error ? error.name : "UnknownError");
  return NextResponse.json({ code: "CHAT_UNAVAILABLE" }, { status: 500 });
}
