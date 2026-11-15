import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { bannerErrorResponse } from "@/lib/http/banner-response";
import { BannerService } from "@/lib/services/banner-service";

export async function GET() {
  try {
    const principal = await requirePermission("banner.read");
    return NextResponse.json(await new BannerService().list(principal));
  } catch (error) {
    return bannerErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOriginMutation(request);
    const principal = await requirePermission("banner.write");
    return NextResponse.json(await new BannerService().create(principal, await request.json()), { status: 201 });
  } catch (error) {
    return bannerErrorResponse(error);
  }
}

