// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/homepage",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

import { HomepageAdmin } from "@/components/admin/pages/HomepageAdmin";
import { getAdminNavigation } from "@/components/admin/AdminSidebar";
import { homepageRedesignDocument } from "@/lib/page-builder/default-homepage";
import type { Principal } from "@/lib/auth/permissions";

const contentEditor: Principal = {
  id: "content-editor",
  email: "content@example.com",
  name: "内容编辑",
  roles: ["CONTENT_EDITOR"],
};

const productEditor: Principal = {
  id: "product-editor",
  email: "product@example.com",
  name: "产品编辑",
  roles: ["PRODUCT_EDITOR"],
};

afterEach(cleanup);

describe("homepage administration", () => {
  it("shows the homepage manager only to page readers", () => {
    expect(getAdminNavigation(contentEditor).map((item) => item.label)).toContain("首页管理");
    expect(getAdminNavigation(productEditor).map((item) => item.label)).not.toContain("首页管理");
  });

  it("opens the existing home document in the shared builder with six Chinese module labels", () => {
    render(
      <HomepageAdmin
        page={{ id: "home", name: "ZYRON 首页", slug: "home", status: "DRAFT", version: 3, document: homepageRedesignDocument }}
        canWrite
        canPublish
      />,
    );

    const layers = screen.getByRole("list", { name: "页面结构" });
    expect(within(layers).getAllByTestId("page-layer").map((item) => item.textContent)).toEqual([
      expect.stringContaining("首页设备横幅"),
      expect.stringContaining("首页品牌与实力"),
      expect.stringContaining("首页八大产品"),
      expect.stringContaining("首页品牌优势"),
      expect.stringContaining("首页行业洞察"),
      expect.stringContaining("首页询价转化"),
    ]);
    expect(screen.getByRole("link", { name: "编辑 Footer" })).toHaveAttribute("href", "/admin/navigation");
  });

  it("offers an explicit redesign-template creation path without writing during page load", () => {
    render(<HomepageAdmin page={null} canWrite canPublish={false} />);

    expect(screen.getByRole("heading", { name: "尚未创建首页内容" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "创建首页并打开设计器" })).toHaveAttribute(
      "href",
      "/admin/pages/new?name=ZYRON%20%E9%A6%96%E9%A1%B5&slug=home&pageType=HOME&template=homepage-redesign",
    );
  });
});
