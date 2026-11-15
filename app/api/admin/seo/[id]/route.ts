import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { seoErrorResponse } from "@/lib/http/seo-response";
import { SeoService } from "@/lib/services/seo-service";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try { const principal = await requirePermission("seo.read"); const { id } = await context.params; return NextResponse.json(await new SeoService().get(principal, id)); }
  catch (error) { return seoErrorResponse(error); }
}
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try { assertSameOriginMutation(request); const principal = await requirePermission("seo.read"); const { id } = await context.params; return NextResponse.json(await new SeoService().update(principal, id, await request.json())); }
  catch (error) { return seoErrorResponse(error); }
}
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try { assertSameOriginMutation(request); const principal = await requirePermission("seo.publish"); const { id } = await context.params; return NextResponse.json(await new SeoService().publish(principal, id, await request.json())); }
  catch (error) { return seoErrorResponse(error); }
}
