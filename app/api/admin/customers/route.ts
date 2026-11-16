import { NextRequest, NextResponse } from "next/server";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { crmErrorResponse, crmPrincipal } from "@/lib/http/crm-response";
import { CustomerService } from "@/lib/services/customer-service";
import { customerCreateSchema, customerListQuerySchema } from "@/lib/validation/crm";
export async function GET(request: NextRequest) {
  try {
    const principal = await crmPrincipal();
    const query = Object.fromEntries(request.nextUrl.searchParams);
    customerListQuerySchema.parse(query);
    return NextResponse.json(await new CustomerService().list(principal, query));
  } catch (error) { return crmErrorResponse(error); }
}
export async function POST(request: NextRequest) {
  try {
    const principal = await crmPrincipal();
    assertSameOriginMutation(request);
    const input = await request.json();
    customerCreateSchema.parse(input);
    return NextResponse.json(await new CustomerService().create(principal, input), { status: 201 });
  } catch (error) { return crmErrorResponse(error); }
}
