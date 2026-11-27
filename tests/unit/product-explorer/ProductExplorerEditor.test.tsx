// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProductExplorerEditor } from "@/components/admin/pages/ProductExplorerEditor";
import { DEFAULT_PRODUCT_EXPLORER_CONTENT } from "@/lib/product-explorer/config";

describe("ProductExplorerEditor", () => {
  afterEach(cleanup);

  it("edits the fixed full-width background independently from all eight equipment images", () => {
    const onChange = vi.fn();
    render(
      <ProductExplorerEditor
        content={DEFAULT_PRODUCT_EXPLORER_CONTENT}
        categoryOptions={[]}
        onChange={onChange}
      />,
    );

    const backgroundInput = screen.getByLabelText("全幅背景图片地址");
    expect(backgroundInput).toHaveValue("/products/explorer/industrial-studio-background.webp");
    expect(screen.getByRole("button", { name: "从媒体资源库替换全幅背景图" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /从媒体资源库替换设备图/ })).toHaveLength(8);

    fireEvent.change(backgroundInput, { target: { value: "/api/media/new-background" } });

    expect(onChange).toHaveBeenLastCalledWith({
      ...DEFAULT_PRODUCT_EXPLORER_CONTENT,
      backgroundImage: "/api/media/new-background",
    });
  });
});
