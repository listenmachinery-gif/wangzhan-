"use client";
import { useState } from "react";
import { ROLES, type RoleKey } from "@/lib/auth/permissions";

type UserValue = { id: string; email: string; name: string; isActive: boolean; updatedAt: string | Date; roles: { role: { key: string; name: string } }[]; twoFactor: { enabled: boolean; configurable: boolean } };
export function UserEditor({ initialUser, assignableRoles }: { initialUser: UserValue; assignableRoles: RoleKey[] }) {
  const [user, setUser] = useState(initialUser); const [message, setMessage] = useState("");
  async function save(formData: FormData) {
    setMessage("");
    const response = await fetch(`/api/admin/users/${user.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: formData.get("name"), isActive: formData.get("isActive") === "on", roles: formData.getAll("roles"), updatedAt: new Date(user.updatedAt).toISOString() }) });
    const result = await response.json(); if (!response.ok) return setMessage(result.message || result.code); setUser(result); setMessage("用户已保存；权限变更将在下次请求生效");
  }
  const selected = new Set(user.roles.map(({ role }) => role.key));
  return <form action={save} className="grid gap-5 rounded-xl border bg-white p-6"><div><p className="text-xs text-neutral-500">登录邮箱（不可修改）</p><p className="mt-1 font-medium">{user.email}</p></div><label className="grid gap-2 text-sm font-medium">姓名<input name="name" required maxLength={120} defaultValue={user.name} className="h-11 rounded-lg border px-3" /></label><fieldset className="grid gap-3"><legend className="text-sm font-medium">角色</legend>{ROLES.filter((role) => assignableRoles.includes(role)).map((role) => <label key={role} className="flex items-center gap-3 text-sm"><input type="checkbox" name="roles" value={role} defaultChecked={selected.has(role)} />{role}</label>)}</fieldset><label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" name="isActive" defaultChecked={user.isActive} />账号启用</label><div className="rounded-lg border bg-neutral-50 p-4 text-sm"><strong>双因素认证（2FA）</strong><p className="mt-1 text-neutral-600">尚未配置；当前版本不可启用。</p></div><button className="h-11 rounded-lg bg-[#0B0D10] font-semibold text-white">保存用户</button><p role="status" className="text-sm text-[#5F9500]">{message}</p></form>;
}
