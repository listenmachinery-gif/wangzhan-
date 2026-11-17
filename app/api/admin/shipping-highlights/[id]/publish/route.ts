import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { shippingErrorResponse } from "@/lib/http/shipping-response";
import { ShippingHighlightService } from "@/lib/services/shipping-highlight-service";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOriginMutation(request);
    const principal = await requirePermission("shipping.publish");
    const { id } = await context.params;
    return NextResponse.json(await new ShippingHighlightService().publish(principal, id, await request.json()));
  } catch (error) {
    return shippingErrorResponse(error);
  }
}
