// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProductSelectionEditor } from "@/components/admin/pages/ProductSelectionEditor";
import { DEFAULT_PRODUCT_SELECTION_CONTENT } from "@/lib/product-selection/config";

describe("ProductSelectionEditor", () => {
  afterEach(cleanup);

  it("edits public copy and exposes dynamic filter, media, product order and restore controls", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ProductSelectionEditor content={DEFAULT_PRODUCT_SELECTION_CONTENT} productOptions={[{ id: "p1", categoryId: "c1", name: "CNC Press Brake", slug: "cnc-press-brake", summary: "Bending", image: "/brake.webp", imageAlt: "Brake" }]} onChange={onChange} />);

    expect(screen.getByText("动态筛选项")).toBeInTheDocument();
    expect(screen.getByText("产品卡片与排序")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "从媒体资源库选择模块背景" })).toBeInTheDocument();
    await user.clear(screen.getByDisplayValue("Explore All Machines"));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ title: "" }));
    expect(screen.getByRole("button", { name: /恢复专业选型中心默认设置/ })).toBeInTheDocument();
  });
});
