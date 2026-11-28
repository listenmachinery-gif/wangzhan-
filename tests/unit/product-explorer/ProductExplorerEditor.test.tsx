// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProductExplorerEditor, type ProductExplorerProductOption } from "@/components/admin/pages/ProductExplorerEditor";
import { DEFAULT_PRODUCT_EXPLORER_CONTENT, type ProductExplorerContent } from "@/lib/product-explorer/config";

const productOptions: ProductExplorerProductOption[] = [
  {
    id: "product-1",
    categoryId: "db-bend",
    name: "Servo Press Brake",
    slug: "servo-press-brake",
    summary: "Precision bending from the product record",
    image: "/products/catalog/servo-press-brake.webp",
    imageAlt: "Servo Press Brake",
  },
  {
    id: "product-2",
    categoryId: "db-bend",
    name: "Torsion Bar Press Brake",
    slug: "torsion-bar-press-brake",
    summary: "Reliable conventional bending",
    image: "/products/catalog/torsion-bar-press-brake.webp",
    imageAlt: "Torsion Bar Press Brake",
  },
  {
    id: "product-3",
    categoryId: "db-bend",
    name: "Panel Bender",
    slug: "panel-bender",
    summary: "Automated panel forming",
    image: "/products/catalog/panel-bender.webp",
    imageAlt: "Panel Bender",
  },
];

const editableContent: ProductExplorerContent = {
  ...DEFAULT_PRODUCT_EXPLORER_CONTENT,
  categories: DEFAULT_PRODUCT_EXPLORER_CONTENT.categories.map((category) => ({
    ...category,
    categoryId: category.key === "bending" ? "db-bend" : "",
  })),
};

function EditorHarness({ initialContent = editableContent }: { initialContent?: ProductExplorerContent }) {
  const [content, setContent] = useState(initialContent);
  return (
    <ProductExplorerEditor
      content={content}
      categoryOptions={[]}
      productOptions={productOptions}
      onChange={setContent}
    />
  );
}

function renderedProductIds() {
  return screen.getAllByTestId("product-card-editor").map((element) => element.getAttribute("data-product-id"));
}

describe("ProductExplorerEditor", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("edits the fixed full-width background independently from all eight equipment images", () => {
    const onChange = vi.fn();
    render(
      <ProductExplorerEditor
        content={DEFAULT_PRODUCT_EXPLORER_CONTENT}
        categoryOptions={[]}
        productOptions={[]}
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

  it("creates and restores an independent product card text override", async () => {
    const user = userEvent.setup();
    render(<EditorHarness />);

    const title = screen.getByRole("textbox", { name: "产品「Servo Press Brake」卡片标题" });
    expect(title).toHaveValue("Servo Press Brake");
    expect(screen.getByRole("textbox", { name: "产品「Servo Press Brake」卡片摘要" })).toHaveValue(
      "Precision bending from the product record",
    );

    await user.clear(title);
    await user.type(title, "Custom{enter}Press Brake");
    const summary = screen.getByRole("textbox", { name: "产品「Servo Press Brake」卡片摘要" });
    await user.clear(summary);
    await user.type(summary, "Custom card summary");

    expect(title).toHaveValue("Custom\nPress Brake");
    expect(summary).toHaveValue("Custom card summary");
    await user.click(screen.getByRole("button", { name: "恢复 Servo Press Brake 产品资料" }));
    expect(title).toHaveValue("Servo Press Brake");
  });

  it("selects a media-library card image and keeps Alt text editable", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [{
          id: "media-card-1",
          originalName: "custom-machine.png",
          mimeType: "image/png",
          altText: "Custom machine from media library",
          category: "Products",
          previewUrl: "/api/admin/media/media-card-1/preview",
        }],
      }),
    } as Response);
    render(<EditorHarness />);

    await user.click(screen.getByRole("button", { name: "产品「Servo Press Brake」从媒体资源库替换卡片图片" }));
    await user.click(await screen.findByRole("button", { name: /custom-machine\.png/i }));

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: "产品「Servo Press Brake」卡片图片地址" })).toHaveValue("/api/media/media-card-1");
      expect(screen.getByRole("textbox", { name: "产品「Servo Press Brake」图片替代文字" })).toHaveValue("Custom machine from media library");
    });

    const alt = screen.getByRole("textbox", { name: "产品「Servo Press Brake」图片替代文字" });
    await user.clear(alt);
    await user.type(alt, "Manually revised Alt text");
    expect(alt).toHaveValue("Manually revised Alt text");
  });

  it("moves product cards up and down and restores the database order", async () => {
    const user = userEvent.setup();
    render(<EditorHarness />);

    expect(renderedProductIds()).toEqual(["product-1", "product-2", "product-3"]);

    await user.click(screen.getByRole("button", { name: "下移 Servo Press Brake" }));
    expect(renderedProductIds()).toEqual(["product-2", "product-1", "product-3"]);

    await user.click(screen.getByRole("button", { name: "上移 Panel Bender" }));
    expect(renderedProductIds()).toEqual(["product-2", "product-3", "product-1"]);

    await user.click(screen.getByRole("button", { name: "第 2 类恢复产品默认顺序" }));
    expect(renderedProductIds()).toEqual(["product-1", "product-2", "product-3"]);
  });

  it("removes and re-adds a product without deleting its card override", async () => {
    const user = userEvent.setup();
    render(<EditorHarness initialContent={{
      ...editableContent,
      productCardOverrides: [{
        productId: "product-1",
        title: "Custom Servo Card",
        summary: "Custom summary",
        image: "/products/custom-servo.webp",
        imageAlt: "Custom Servo Press Brake",
      }],
    }} />);

    await user.click(screen.getByRole("button", { name: "从总页移除 Servo Press Brake" }));
    expect(renderedProductIds()).toEqual(["product-2", "product-3"]);

    await user.click(screen.getByRole("button", { name: "重新添加 Servo Press Brake" }));
    expect(renderedProductIds()).toEqual(["product-2", "product-3", "product-1"]);
    expect(screen.getByRole("textbox", { name: "产品「Servo Press Brake」卡片标题" })).toHaveValue("Custom Servo Card");
  });
});
