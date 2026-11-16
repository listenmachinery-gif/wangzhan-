// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin" }));

import { AdminShell } from "@/components/admin/AdminShell";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AdminSidebar, getAdminNavigation, getAdminNavigationGroups } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { ConnectionStatus } from "@/components/admin/ConnectionStatus";
import type { Principal } from "@/lib/auth/permissions";

const productEditor: Principal = {
  id: "product-editor",
  email: "product@example.com",
  name: "产品编辑",
  roles: ["PRODUCT_EDITOR"],
};

const contentEditor: Principal = {
  id: "content-editor",
  email: "content@example.com",
  name: "内容编辑",
  roles: ["CONTENT_EDITOR"],
};

const admin: Principal = {
  id: "admin",
  email: "admin@zyroncnc.com",
  name: "管理员",
  roles: ["ADMIN"],
};

afterEach(cleanup);

describe("admin navigation", () => {
  it("filters modules by server-provided principal permissions", () => {
    const labels = getAdminNavigation(productEditor).map((item) => item.label);

    expect(labels).toContain("产品管理");
    expect(labels).toContain("型号参数");
    expect(labels).not.toContain("询盘 CRM");
    expect(labels).not.toContain("用户与权限");
  });

  it.each(["/admin/leads", "/admin/leads/lead-1", "/admin/inquiries", "/admin/inquiries/new"])(
    "uses one inquiry navigation item for a team viewer at %s",
    (currentPath) => {
      const viewer: Principal = { ...admin, roles: ["CRM_VIEWER"] };
      render(<AdminSidebar principal={viewer} currentPath={currentPath} collapsed={false} />);
      const inquiries = screen.getByRole("link", { name: "询盘 CRM" });
      expect(inquiries).toHaveAttribute("href", "/admin/inquiries");
      expect(inquiries).toHaveAttribute("aria-current", "page");
    },
  );

  it("labels the manual inquiry breadcrumbs and returns to the new list URL", () => {
    render(<AdminBreadcrumbs currentPath="/admin/inquiries/new" />);
    expect(screen.getByRole("link", { name: "询盘 CRM" })).toHaveAttribute("href", "/admin/inquiries");
    expect(screen.getByText("新增询盘")).toHaveAttribute("aria-current", "page");
  });

  it("shows the page center only to principals with page permission", () => {
    expect(getAdminNavigation(contentEditor).map((item) => item.label)).toContain("页面设计");
    expect(getAdminNavigation(productEditor).map((item) => item.label)).not.toContain("页面设计");
  });
  it("guards customer management by customer.read and marks nested customer URLs active", () => {
    expect(getAdminNavigation(productEditor).map((item) => item.label)).not.toContain("客户管理");
    expect(getAdminNavigation(contentEditor).map((item) => item.label)).not.toContain("客户管理");
    const viewer: Principal = { ...admin, roles: ["CRM_VIEWER"] };
    render(<AdminSidebar principal={viewer} currentPath="/admin/customers/customer-1" collapsed={false} />);
    expect(screen.getAllByRole("link", { name: "客户管理" })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "客户管理" })).toHaveAttribute("aria-current", "page");
  });

  it("shows analytics only to principals with analytics permission", () => {
    expect(getAdminNavigation(admin).map((item) => item.label)).toContain("数据分析");
    expect(getAdminNavigation(productEditor).map((item) => item.label)).not.toContain("数据分析");
    expect(getAdminNavigation(contentEditor).map((item) => item.label)).not.toContain("数据分析");
  });

  it("groups visible modules in the approved business order", () => {
    const groups = getAdminNavigationGroups(admin);

    expect(groups.map((group) => group.label)).toEqual(["经营概览", "客户增长", "内容运营", "系统管理"]);
    expect(groups[0].items.map((item) => item.label)).toEqual(["数据总览", "数据分析"]);
    expect(groups[1].items.map((item) => item.label)).toEqual(["询盘 CRM", "客户管理", "在线客服"]);
    expect(groups[2].items.map((item) => item.label)).toContain("产品管理");
  });

  it("marks the current page and hides labels when collapsed", () => {
    const { rerender } = render(
      <AdminSidebar principal={productEditor} currentPath="/admin/products" collapsed={false} />,
    );

    expect(screen.getByRole("link", { name: "产品管理" })).toHaveAttribute("aria-current", "page");
    rerender(<AdminSidebar principal={productEditor} currentPath="/admin/products" collapsed />);
    expect(screen.getByRole("link", { name: "产品管理" })).toHaveAttribute("data-collapsed", "true");
  });

  it("toggles the desktop sidebar and mobile drawer", async () => {
    const user = userEvent.setup();
    render(<AdminShell principal={productEditor}><p>工作区</p></AdminShell>);

    const collapse = screen.getByRole("button", { name: "收起侧边栏" });
    await user.click(collapse);
    expect(screen.getByRole("button", { name: "展开侧边栏" })).toBeInTheDocument();

    const mobile = screen.getByRole("button", { name: "打开导航" });
    await user.click(mobile);
    expect(screen.getByRole("dialog", { name: "后台导航" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "关闭移动导航" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "后台导航" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "打开导航" }));
    await user.click(screen.getByRole("button", { name: "关闭导航" }));
    expect(screen.queryByRole("dialog", { name: "后台导航" })).not.toBeInTheDocument();
  });

  it("renders route-aware breadcrumbs", () => {
    render(<AdminBreadcrumbs currentPath="/admin/products/new" />);

    expect(screen.getByRole("navigation", { name: "面包屑" })).toHaveTextContent("数据总览产品管理新建产品");
    expect(screen.getByRole("link", { name: "产品管理" })).toHaveAttribute("href", "/admin/products");
    expect(screen.getByText("新建产品")).toHaveAttribute("aria-current", "page");
  });

  it("opens and closes the accessible administrator menu from the keyboard", async () => {
    const user = userEvent.setup();
    render(
      <AdminTopbar
        principal={admin}
        collapsed={false}
        mobileOpen={false}
        onToggleCollapsed={vi.fn()}
        onToggleMobile={vi.fn()}
      />,
    );

    const menuButton = screen.getByRole("button", { name: "打开管理员菜单" });
    menuButton.focus();
    expect(menuButton).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("dialog", { name: "管理员账户" })).toHaveTextContent(admin.email);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "管理员账户" })).not.toBeInTheDocument();
    expect(menuButton).toHaveFocus();
  });

  it.each([
    ["NOT_CONFIGURED", "未配置"],
    ["INVALID_CONFIG", "配置不完整"],
    ["FORBIDDEN", "无访问权限"],
    ["CONNECTED", "已连接"],
    ["UPSTREAM_UNAVAILABLE", "暂时不可用"],
  ] as const)("renders the %s connection state without fabricated values", (state, label) => {
    render(
      <ConnectionStatus
        service="Google Analytics 4"
        state={state}
        message="安全诊断说明"
        checkedAt="2026-11-16T02:00:00.000Z"
        href="/admin/analytics"
      />,
    );

    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Google Analytics 4/ })).toHaveAttribute("href", "/admin/analytics");
    expect(screen.queryByText(/访客|浏览量/)).not.toBeInTheDocument();
  });
});


it.each([
  { path: "/admin/customers", current: "客户管理" },
  { path: "/admin/customers/new", current: "新增客户" },
  { path: "/admin/customers/customer-1", current: "客户详情" },
])("labels customer breadcrumbs at $path in Chinese", ({ path, current }) => {
  render(<AdminBreadcrumbs currentPath={path} />);
  expect(screen.getByText(current)).toHaveAttribute("aria-current", "page");
  if (path !== "/admin/customers") expect(screen.getByRole("link", { name: "客户管理" })).toHaveAttribute("href", "/admin/customers");
  expect(screen.queryByText("customers")).not.toBeInTheDocument();
});
