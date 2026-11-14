import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { productAdminErrorResponse } from "@/lib/http/product-admin-response";
import { ProductAdminService } from "@/lib/services/product-admin-service";

export async function GET(request: NextRequest) {
  try {
    const principal = await requirePermission("product.read");
    const result = await new ProductAdminService().listProducts(principal, Object.fromEntries(request.nextUrl.searchParams));
    return NextResponse.json(result);
  } catch (error) {
    return productAdminErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOriginMutation(request);
    const principal = await requirePermission("product.write");
    const product = await new ProductAdminService().createProduct(principal, await request.json());
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return productAdminErrorResponse(error);
  }
}
