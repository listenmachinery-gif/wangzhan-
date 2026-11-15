import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { pageErrorResponse } from "@/lib/http/page-response";
import { PageService } from "@/lib/services/page-service";

export async function GET(request: NextRequest) {
  try {
    const principal = await requirePermission("page.read");
    return NextResponse.json(await new PageService().list(principal, Object.fromEntries(request.nextUrl.searchParams)));
  } catch (error) { return pageErrorResponse(error); }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOriginMutation(request);
    const principal = await requirePermission("page.write");
    return NextResponse.json(await new PageService().create(principal, await request.json()), { status: 201 });
  } catch (error) { return pageErrorResponse(error); }
}
