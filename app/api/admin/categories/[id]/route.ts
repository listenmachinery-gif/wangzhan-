import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { productAdminErrorResponse } from "@/lib/http/product-admin-response";
import { ProductAdminService } from "@/lib/services/product-admin-service";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOriginMutation(request);
    const principal = await requirePermission("category.write");
    const { id } = await context.params;
    const category = await new ProductAdminService().updateCategory(principal, id, await request.json());
    return NextResponse.json(category);
  } catch (error) {
    return productAdminErrorResponse(error);
  }
}
