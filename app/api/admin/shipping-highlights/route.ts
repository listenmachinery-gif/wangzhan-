import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { shippingErrorResponse } from "@/lib/http/shipping-response";
import { ShippingHighlightService } from "@/lib/services/shipping-highlight-service";

export async function GET(request: NextRequest) {
  try {
    const principal = await requirePermission("shipping.read");
    return NextResponse.json(await new ShippingHighlightService().list(principal, Object.fromEntries(request.nextUrl.searchParams)));
  } catch (error) {
    return shippingErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOriginMutation(request);
    const principal = await requirePermission("shipping.write");
    return NextResponse.json(await new ShippingHighlightService().create(principal, await request.json()), { status: 201 });
  } catch (error) {
    return shippingErrorResponse(error);
  }
}
