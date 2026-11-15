import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { bannerErrorResponse } from "@/lib/http/banner-response";
import { BannerService } from "@/lib/services/banner-service";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOriginMutation(request);
    const principal = await requirePermission("banner.publish");
    const { id } = await context.params;
    return NextResponse.json(await new BannerService().publish(principal, id, await request.json()));
  } catch (error) {
    return bannerErrorResponse(error);
  }
}

