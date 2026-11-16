// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin" }));

import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar, getAdminNavigation } from "@/components/admin/AdminSidebar";
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

  it("shows the page center only to principals with page permission", () => {
    expect(getAdminNavigation(contentEditor).map((item) => item.label)).toContain("页面设计");
    expect(getAdminNavigation(productEditor).map((item) => item.label)).not.toContain("页面设计");
  });

  it("shows analytics only to principals with settings permission", () => {
    expect(getAdminNavigation(admin).map((item) => item.label)).toContain("数据分析");
    expect(getAdminNavigation(productEditor).map((item) => item.label)).not.toContain("数据分析");
    expect(getAdminNavigation(contentEditor).map((item) => item.label)).not.toContain("数据分析");
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
    await user.click(screen.getByRole("button", { name: "关闭导航" }));
    expect(screen.queryByRole("dialog", { name: "后台导航" })).not.toBeInTheDocument();
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
