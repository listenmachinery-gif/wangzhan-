import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { shippingErrorResponse } from "@/lib/http/shipping-response";
import { ShippingHighlightService } from "@/lib/services/shipping-highlight-service";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const principal = await requirePermission("shipping.read");
    const { id } = await context.params;
    return NextResponse.json(await new ShippingHighlightService().versions(principal, id));
  } catch (error) {
    return shippingErrorResponse(error);
  }
}
