import { NextRequest, NextResponse } from "next/server";

import { AuthenticationRequiredError } from "@/lib/auth/guards";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { leadErrorResponse } from "@/lib/http/lead-response";
import { LeadService } from "@/lib/services/lead-service";

export async function GET(request: NextRequest) {
  try {
    const principal = await getCurrentPrincipal();
    if (!principal) throw new AuthenticationRequiredError("Authentication required.");
    return NextResponse.json(await new LeadService().list(principal, Object.fromEntries(request.nextUrl.searchParams)));
  } catch (error) {
    return leadErrorResponse(error);
  }
}
