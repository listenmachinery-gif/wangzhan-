import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { revokeSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ code: "UNTRUSTED_ORIGIN" }, { status: 403 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) await revokeSession(token);
  cookieStore.delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
