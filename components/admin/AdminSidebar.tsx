"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  ChartNoAxesCombined,
  FileImage,
  FilePenLine,
  Gauge,
  Images,
  KeyRound,
  PackageSearch,
  SearchCheck,
  Settings,
  SlidersHorizontal,
  Tags,
  Users,
} from "lucide-react";

import { can, type Permission, type Principal } from "@/lib/auth/permissions";

type NavigationItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  permission?: Permission;
  anyPermission?: Permission[];
};

const navigation: NavigationItem[] = [
  { href: "/admin", label: "数据总览", icon: Gauge },
  { href: "/admin/analytics", label: "数据分析", icon: ChartNoAxesCombined, permission: "settings.write" },
  { href: "/admin/pages", label: "页面设计", icon: FilePenLine, permission: "page.read" },
  { href: "/admin/banners", label: "Banner 管理", icon: FileImage, permission: "banner.read" },
  { href: "/admin/product-categories", label: "产品分类", icon: Tags, permission: "category.read" },
  { href: "/admin/products", label: "产品管理", icon: PackageSearch, permission: "product.read" },
  { href: "/admin/specifications", label: "型号参数", icon: SlidersHorizontal, permission: "specification.read" },
  { href: "/admin/media", label: "媒体资源", icon: Images, permission: "media.read" },
  { href: "/admin/leads", label: "询盘 CRM", icon: Users, anyPermission: ["lead.read.all", "lead.read.assigned"] },
  { href: "/admin/seo", label: "SEO 管理", icon: SearchCheck, permission: "seo.read" },
  { href: "/admin/users", label: "用户与权限", icon: KeyRound, permission: "user.manage" },
  { href: "/admin/settings", label: "系统设置", icon: Settings, permission: "settings.write" },
];

export function getAdminNavigation(principal: Principal) {
  return navigation.filter((item) =>
    (!item.permission || can(principal, item.permission))
    && (!item.anyPermission || item.anyPermission.some((permission) => can(principal, permission, {
      assigneeId: principal.id,
      assignmentActive: true,
    }))),
  );
}

export function AdminSidebar({
  principal,
  currentPath,
  collapsed,
}: {
  principal: Principal;
  currentPath?: string;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const activePath = currentPath ?? pathname;

  return (
    <nav aria-label="后台主导航" className="flex h-full flex-col bg-[#0B0D10] text-white">
      <div className="border-b border-white/10 px-5 py-6">
        <p className="text-sm font-semibold tracking-[0.2em] text-[#9EDC38]">ZYRON</p>
        <p className={collapsed ? "sr-only" : "mt-1 text-xs text-zinc-400"}>内容管理系统</p>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto p-3">
        {getAdminNavigation(principal).map((item) => {
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
              className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${
                active ? "bg-[#76B900] font-semibold text-[#0B0D10]" : "text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              <span className={collapsed ? "sr-only" : "truncate"}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
