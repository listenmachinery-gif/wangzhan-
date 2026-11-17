// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ShippingHighlightEditor } from "@/components/admin/shipping/ShippingHighlightEditor";
import type { ShippingHighlightDocument } from "@/lib/shipping/schema";

const replace = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh }) }));

const categories = [{ id: "cat-1", slug: "shearing-machines", name: "剪板机" }, { id: "cat-2", slug: "press-brakes", name: "折弯机" }];
const products = [{ id: "product-1", slug: "electric-shear", name: "电动剪板机", categoryId: "cat-1" }, { id: "product-2", slug: "cnc-press-brake", name: "数控折弯机", categoryId: "cat-2" }];
const media = [{ id: "cover-1", originalName: "cover.jpg", mimeType: "image/jpeg", altText: "发货封面" }, { id: "video-1", originalName: "loading.mp4", mimeType: "video/mp4", altText: "装柜视频" }];
const document: ShippingHighlightDocument = {
  title: "德国电动剪板机发货", summary: "完成检验、包装和装柜。", shipmentDate: "2026-11-16", countryCode: "DE", city: "Hamburg",
  categoryId: "cat-1", categorySlug: "shearing-machines", productId: "product-1", productSlug: "electric-shear",
  equipmentName: "电动剪板机", modelName: "Q11", quantity: 3, containerMethod: "20GP", transportMode: "海运", packagingMethod: "出口木箱",
  body: [{ type: "PARAGRAPH", text: "设备完成出厂检验。" }], coverMediaId: "cover-1",
  media: [{ id: "media-cover", mediaAssetId: "cover-1", role: "COVER", position: 0, altText: "电动剪板机发货封面" }, { id: "media-video", mediaAssetId: "video-1", role: "VIDEO", position: 1, altText: "电动剪板机装柜视频" }],
  seoTitle: "德国电动剪板机发货案例 | ZYRON", seoDescription: "查看 ZYRON 电动剪板机完成检验、出口包装和集装箱装柜后发往德国客户现场的真实发货记录与设备信息。",
};
const versions = [{ id: "v1", version: 1, action: "CREATE", createdAt: "2026-11-17T00:00:00.000Z", publishedAt: null, createdBy: { name: "编辑", email: "editor@test" } }];

function response(body: unknown, status = 200) { return Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })); }
function renderEditor(initialDocument = structuredClone(document)) {
  return render(<ShippingHighlightEditor initialRecord={{ id: "shipping-1", slug: "germany-shipment", status: "DRAFT", version: 1, publishedVersion: null, draftContent: initialDocument }} categories={categories} products={products} media={media} versions={versions} />);
}

describe("ShippingHighlightEditor", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(cleanup);

  it("keeps the product selection constrained to the chosen category", async () => {
    const user = userEvent.setup(); renderEditor();
    expect(screen.getByRole("combobox", { name: "关联产品" })).toHaveTextContent("电动剪板机");
    expect(screen.getByRole("combobox", { name: "关联产品" })).not.toHaveTextContent("数控折弯机");
    await user.selectOptions(screen.getByRole("combobox", { name: "产品分类" }), "cat-2");
    expect(screen.getByRole("combobox", { name: "关联产品" })).toHaveTextContent("数控折弯机");
    expect(screen.getByRole("combobox", { name: "关联产品" })).not.toHaveTextContent("电动剪板机");
  });

  it("edits media alt text and keyboard-reorders the gallery", async () => {
    const user = userEvent.setup(); renderEditor();
    await user.clear(screen.getByRole("textbox", { name: "媒体 1 替代文本" }));
    await user.type(screen.getByRole("textbox", { name: "媒体 1 替代文本" }), "新的发货封面描述");
    await user.click(screen.getByRole("button", { name: "下移媒体 1" }));
    const rows = screen.getAllByTestId("shipping-media-row");
    expect(within(rows[1]).getByDisplayValue("新的发货封面描述")).toBeInTheDocument();
  });

  it("saves structured text and shows a version conflict without discarding edits", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockImplementationOnce((_url, init) => {
      const payload = JSON.parse(String(init?.body)); expect(payload.document.body[0]).toEqual({ type: "PARAGRAPH", text: "设备完成出厂检验。" });
      return response({ code: "VERSION_CONFLICT", message: "stale" }, 409);
    });
    renderEditor();
    await user.type(screen.getByRole("textbox", { name: "标题" }), "（草稿）");
    await user.click(screen.getByRole("button", { name: "保存草稿" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("版本冲突");
    expect(screen.getByRole<HTMLInputElement>("textbox", { name: "标题" }).value).toContain("草稿");
  });

  it("blocks publication when cover, media alt, or SEO requirements are incomplete", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch");
    renderEditor({ ...document, coverMediaId: "", media: [{ ...document.media[0], altText: "" }] });
    await user.click(screen.getByRole("button", { name: "发布到前台" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/封面|替代文本/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rolls a historical snapshot into a draft and states that online content is unchanged", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockImplementation(() => response({ version: 2, status: "DRAFT", draftContent: { ...document, title: "历史发货内容" } }));
    renderEditor();
    await user.click(screen.getByRole("button", { name: "回滚到版本 1" }));
    expect(await screen.findByRole("status")).toHaveTextContent("线上内容未改变");
    expect(screen.getByDisplayValue("历史发货内容")).toBeInTheDocument();
  });

  it("requires a second explicit action before archiving", async () => {
    const user = userEvent.setup(); const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(() => response({ version: 2, status: "ARCHIVED", draftContent: document }));
    renderEditor();
    await user.click(screen.getByRole("button", { name: "归档" }));
    expect(fetchMock).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "确认归档" }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
