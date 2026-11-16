// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { DataState } from "@/components/admin/ui/DataState";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { TableShell } from "@/components/admin/ui/TableShell";

afterEach(cleanup);

describe("ZYRON admin UI primitives", () => {
  it("renders a labelled card region with an optional action", () => {
    render(
      <AdminCard title="询盘转化" description="过去 28 天" action={<button type="button">导出</button>}>
        <p>12.6%</p>
      </AdminCard>,
    );

    const heading = screen.getByRole("heading", { name: "询盘转化", level: 2 });
    expect(screen.getByRole("region", { name: "询盘转化" })).toHaveAttribute("aria-labelledby", heading.id);
    expect(screen.getByRole("group", { name: "卡片操作" })).toHaveClass("[&_button]:focus-visible:ring-2");
  });

  it("gives the page header a clear heading hierarchy and action area", () => {
    render(
      <AdminPageHeader
        eyebrow="经营概览"
        title="数据分析中心"
        description="统一查看网站流量与询盘表现"
        actions={<button type="button">刷新数据</button>}
      />,
    );

    expect(screen.getByRole("heading", { name: "数据分析中心", level: 1 })).toBeVisible();
    expect(screen.getByText("经营概览")).toBeVisible();
    expect(screen.getByRole("group", { name: "页面操作" })).toContainElement(
      screen.getByRole("button", { name: "刷新数据" }),
    );
  });

  it("renders actionable empty and error states with live semantics", () => {
    const retry = vi.fn();
    const { rerender } = render(
      <DataState kind="empty" title="暂无访客" description="调整筛选条件后重试" actionLabel="清除筛选" onAction={retry} />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("暂无访客");
    expect(screen.getByRole("button", { name: "清除筛选" })).toHaveClass("focus-visible:ring-2");

    rerender(
      <DataState kind="error" title="数据暂时不可用" description="请稍后重试" actionLabel="重新加载" onAction={retry} />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("数据暂时不可用");
  });

  it("exposes semantic status labels without relying on colour", () => {
    render(
      <div>
        <StatusBadge tone="success">在线</StatusBadge>
        <StatusBadge tone="warning">待跟进</StatusBadge>
      </div>,
    );

    expect(screen.getByText("在线")).toHaveAttribute("data-tone", "success");
    expect(screen.getByText("在线")).toHaveAttribute("aria-label", "状态：在线");
    expect(screen.getByText("待跟进")).toHaveAttribute("aria-label", "状态：待跟进");
  });

  it("provides an accessible table container and sticky column headers", () => {
    render(
      <TableShell caption="实时访客列表">
        <thead>
          <tr>
            <th scope="col">访客</th>
            <th scope="col">来源</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>访客 01</td>
            <td>Google</td>
          </tr>
        </tbody>
      </TableShell>,
    );

    expect(screen.getByRole("region", { name: "实时访客列表" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("table", { name: "实时访客列表" })).toHaveClass("admin-data-table");
    expect(screen.getByRole("table", { name: "实时访客列表" })).toHaveClass("[&_thead_th]:sticky");
  });
});
