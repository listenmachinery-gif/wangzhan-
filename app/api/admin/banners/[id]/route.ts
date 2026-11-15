import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/guards";
import { assertSameOriginMutation } from "@/lib/auth/request-security";
import { bannerErrorResponse } from "@/lib/http/banner-response";
import { BannerService } from "@/lib/services/banner-service";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const principal = await requirePermission("banner.read");
    const { id } = await context.params;
    return NextResponse.json(await new BannerService().get(principal, id));
  } catch (error) {
    return bannerErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOriginMutation(request);
    const principal = await requirePermission("banner.write");
    const { id } = await context.params;
    return NextResponse.json(await new BannerService().update(principal, id, await request.json()));
  } catch (error) {
    return bannerErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOriginMutation(request);
    const principal = await requirePermission("banner.write");
    const { id } = await context.params;
    return NextResponse.json(await new BannerService().archive(principal, id, await request.json()));
  } catch (error) {
    return bannerErrorResponse(error);
  }
}

