import { NextRequest, NextResponse } from "next/server";

import { AuthenticationRequiredError } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { leadErrorResponse } from "@/lib/http/lead-response";
import { LeadService } from "@/lib/services/lead-service";

async function principal() {
  const value = await getCurrentPrincipal();
  if (!value) throw new AuthenticationRequiredError("Authentication required.");
  return value;
}

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return NextResponse.json(await new LeadService().get(await principal(), id));
  } catch (error) {
    return leadErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOriginMutation(request);
    const { id } = await context.params;
    const body = await request.json();
    const service = new LeadService();
    const result = body?.action === "assign"
      ? await service.assign(await principal(), id, { version: body.version, assigneeId: body.assigneeId })
      : await service.update(await principal(), id, body);
    return NextResponse.json(result);
  } catch (error) {
    return leadErrorResponse(error);
  }
}
