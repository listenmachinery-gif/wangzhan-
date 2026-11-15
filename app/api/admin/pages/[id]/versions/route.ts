import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { pageErrorResponse } from "@/lib/http/page-response";
import { PageService } from "@/lib/services/page-service";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try { const principal = await requirePermission("page.read"); const { id } = await context.params; return NextResponse.json(await new PageService().versions(principal, id)); }
  catch (error) { return pageErrorResponse(error); }
}
