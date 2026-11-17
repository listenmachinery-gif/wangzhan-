import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { shippingErrorResponse } from "@/lib/http/shipping-response";
import { ShippingHighlightService } from "@/lib/services/shipping-highlight-service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, context: Context) {
  try {
    const principal = await requirePermission("shipping.read");
    const { id } = await context.params;
    return NextResponse.json(await new ShippingHighlightService().get(principal, id));
  } catch (error) {
    return shippingErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    assertSameOriginMutation(request);
    const principal = await requirePermission("shipping.write");
    const { id } = await context.params;
    return NextResponse.json(await new ShippingHighlightService().saveDraft(principal, id, await request.json()));
  } catch (error) {
    return shippingErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    assertSameOriginMutation(request);
    const principal = await requirePermission("shipping.publish");
    const { id } = await context.params;
    return NextResponse.json(await new ShippingHighlightService().archive(principal, id, await request.json()));
  } catch (error) {
    return shippingErrorResponse(error);
  }
}
