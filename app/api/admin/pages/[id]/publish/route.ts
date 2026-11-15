import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { pageErrorResponse } from "@/lib/http/page-response";
import { PageService } from "@/lib/services/page-service";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try { assertSameOriginMutation(request); const principal = await requirePermission("page.publish"); const { id } = await context.params; return NextResponse.json(await new PageService().publish(principal, id, await request.json())); }
  catch (error) { return pageErrorResponse(error); }
}
