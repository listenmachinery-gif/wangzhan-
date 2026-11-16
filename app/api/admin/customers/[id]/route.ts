import { NextRequest, NextResponse } from "next/server";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { crmErrorResponse, crmPrincipal } from "@/lib/http/crm-response";
import { CustomerService } from "@/lib/services/customer-service";
import { customerUpdateSchema } from "@/lib/validation/crm";
type Context = { params: Promise<{ id: string }> };
export async function GET(_: NextRequest, context: Context) {
  try {
    const principal = await crmPrincipal();
    const { id } = await context.params;
    return NextResponse.json(await new CustomerService().get(principal, id));
  } catch (error) { return crmErrorResponse(error); }
}
export async function PATCH(request: NextRequest, context: Context) {
  try {
    const principal = await crmPrincipal();
    assertSameOriginMutation(request);
    const { id } = await context.params;
    const input = await request.json();
    customerUpdateSchema.parse(input);
    return NextResponse.json(await new CustomerService().update(principal, id, input));
  } catch (error) { return crmErrorResponse(error); }
}
