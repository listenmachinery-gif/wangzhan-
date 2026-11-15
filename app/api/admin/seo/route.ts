import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { seoErrorResponse } from "@/lib/http/seo-response";
import { SeoService } from "@/lib/services/seo-service";

export async function GET(request: NextRequest) {
  try { const principal = await requirePermission("seo.read"); return NextResponse.json(await new SeoService().list(principal, Object.fromEntries(request.nextUrl.searchParams))); }
  catch (error) { return seoErrorResponse(error); }
}
export async function POST(request: NextRequest) {
  try { assertSameOriginMutation(request); const principal = await requirePermission("seo.read"); return NextResponse.json(await new SeoService().create(principal, await request.json()), { status: 201 }); }
  catch (error) { return seoErrorResponse(error); }
}
