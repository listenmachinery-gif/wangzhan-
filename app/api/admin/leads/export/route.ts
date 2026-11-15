import { NextRequest } from "next/server";

import { AuthenticationRequiredError } from "@/lib/auth/guards";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { leadErrorResponse } from "@/lib/http/lead-response";
import { LeadService } from "@/lib/services/lead-service";

export async function GET(request: NextRequest) {
  try {
    const principal = await getCurrentPrincipal();
    if (!principal) throw new AuthenticationRequiredError("Authentication required.");
    const csv = await new LeadService().exportCsv(principal, Object.fromEntries(request.nextUrl.searchParams));
    return new Response(`\uFEFF${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="zyron-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return leadErrorResponse(error);
  }
}
