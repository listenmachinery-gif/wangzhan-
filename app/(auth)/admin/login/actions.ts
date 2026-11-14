"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { attemptLogin } from "@/lib/auth/login";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

export type LoginActionState = { error?: string };

export async function loginAction(_state: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const headerStore = await headers();
  const networkKey = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const email = String(formData.get("email") ?? "");
  const result = await attemptLogin(
    { email, password: String(formData.get("password") ?? "") },
    { accountKey: email, networkKey, userAgent: headerStore.get("user-agent") ?? undefined },
  );

  if (!result.ok) {
    return {
      error: result.code === "RATE_LIMITED" ? "登录尝试过多，请稍后重试。" : "邮箱或密码不正确。",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, result.token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: result.expiresAt,
  });
  redirect("/admin");
}
