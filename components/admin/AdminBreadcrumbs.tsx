"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const labels: Record<string, string> = {
  customers: "客户管理", analytics: "数据分析", banners: "Banner 管理", leads: "询盘 CRM", inquiries: "询盘 CRM", media: "媒体资源", navigation: "导航管理",
  pages: "页面设计", "product-categories": "产品分类", products: "产品管理",
  seo: "SEO 管理", settings: "系统设置", "shipping-highlights": "发货集锦", specifications: "型号参数", users: "用户与权限", visitors: "访客分析",
};

function getSegmentLabel(segment: string, index: number, segments: string[]) {
  if (segment === "new") {
    const parent = segments[index - 1];
    if (parent === "customers") return "新增客户";
    if (parent === "inquiries") return "新增询盘";
    if (parent === "products") return "新建产品";
    if (parent === "pages") return "新建页面";
    if (parent === "seo") return "新建 SEO 页面";
    if (parent === "shipping-highlights") return "新建发货记录";
  }
  if (index > 0 && segments[index - 1] === "customers") return "客户详情";
  return labels[segment] ?? (index > 0 ? "详情" : segment);
}

export function AdminBreadcrumbs({ currentPath }: { currentPath?: string }) {
  const pathname = usePathname();
  const segments = (currentPath ?? pathname).split("/").filter(Boolean).slice(1);
  const crumbs = [
    { href: "/admin", label: "数据总览" },
    ...segments.map((segment, index) => ({
      href: `/admin/${segments.slice(0, index + 1).join("/")}`,
      label: getSegmentLabel(segment, index, segments),
    })),
  ];

  return (
    <nav aria-label="面包屑" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1 text-xs text-admin-muted">
        {crumbs.map((crumb, index) => {
          const current = index === crumbs.length - 1;
          return (
            <li key={`${crumb.href}-${index}`} className="flex min-w-0 items-center gap-1">
              {index > 0 ? <ChevronRight aria-hidden className="size-3.5 shrink-0 text-neutral-400" /> : null}
              {current ? (
                <span aria-current="page" className="truncate font-medium text-admin-ink">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="truncate rounded-sm outline-none transition-colors hover:text-admin-ink focus-visible:ring-2 focus-visible:ring-ignition">{crumb.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
