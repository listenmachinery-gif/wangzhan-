import { NextRequest, NextResponse } from "next/server";

import { AuthenticationRequiredError } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { leadErrorResponse } from "@/lib/http/lead-response";
import { LeadService } from "@/lib/services/lead-service";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOriginMutation(request);
    const principal = await getCurrentPrincipal();
    if (!principal) throw new AuthenticationRequiredError("Authentication required.");
    const { id } = await context.params;
    return NextResponse.json(await new LeadService().addActivity(principal, id, await request.json()), { status: 201 });
  } catch (error) {
    return leadErrorResponse(error);
  }
}
