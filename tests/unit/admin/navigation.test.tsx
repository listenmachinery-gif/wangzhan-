// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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

  it("labels unavailable external analytics without fabricated values", () => {
    render(<ConnectionStatus service="Google Analytics 4" connected={false} />);

    expect(screen.getByText("尚未连接")).toBeInTheDocument();
    expect(screen.queryByText(/访客|浏览量/)).not.toBeInTheDocument();
  });
});
