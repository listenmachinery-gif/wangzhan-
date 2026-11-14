import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { AuthenticationRequiredError, PermissionDeniedError, requirePermission } from "@/lib/auth/guards";
import {
  MediaService,
  MediaServicePermissionError,
} from "@/lib/services/media-service";
import { DuplicateMediaError, MediaPolicyError } from "@/lib/storage/file-signatures";
import { getStorageAdapter } from "@/lib/storage";
import { mediaListQuerySchema, mediaMetadataSchema } from "@/lib/validation/media";

export const runtime = "nodejs";

function errorResponse(error: unknown) {
  if (error instanceof AuthenticationRequiredError) return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  if (error instanceof PermissionDeniedError || error instanceof MediaServicePermissionError) {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  }
  if (error instanceof DuplicateMediaError) {
    return NextResponse.json({ code: error.code, message: error.message }, { status: 409 });
  }
  if (error instanceof MediaPolicyError || error instanceof ZodError) {
    return NextResponse.json(
      { code: error instanceof MediaPolicyError ? error.code : "INVALID_MEDIA", message: error.message },
      { status: 400 },
    );
  }
  console.error("Media API error", error);
  return NextResponse.json({ code: "MEDIA_OPERATION_FAILED" }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    const principal = await requirePermission("media.read");
    const query = mediaListQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const storage = getStorageAdapter();
    const result = await new MediaService(storage).list(principal, query);
    return NextResponse.json({
      ...result,
      items: await Promise.all(
        result.items.map(async (item) => ({
          ...item,
          previewUrl: await storage.getSignedUrl(item.objectKey).catch(() => null),
        })),
      ),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const principal = await requirePermission("media.write");
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ code: "FILE_REQUIRED", message: "请选择文件。" }, { status: 400 });
    }
    const metadata = mediaMetadataSchema.parse({
      altText: formData.get("altText") || null,
      category: formData.get("category") || null,
      usage: formData.get("usage"),
    });
    const storage = getStorageAdapter();
    const asset = await new MediaService(storage).createUpload(principal, {
      filename: file.name,
      declaredMime: file.type,
      bytes: new Uint8Array(await file.arrayBuffer()),
      ...metadata,
    });
    return NextResponse.json(
      { ...asset, _count: { references: 0 }, previewUrl: await storage.getSignedUrl(asset.objectKey) },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
