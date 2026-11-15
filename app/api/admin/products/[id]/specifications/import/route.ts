import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { specificationErrorResponse } from "@/lib/http/specification-response";
import { SpecificationImportService } from "@/lib/services/specification-import-service";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOriginMutation(request);
    const principal = await requirePermission("specification.write");
    const { id } = await context.params;
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ code: "FILE_REQUIRED", message: "Choose a CSV or XLSX file." }, { status: 400 });
    const result = await new SpecificationImportService().importProduct(principal, id, {
      version: Number(form.get("version")),
      templateId: String(form.get("templateId") ?? ""),
      filename: file.name,
      bytes: new Uint8Array(await file.arrayBuffer()),
    });
    return NextResponse.json(result, { status: result.applied ? 200 : 422 });
  } catch (error) {
    return specificationErrorResponse(error);
  }
}
