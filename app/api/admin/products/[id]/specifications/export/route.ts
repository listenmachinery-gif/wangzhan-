import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { specificationErrorResponse } from "@/lib/http/specification-response";
import { SpecificationImportService } from "@/lib/services/specification-import-service";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const principal = await requirePermission("specification.read");
    const { id } = await context.params;
    const templateId = request.nextUrl.searchParams.get("templateId") ?? "";
    const format = request.nextUrl.searchParams.get("format") === "xlsx" ? "xlsx" : "csv";
    const exported = await new SpecificationImportService().exportProduct(principal, id, templateId, format);
    return new NextResponse(exported.buffer, {
      headers: {
        "content-type": exported.mimeType,
        "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(exported.filename)}`,
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    return specificationErrorResponse(error);
  }
}
