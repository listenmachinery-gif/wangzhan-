"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  ChartNoAxesCombined, FileImage, FilePenLine, Gauge, Images, KeyRound,
  PackageSearch, SearchCheck, Settings, SlidersHorizontal, Tags, Users,
} from "lucide-react";

import { can, type Permission, type Principal } from "@/lib/auth/permissions";

export type NavigationItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  permission?: Permission;
  anyPermission?: Permission[];
};

export type NavigationGroup = {
  label: "经营概览" | "客户增长" | "内容运营" | "系统管理";
  items: NavigationItem[];
};

const navigationGroups: NavigationGroup[] = [
  {
    label: "经营概览",
    items: [
      { href: "/admin", label: "数据总览", icon: Gauge },
      { href: "/admin/analytics", label: "数据分析", icon: ChartNoAxesCombined, permission: "analytics.read.summary" },
    ],
  },
  {
    label: "客户增长",
    items: [
      { href: "/admin/leads", label: "询盘 CRM", icon: Users, anyPermission: ["lead.read.all", "lead.read.assigned"] },
    ],
  },
  {
    label: "内容运营",
    items: [
      { href: "/admin/pages", label: "页面设计", icon: FilePenLine, permission: "page.read" },
      { href: "/admin/banners", label: "Banner 管理", icon: FileImage, permission: "banner.read" },
      { href: "/admin/product-categories", label: "产品分类", icon: Tags, permission: "category.read" },
      { href: "/admin/products", label: "产品管理", icon: PackageSearch, permission: "product.read" },
      { href: "/admin/specifications", label: "型号参数", icon: SlidersHorizontal, permission: "specification.read" },
      { href: "/admin/media", label: "媒体资源", icon: Images, permission: "media.read" },
      { href: "/admin/seo", label: "SEO 管理", icon: SearchCheck, permission: "seo.read" },
    ],
  },
  {
    label: "系统管理",
    items: [
      { href: "/admin/users", label: "用户与权限", icon: KeyRound, permission: "user.manage" },
      { href: "/admin/settings", label: "系统设置", icon: Settings, permission: "settings.write" },
    ],
  },
];

function mayViewItem(principal: Principal, item: NavigationItem) {
  return (!item.permission || can(principal, item.permission))
    && (!item.anyPermission || item.anyPermission.some((permission) => can(principal, permission, {
      assigneeId: principal.id,
      assignmentActive: true,
    })));
}

export function getAdminNavigationGroups(principal: Principal) {
  return navigationGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => mayViewItem(principal, item)) }))
    .filter((group) => group.items.length > 0);
}

export function getAdminNavigation(principal: Principal) {
  return getAdminNavigationGroups(principal).flatMap((group) => group.items);
}

export function AdminSidebar({ principal, currentPath, collapsed, onNavigate }: {
  principal: Principal;
  currentPath?: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const activePath = currentPath ?? pathname;

  return (
    <nav aria-label="后台主导航" className="flex h-full flex-col overflow-hidden bg-graphite-950 text-white">
      <div className={`border-b border-white/10 ${collapsed ? "px-4 py-5" : "px-5 py-5"}`}>
        <div className="flex items-center gap-3">
          <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-admin-sm border border-ignition/35 bg-ignition/10 text-sm font-bold text-neon">Z</span>
          <div className={collapsed ? "sr-only" : "min-w-0"}>
            <p className="text-sm font-semibold tracking-[0.18em] text-white">ZYRON</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-zinc-500">Global Commerce OS</p>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {getAdminNavigationGroups(principal).map((group) => (
          <section key={group.label} aria-labelledby={`admin-nav-${group.label}`}>
            <h2 id={`admin-nav-${group.label}`} className={collapsed ? "sr-only" : "mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500"}>
              {group.label}
            </h2>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = item.href === "/admin" ? activePath === item.href : activePath.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    aria-label={item.label}
                    title={collapsed ? item.label : undefined}
                    data-collapsed={collapsed ? "true" : "false"}
                    onClick={onNavigate}
                    className={`group relative flex min-h-11 items-center gap-3 rounded-admin-sm px-3 text-sm outline-none transition duration-admin focus-visible:ring-2 focus-visible:ring-ignition ${active ? "bg-white font-semibold text-graphite-950 shadow-sm" : "text-zinc-400 hover:bg-white/[0.07] hover:text-white"}`}
                  >
                    {active ? <span aria-hidden className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-ignition" /> : null}
                    <Icon className={`size-[18px] shrink-0 ${active ? "text-ignition" : "text-zinc-500 group-hover:text-zinc-300"}`} aria-hidden />
                    <span className={collapsed ? "sr-only" : "truncate"}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <div className={`border-t border-white/10 ${collapsed ? "p-3" : "px-5 py-4"}`}>
        <p className={collapsed ? "sr-only" : "text-[10px] uppercase tracking-[0.12em] text-zinc-600"}>ZYRON CMS · Secure workspace</p>
      </div>
    </nav>
  );
}
