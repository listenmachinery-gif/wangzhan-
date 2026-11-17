import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { navigationErrorResponse } from "@/lib/http/navigation-response";
import { NavigationService } from "@/lib/services/navigation-service";

export async function POST(request: NextRequest) {
  try {
    assertSameOriginMutation(request);
    const principal = await requirePermission("navigation.write");
    return NextResponse.json(await new NavigationService().rollback(principal, await request.json()));
  } catch (error) {
    return navigationErrorResponse(error);
  }
}

