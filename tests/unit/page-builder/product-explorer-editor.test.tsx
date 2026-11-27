// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PageBuilder } from "@/components/admin/pages/PageBuilder";
import { DEFAULT_PRODUCT_EXPLORER_CONTENT } from "@/lib/product-explorer/config";

afterEach(cleanup);

const page = {
  id: "products-page",
  name: "Products",
  slug: "products",
  status: "DRAFT" as const,
  version: 4,
  document: {
    schemaVersion: 1 as const,
    renderMode: "REPLACE_LEGACY" as const,
    nodes: [{
      id: "products-explorer",
      type: "PRODUCT_EXPLORER" as const,
      placement: "REPLACE_LEGACY" as const,
      content: DEFAULT_PRODUCT_EXPLORER_CONTENT,
    }],
  },
};

const categoryOptions = [
  { id: "db-shear", name: "Shearing Machine Series", slug: "shearing-machines", status: "PUBLISHED" },
  { id: "db-bend", name: "Bending Machine Series", slug: "bending-machines", status: "PUBLISHED" },
];

describe("Product Explorer PageBuilder editor", () => {
  it("keeps fixed tab identity read-only and saves a real database category id", async () => {
    const user = userEvent.setup();
    const onPersist = vi.fn().mockResolvedValue({ version: 5 });
    render(<PageBuilder page={page} canPublish onPersist={onPersist} categoryOptions={categoryOptions} />);

    expect(screen.getAllByText("01 · Shearing").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("02 · Bending").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByRole("textbox", { name: "第 1 类序号" })).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "第 1 类导航名称" })).not.toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox", { name: "第 2 类真实产品分类" }), "db-bend");
    await user.click(screen.getByRole("button", { name: "保存草稿" }));

    await waitFor(() => expect(onPersist).toHaveBeenCalledTimes(1));
    expect(onPersist.mock.calls[0][0].document.nodes[0].content.categories[1]).toMatchObject({
      key: "bending",
      number: "02",
      navLabel: "Bending",
      categoryId: "db-bend",
    });
  });

  it("exposes the fixed background, per-category equipment replacement, and responsive machine controls", () => {
    render(<PageBuilder page={page} canPublish onPersist={vi.fn()} categoryOptions={categoryOptions} />);

    expect(screen.getByRole("button", { name: "从媒体资源库替换全幅背景图" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "第 1 类从媒体资源库替换设备图" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "第 8 类从媒体资源库替换设备图" })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "第 2 类桌面缩放" })).toHaveValue(0.96);
    expect(screen.getByRole("spinbutton", { name: "第 2 类手机水平位置" })).toHaveValue(0);
  });
});
