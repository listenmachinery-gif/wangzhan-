"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { LiveVisitorMonitor } from "@/components/admin/analytics/LiveVisitorMonitor";
import { can, type Principal } from "@/lib/auth/permissions";

export function AdminShell({ principal, children }: { principal: Principal; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    mobileCloseRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

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
            <button
              ref={mobileCloseRef}
              type="button"
              aria-label="关闭移动导航"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-admin-sm bg-white/10 p-2 text-white outline-none focus-visible:ring-2 focus-visible:ring-ignition"
            >
              <span aria-hidden>×</span>
            </button>
            <AdminSidebar principal={principal} collapsed={false} onNavigate={() => setMobileOpen(false)} />
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
          status={<LiveVisitorMonitor enabled={can(principal, "analytics.read.summary")} />}
        />
        <main className="p-4 sm:p-6 lg:p-8 xl:p-10">{children}</main>
      </div>
    </div>
  );
}
