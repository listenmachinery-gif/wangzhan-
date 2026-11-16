import { NextRequest, NextResponse } from "next/server";
import { crmErrorResponse, crmPrincipal } from "@/lib/http/crm-response";
import { LeadService } from "@/lib/services/lead-service";
export async function GET(request: NextRequest) {
  void request;
  try { return NextResponse.json({ items: await new LeadService().listStages(await crmPrincipal()) }); }
  catch (error) { return crmErrorResponse(error); }
}
