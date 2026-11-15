import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { administrationErrorResponse } from "@/lib/http/administration-response";
import { UserAdminService } from "@/lib/services/user-admin-service";

export async function GET() {
  try { const principal = await requirePermission("user.manage"); return NextResponse.json(await new UserAdminService().list(principal)); }
  catch (error) { return administrationErrorResponse(error); }
}
