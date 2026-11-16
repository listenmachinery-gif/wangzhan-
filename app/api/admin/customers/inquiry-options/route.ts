import { NextRequest, NextResponse } from "next/server";
import { crmErrorResponse, crmPrincipal } from "@/lib/http/crm-response";
import { CustomerService } from "@/lib/services/customer-service";
import { inquiryCustomerOptionsQuerySchema } from "@/lib/validation/crm";

export async function GET(request: NextRequest) {
  try {
    const principal = await crmPrincipal();
    const query = inquiryCustomerOptionsQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    return NextResponse.json(await new CustomerService().inquiryOptions(principal, query));
  } catch (error) { return crmErrorResponse(error); }
}
