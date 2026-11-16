import { NextRequest, NextResponse } from "next/server";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { crmErrorResponse, crmPrincipal, inquiryDto } from "@/lib/http/crm-response";
import { LeadService } from "@/lib/services/lead-service";
import { inquiryListQuerySchema, manualInquirySchema } from "@/lib/validation/crm";

export async function GET(request: NextRequest) {
  try {
    const principal = await crmPrincipal();
    const query = Object.fromEntries(request.nextUrl.searchParams);
    inquiryListQuerySchema.parse(query);
    const result = await new LeadService().list(principal, query);
    return NextResponse.json({ items: result.items.map(inquiryDto), total: result.total, page: result.page, pageSize: result.pageSize });
  } catch (error) { return crmErrorResponse(error); }
}

export async function POST(request: NextRequest) {
  try {
    const principal = await crmPrincipal();
    assertSameOriginMutation(request);
    const input = await request.json();
    manualInquirySchema.parse(input);
    const result = await new LeadService().createManual(principal, input);
    return NextResponse.json({ inquiry: inquiryDto(result.inquiry), duplicateCandidates: result.duplicateCandidates }, { status: 201 });
  } catch (error) { return crmErrorResponse(error); }
}
