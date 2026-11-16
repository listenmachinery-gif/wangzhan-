"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import type { Principal } from "@/lib/auth/permissions";

export function AdminTopbar({ principal, collapsed, mobileOpen, onToggleCollapsed, onToggleMobile, status }: {
  principal: Principal;
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapsed(): void;
  onToggleMobile(): void;
  status?: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const initials = principal.name.trim().slice(0, 2).toUpperCase() || "ZY";

  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-admin-border bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label={mobileOpen ? "关闭导航" : "打开导航"}
          onClick={onToggleMobile}
          className="rounded-admin-sm p-2 text-neutral-700 outline-none transition duration-admin hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-ignition lg:hidden"
        >
          {mobileOpen ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
        </button>
        <button
          type="button"
          aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
          onClick={onToggleCollapsed}
          className="hidden rounded-admin-sm p-2 text-neutral-600 outline-none transition duration-admin hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-ignition lg:block"
        >
          {collapsed ? <PanelLeftOpen aria-hidden className="size-5" /> : <PanelLeftClose aria-hidden className="size-5" />}
        </button>
        <AdminBreadcrumbs />
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {status ? <div className="flex items-center text-xs text-admin-muted">{status}</div> : null}
        <div className="relative">
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={menuOpen ? "关闭管理员菜单" : "打开管理员菜单"}
            aria-expanded={menuOpen}
            aria-controls="admin-account-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-admin-sm p-1.5 pr-2 text-left outline-none transition duration-admin hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-ignition"
          >
            <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-graphite-950 text-xs font-semibold text-white">{initials}</span>
            <span className="hidden max-w-36 sm:block">
              <span className="block truncate text-xs font-semibold text-admin-ink">{principal.name}</span>
              <span className="block truncate text-[10px] uppercase tracking-[0.08em] text-admin-muted">{principal.roles.join(" · ")}</span>
            </span>
            <ChevronDown aria-hidden className={`hidden size-3.5 text-neutral-400 transition-transform sm:block ${menuOpen ? "rotate-180" : ""}`} />
          </button>
          {menuOpen ? (
            <div id="admin-account-menu" role="dialog" aria-label="管理员账户" className="absolute right-0 top-[calc(100%+0.5rem)] w-72 rounded-admin border border-admin-border bg-white p-4 shadow-lg">
              <p className="text-sm font-semibold text-admin-ink">{principal.name}</p>
              <p className="mt-1 break-all text-xs text-admin-muted">{principal.email}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {principal.roles.map((role) => (
                  <span key={role} className="rounded-full bg-neutral-100 px-2 py-1 text-[10px] font-semibold tracking-wide text-neutral-600">{role}</span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
