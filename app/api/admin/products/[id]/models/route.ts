import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { specificationErrorResponse } from "@/lib/http/specification-response";
import { SpecificationService } from "@/lib/services/specification-service";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const principal = await requirePermission("specification.read");
    const { id } = await context.params;
    return NextResponse.json(await new SpecificationService().getProductGrid(principal, id));
  } catch (error) {
    return specificationErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOriginMutation(request);
    const principal = await requirePermission("specification.write");
    const { id } = await context.params;
    return NextResponse.json(await new SpecificationService().saveModels(principal, id, await request.json()));
  } catch (error) {
    return specificationErrorResponse(error);
  }
}
