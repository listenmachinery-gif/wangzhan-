"use client";

import { useActionState } from "react";

import { loginAction } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});

  return (
    <form action={action} className="space-y-5">
      <label className="block text-sm font-medium text-neutral-700">
        管理员邮箱
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-[#76B900] focus:ring-2 focus:ring-[#76B900]/20"
        />
      </label>
      <label className="block text-sm font-medium text-neutral-700">
        密码
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={12}
          required
          className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-[#76B900] focus:ring-2 focus:ring-[#76B900]/20"
        />
      </label>
      {state.error ? <p role="alert" className="text-sm text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[#76B900] px-4 py-3 font-semibold text-[#0B0D10] disabled:opacity-60"
      >
        {pending ? "正在登录…" : "登录 ZYRON CMS"}
      </button>
    </form>
  );
}
