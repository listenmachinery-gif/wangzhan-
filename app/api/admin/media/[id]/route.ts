import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { AuthenticationRequiredError, PermissionDeniedError, requirePermission } from "@/lib/auth/guards";
import { assertSameOriginMutation, UntrustedOriginError } from "@/lib/auth/request-security";
import {
  MediaInUseError,
  MediaNotFoundError,
  MediaService,
  MediaServicePermissionError,
  MediaUsageInvariantError,
} from "@/lib/services/media-service";
import { getStorageAdapter } from "@/lib/storage";
import { mediaUpdateSchema } from "@/lib/validation/media";

export const runtime = "nodejs";

function errorResponse(error: unknown) {
  if (error instanceof AuthenticationRequiredError) return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  if (error instanceof PermissionDeniedError || error instanceof MediaServicePermissionError) {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  }
  if (error instanceof UntrustedOriginError) return NextResponse.json({ code: "UNTRUSTED_ORIGIN" }, { status: 403 });
  if (error instanceof MediaInUseError) {
    return NextResponse.json({ code: "MEDIA_IN_USE", references: error.references }, { status: 409 });
  }
  if (error instanceof MediaNotFoundError) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  if (error instanceof MediaUsageInvariantError) return NextResponse.json({ code: "ALT_TEXT_REQUIRED" }, { status: 400 });
  if (error instanceof ZodError) return NextResponse.json({ code: "INVALID_MEDIA", message: error.message }, { status: 400 });
  console.error("Media API error", error);
  return NextResponse.json({ code: "MEDIA_OPERATION_FAILED" }, { status: 500 });
}

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const principal = await requirePermission("media.read");
    const { id } = await context.params;
    const references = await new MediaService(getStorageAdapter()).listReferences(principal, id);
    return NextResponse.json({ references });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOriginMutation(request);
    const principal = await requirePermission("media.write");
    const { id } = await context.params;
    const input = mediaUpdateSchema.parse(await request.json());
    const asset = await new MediaService(getStorageAdapter()).updateMetadata(principal, id, input);
    return NextResponse.json(asset);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOriginMutation(request);
    const principal = await requirePermission("media.delete");
    const { id } = await context.params;
    await new MediaService(getStorageAdapter()).deleteUnreferenced(principal, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
