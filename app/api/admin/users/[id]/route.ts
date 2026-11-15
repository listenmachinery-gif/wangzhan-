import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { administrationErrorResponse } from "@/lib/http/administration-response";
import { UserAdminService } from "@/lib/services/user-admin-service";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try { const principal = await requirePermission("user.manage"); const { id } = await context.params; return NextResponse.json(await new UserAdminService().get(principal, id)); }
  catch (error) { return administrationErrorResponse(error); }
}
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try { assertSameOriginMutation(request); const principal = await requirePermission("user.manage"); const { id } = await context.params; return NextResponse.json(await new UserAdminService().update(principal, id, await request.json())); }
  catch (error) { return administrationErrorResponse(error); }
}
