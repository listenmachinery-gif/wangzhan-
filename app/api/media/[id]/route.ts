import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db/client";
import { getStorageAdapter } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const asset = await db.mediaAsset.findFirst({
    where: { id, lifecycleStatus: "ACTIVE" },
    select: { objectKey: true },
  });
  if (!asset) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  try {
    const url = await getStorageAdapter().getSignedUrl(asset.objectKey);
    const local = /^data:([^;,]+);base64,([A-Za-z0-9+/=]+)$/.exec(url);
    if (local) {
      return new NextResponse(new Uint8Array(Buffer.from(local[2], "base64")), {
        headers: { "content-type": local[1], "cache-control": "private, no-store" },
      });
    }
    return NextResponse.redirect(url, { headers: { "cache-control": "private, no-store" } });
  } catch {
    return NextResponse.json({ code: "MEDIA_UNAVAILABLE" }, { status: 503 });
  }
}
