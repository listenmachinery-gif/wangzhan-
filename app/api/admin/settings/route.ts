import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { administrationErrorResponse } from "@/lib/http/administration-response";
import { SettingsService } from "@/lib/services/settings-service";

export async function GET() {
  try { const principal = await requirePermission("settings.write"); return NextResponse.json(await new SettingsService().list(principal)); }
  catch (error) { return administrationErrorResponse(error); }
}
export async function PUT(request: NextRequest) {
  try { assertSameOriginMutation(request); const principal = await requirePermission("settings.write"); const body = await request.json(); return NextResponse.json(await new SettingsService().saveMany(principal, body.settings)); }
  catch (error) { return administrationErrorResponse(error); }
}
