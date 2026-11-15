import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { specificationErrorResponse } from "@/lib/http/specification-response";
import { SpecificationService } from "@/lib/services/specification-service";

export async function GET(request: NextRequest) {
  try {
    const principal = await requirePermission("specification.read");
    const categoryId = request.nextUrl.searchParams.get("categoryId") ?? undefined;
    return NextResponse.json(await new SpecificationService().listTemplates(principal, categoryId));
  } catch (error) {
    return specificationErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOriginMutation(request);
    const principal = await requirePermission("specification.write");
    const template = await new SpecificationService().createTemplate(principal, await request.json());
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    return specificationErrorResponse(error);
  }
}
