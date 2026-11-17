import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { navigationErrorResponse } from "@/lib/http/navigation-response";
import { NavigationService } from "@/lib/services/navigation-service";

export async function GET() {
  try {
    const principal = await requirePermission("navigation.read");
    return NextResponse.json(await new NavigationService().versions(principal));
  } catch (error) {
    return navigationErrorResponse(error);
  }
}
