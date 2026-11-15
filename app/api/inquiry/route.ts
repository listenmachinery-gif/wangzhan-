import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { InquiryService } from "@/lib/services/inquiry-service";
import {
  decodeInquiryJson,
  InquiryPayloadTooLargeError,
  MalformedInquiryJsonError,
  MAX_INQUIRY_BODY_BYTES,
} from "@/lib/validation/inquiries";

export const runtime = "nodejs";

function networkKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || "unknown";
}

function sourcePage(request: Request) {
  const referer = request.headers.get("referer");
  if (!referer) return undefined;
  try {
    const url = new URL(referer);
    return `${url.pathname}${url.search}`.slice(0, 2_000);
  } catch {
    return undefined;
  }
}

export async function POST(request: Request) {
  try {
    const declaredLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_INQUIRY_BODY_BYTES) {
      throw new InquiryPayloadTooLargeError();
    }

    const decoded = decodeInquiryJson(await request.text());
    const payload = decoded && typeof decoded === "object" && !Array.isArray(decoded)
      ? { ...decoded, sourcePage: (decoded as Record<string, unknown>).sourcePage ?? sourcePage(request) }
      : decoded;
    const result = await new InquiryService().acceptInquiry(payload, {
      networkKey: networkKey(request),
    });

    return NextResponse.json({
      message: "Thank you. Your inquiry has been received. Our team will reply soon.",
      reference: result.reference,
    }, { status: 202 });
  } catch (error) {
    if (error instanceof InquiryPayloadTooLargeError) {
      return NextResponse.json({ message: error.message }, { status: 413 });
    }
    if (error instanceof MalformedInquiryJsonError || error instanceof ZodError) {
      return NextResponse.json({ message: "Please check the inquiry details and try again." }, { status: 400 });
    }
    console.error("Inquiry intake failed.", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json(
      { message: "Inquiry intake is temporarily unavailable. Please try again shortly." },
      { status: 503 },
    );
  }
}
