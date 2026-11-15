import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { productAdminErrorResponse } from "@/lib/http/product-admin-response";
import { ProductAdminService } from "@/lib/services/product-admin-service";

export async function GET(request: NextRequest) {
  try {
    const principal = await requirePermission("category.read");
    const result = await new ProductAdminService().listCategories(principal, Object.fromEntries(request.nextUrl.searchParams));
    return NextResponse.json(result);
  } catch (error) {
    return productAdminErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOriginMutation(request);
    const principal = await requirePermission("category.write");
    const category = await new ProductAdminService().createCategory(principal, await request.json());
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return productAdminErrorResponse(error);
  }
}
