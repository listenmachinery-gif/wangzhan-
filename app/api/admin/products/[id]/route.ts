import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { productAdminErrorResponse } from "@/lib/http/product-admin-response";
import { ProductAdminService } from "@/lib/services/product-admin-service";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const principal = await requirePermission("product.read");
    const { id } = await context.params;
    return NextResponse.json(await new ProductAdminService().getProduct(principal, id));
  } catch (error) {
    return productAdminErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOriginMutation(request);
    const principal = await requirePermission("product.write");
    const { id } = await context.params;
    const body = await request.json();
    const service = new ProductAdminService();
    const product = Array.isArray(body?.sections)
      ? await service.saveSections(principal, id, body)
      : await service.updateProduct(principal, id, body);
    return NextResponse.json(product);
  } catch (error) {
    return productAdminErrorResponse(error);
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOriginMutation(request);
    const principal = await requirePermission("product.write");
    const { id } = await context.params;
    const body = await request.json();
    if (body?.action !== "copy") return NextResponse.json({ code: "INVALID_ACTION" }, { status: 400 });
    const product = await new ProductAdminService().copyProduct(principal, id, body);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return productAdminErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOriginMutation(request);
    const principal = await requirePermission("product.publish");
    const { id } = await context.params;
    const body = await request.json();
    return NextResponse.json(await new ProductAdminService().archiveProduct(principal, id, Number(body.version)));
  } catch (error) {
    return productAdminErrorResponse(error);
  }
}
