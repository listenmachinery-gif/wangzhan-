"use client";

import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import type { Principal } from "@/lib/auth/permissions";

export function AdminTopbar({
  principal,
  collapsed,
  mobileOpen,
  onToggleCollapsed,
  onToggleMobile,
}: {
  principal: Principal;
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapsed(): void;
  onToggleMobile(): void;
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={mobileOpen ? "关闭导航" : "打开导航"}
          onClick={onToggleMobile}
          className="rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 lg:hidden"
        >
          {mobileOpen ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
        </button>
        <button
          type="button"
          aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
          onClick={onToggleCollapsed}
          className="hidden rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 lg:block"
        >
          {collapsed ? <PanelLeftOpen aria-hidden className="h-5 w-5" /> : <PanelLeftClose aria-hidden className="h-5 w-5" />}
        </button>
        <p className="text-sm font-medium text-neutral-700">ZYRON CMS</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-neutral-900">{principal.name}</p>
        <p className="text-xs text-neutral-500">{principal.roles.join(" · ")}</p>
      </div>
    </header>
  );
}
