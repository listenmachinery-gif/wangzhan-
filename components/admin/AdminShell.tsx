"use client";

import { useState, type ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import type { Principal } from "@/lib/auth/permissions";

export function AdminShell({ principal, children }: { principal: Principal; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F5F6] text-neutral-950">
      <aside className={`fixed inset-y-0 left-0 z-30 hidden transition-[width] lg:block ${collapsed ? "w-20" : "w-64"}`}>
        <AdminSidebar principal={principal} collapsed={collapsed} />
      </aside>
      {mobileOpen ? (
        <div role="dialog" aria-label="后台导航" aria-modal="true" className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="关闭导航遮罩"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <aside className="relative h-full w-72 max-w-[85vw] shadow-2xl">
            <AdminSidebar principal={principal} collapsed={false} />
          </aside>
        </div>
      ) : null}
      <div className={`transition-[padding] ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        <AdminTopbar
          principal={principal}
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onToggleCollapsed={() => setCollapsed((value) => !value)}
          onToggleMobile={() => setMobileOpen((value) => !value)}
        />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
