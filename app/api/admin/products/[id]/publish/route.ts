import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { productAdminErrorResponse } from "@/lib/http/product-admin-response";
import { ProductAdminService } from "@/lib/services/product-admin-service";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOriginMutation(request);
    const principal = await requirePermission("product.publish");
    const { id } = await context.params;
    const body = await request.json();
    const product = await new ProductAdminService().publishProduct(principal, id, Number(body.version));
    return NextResponse.json(product);
  } catch (error) {
    return productAdminErrorResponse(error);
  }
}
