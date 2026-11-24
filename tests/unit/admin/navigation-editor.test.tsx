// @vitest-environment jsdom

import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

import { DEFAULT_NAVIGATION } from "@/lib/navigation/default-navigation";
import type { NavigationSnapshot } from "@/lib/navigation/schema";
import { productCategories, products } from "@/data/products";

import { NavigationEditor } from "@/components/admin/navigation/NavigationEditor";

const versions = [
  { id: "version-3", version: 3, action: "PUBLISH", createdAt: "2026-11-17T08:00:00.000Z", publishedAt: "2026-11-17T08:00:00.000Z", createdBy: { name: "内容编辑", email: "content@zyroncnc.com" } },
  { id: "version-2", version: 2, action: "SAVE", createdAt: "2026-11-17T07:00:00.000Z", publishedAt: null, createdBy: { name: "内容编辑", email: "content@zyroncnc.com" } },
];

function response(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }));
}

function renderEditor(document: NavigationSnapshot = structuredClone(DEFAULT_NAVIGATION)) {
  return render(<NavigationEditor initialDocument={document} version={3} status="PUBLISHED" versions={versions} categories={productCategories} products={products} />);
}

describe("NavigationEditor", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(cleanup);

  it("edits, hides, adds, deletes, and keyboard-reorders navigation items", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.clear(screen.getByRole("textbox", { name: "HOME 名称" }));
    await user.type(screen.getByRole("textbox", { name: "菜单 1 名称" }), "START");
    await user.click(screen.getByRole("checkbox", { name: "START 显示" }));
    await user.click(screen.getByRole("button", { name: "下移 START" }));
    expect(within(screen.getAllByTestId("primary-navigation-item")[1]).getByDisplayValue("START")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "新增一级链接" }));
    expect(screen.getAllByTestId("primary-navigation-item")).toHaveLength(7);
    await user.click(screen.getByRole("button", { name: "删除 新菜单" }));
    expect(screen.getAllByTestId("primary-navigation-item")).toHaveLength(6);

    await user.click(screen.getByRole("button", { name: "为 SUPPORT 新增子项" }));
    expect(screen.getByRole("textbox", { name: "SUPPORT 子菜单 4 名称" })).toBeInTheDocument();
  });

  it("configures Machines categories, display settings, and saves them in the navigation draft", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockImplementation((_input, init) => {
      const payload = JSON.parse(String(init?.body));
      expect(payload.document.machines.mode).toBe("MANUAL");
      expect(payload.document.machines.settings.desktopColumns).toBe(4);
      expect(payload.document.machines.categories[0].displayName).toBe("SHEET METAL SHEARS");
      return response({ version: 4, status: "DRAFT", draftContent: payload.document });
    });
    renderEditor();

    await user.click(screen.getByRole("button", { name: "Machines 菜单" }));
    await user.selectOptions(screen.getByRole("combobox", { name: "产品同步模式" }), "MANUAL");
    await user.selectOptions(screen.getByRole("combobox", { name: "桌面产品列数" }), "4");
    const name = screen.getByRole("textbox", { name: "系列 1 显示名称" });
    await user.clear(name);
    await user.type(name, "SHEET METAL SHEARS");
    await user.click(screen.getByRole("button", { name: "保存草稿" }));

    expect(await screen.findByRole("status")).toHaveTextContent("草稿已保存");
  });

  it("saves managed typography and spacing controls for the Machines menu", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockImplementation((_input, init) => {
      const payload = JSON.parse(String(init?.body));
      expect(payload.document.machines.settings).toMatchObject({
        categoryFontSize: 16,
        categoryTextColor: "#123456",
        categoryRowGap: 10,
        rightHeadingFontSize: 32,
        productTitleColor: "#345678",
      });
      return response({ version: 4, status: "DRAFT", draftContent: payload.document });
    });
    renderEditor();

    await user.click(screen.getByRole("button", { name: "Machines 菜单" }));
    await user.clear(screen.getByRole("spinbutton", { name: "左侧分类字号" }));
    await user.type(screen.getByRole("spinbutton", { name: "左侧分类字号" }), "16");
    await user.clear(screen.getByRole("textbox", { name: "左侧分类文字颜色" }));
    await user.type(screen.getByRole("textbox", { name: "左侧分类文字颜色" }), "#123456");
    await user.clear(screen.getByRole("spinbutton", { name: "分类行间距" }));
    await user.type(screen.getByRole("spinbutton", { name: "分类行间距" }), "10");
    await user.clear(screen.getByRole("spinbutton", { name: "右侧标题字号" }));
    await user.type(screen.getByRole("spinbutton", { name: "右侧标题字号" }), "32");
    await user.clear(screen.getByRole("textbox", { name: "产品标题颜色" }));
    await user.type(screen.getByRole("textbox", { name: "产品标题颜色" }), "#345678");
    await user.click(screen.getByRole("button", { name: "保存草稿" }));

    expect(await screen.findByRole("status")).toHaveTextContent("草稿已保存");
  });

  it("selects a permanent media-library image and explicitly removes a product card", async () => {
    const user = userEvent.setup();
    const categoryId = DEFAULT_NAVIGATION.machines!.categories[0].categoryId;
    const firstProduct = products.find((product) => product.categoryId === categoryId)!;
    vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      if (String(input).startsWith("/api/admin/media")) {
        return response({
          items: [{ id: "media-1", originalName: "replacement.png", mimeType: "image/png", altText: "Replacement machine", category: "machines", previewUrl: "/api/media/media-1" }],
          nextCursor: null,
        });
      }
      const payload = JSON.parse(String(init?.body));
      const savedProduct = payload.document.machines.categories[0].products.find((product: { productId: string }) => product.productId === firstProduct.id);
      expect(savedProduct).toMatchObject({ imageOverride: "/api/media/media-1", altOverride: "Replacement machine", enabled: true });
      return response({ version: 4, status: "DRAFT", draftContent: payload.document });
    });
    renderEditor();

    await user.click(screen.getByRole("button", { name: "Machines 菜单" }));
    await user.selectOptions(screen.getByRole("combobox", { name: "产品同步模式" }), "MANUAL");
    await user.click(screen.getAllByText(/产品选择与显示覆盖/)[0]);
    await user.click(screen.getByRole("checkbox", { name: new RegExp(firstProduct.name, "i") }));
    expect(screen.getByRole("button", { name: `移除产品 ${firstProduct.name}` })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "从媒体资源选择图片" }));
    await user.click(await screen.findByText("replacement.png"));
    expect(screen.getAllByAltText("Replacement machine").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "保存草稿" }));
    expect(await screen.findByRole("status")).toHaveTextContent("草稿已保存");
    await user.click(screen.getByRole("button", { name: `移除产品 ${firstProduct.name}` }));
    expect(screen.queryByRole("button", { name: `移除产品 ${firstProduct.name}` })).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: new RegExp(firstProduct.name, "i") })).not.toBeChecked();
  });

  it("saves a draft and publishes the returned version", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockImplementationOnce((_input, init) => {
        expect(init?.method).toBe("PATCH");
        const payload = JSON.parse(String(init?.body));
        expect(payload.version).toBe(3);
        expect(payload.document.primary[0].label).toBe("HOME");
        return response({ version: 4, status: "DRAFT", draftContent: payload.document });
      })
      .mockImplementationOnce((_input, init) => {
        expect(init?.method).toBe("POST");
        expect(JSON.parse(String(init?.body))).toEqual({ version: 4 });
        return response({ version: 5, status: "PUBLISHED", draftContent: DEFAULT_NAVIGATION, publishedVersion: 5 });
      });

    renderEditor();
    await user.click(screen.getByRole("button", { name: "保存草稿" }));
    expect(await screen.findByRole("status")).toHaveTextContent("草稿已保存");
    await user.click(screen.getByRole("button", { name: "发布到前台" }));
    expect(await screen.findByRole("status")).toHaveTextContent("导航已发布");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("edits the quote button, language entry, and footer navigation in the same snapshot", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockImplementation((_input, init) => {
      const payload = JSON.parse(String(init?.body));
      expect(payload.document.quote.label).toBe("获取报价");
      expect(payload.document.languages[0].label).toBe("English Global");
      expect(payload.document.footerGroups[0].label).toBe("客户支持");
      expect(payload.document.footerGroups[0].items[0].label).toBe("联系工程师");
      expect(payload.document.footer.brandName).toBe("ZYRON International");
      return response({ version: 4, status: "DRAFT", draftContent: payload.document });
    });
    renderEditor();

    await user.clear(screen.getByRole("textbox", { name: "报价按钮名称" }));
    await user.type(screen.getByRole("textbox", { name: "报价按钮名称" }), "获取报价");
    await user.clear(screen.getByRole("textbox", { name: "语言 1 名称" }));
    await user.type(screen.getByRole("textbox", { name: "语言 1 名称" }), "English Global");
    await user.clear(screen.getByRole("textbox", { name: "页脚组 1 名称" }));
    await user.type(screen.getByRole("textbox", { name: "页脚组 1 名称" }), "客户支持");
    await user.clear(screen.getByRole("textbox", { name: "页脚组 1 链接 1 名称" }));
    await user.type(screen.getByRole("textbox", { name: "页脚组 1 链接 1 名称" }), "联系工程师");
    await user.clear(screen.getByRole("textbox", { name: "页脚品牌名称" }));
    await user.type(screen.getByRole("textbox", { name: "页脚品牌名称" }), "ZYRON International");
    await user.click(screen.getByRole("button", { name: "保存草稿" }));

    expect(await screen.findByRole("status")).toHaveTextContent("草稿已保存");
  });

  it("edits the complete managed footer in the published navigation snapshot", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockImplementation((_input, init) => {
      const payload = JSON.parse(String(init?.body));
      expect(payload.document.footer.productCategories).toEqual({ visible: false, label: "设备分类" });
      expect(payload.document.footer.actionLinks.label).toBe("合作入口");
      expect(payload.document.footer.newsletter).toMatchObject({ visible: true, title: "机械资讯", ctaHref: "/news" });
      expect(payload.document.footer.legalLinks[0].label).toBe("隐私条款");
      return response({ version: 4, status: "DRAFT", draftContent: payload.document });
    });
    renderEditor();

    await user.click(screen.getByRole("checkbox", { name: "显示产品分类" }));
    await user.clear(screen.getByRole("textbox", { name: "产品分类标题" }));
    await user.type(screen.getByRole("textbox", { name: "产品分类标题" }), "设备分类");
    await user.clear(screen.getByRole("textbox", { name: "合作入口标题" }));
    await user.type(screen.getByRole("textbox", { name: "合作入口标题" }), "合作入口");
    await user.clear(screen.getByRole("textbox", { name: "资讯标题" }));
    await user.type(screen.getByRole("textbox", { name: "资讯标题" }), "机械资讯");
    await user.clear(screen.getByRole("textbox", { name: "法律链接 1 名称" }));
    await user.type(screen.getByRole("textbox", { name: "法律链接 1 名称" }), "隐私条款");
    await user.click(screen.getByRole("button", { name: "保存草稿" }));

    expect(await screen.findByRole("status")).toHaveTextContent("草稿已保存");
  });

  it("shows a stale-version conflict without replacing local edits", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockImplementation(() => response({ code: "NAVIGATION_CONFLICT", message: "Navigation changed." }, 409));
    renderEditor();

    await user.clear(screen.getByRole("textbox", { name: "HOME 名称" }));
    await user.type(screen.getByRole("textbox", { name: "菜单 1 名称" }), "LOCAL HOME");
    await user.click(screen.getByRole("button", { name: "保存草稿" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("版本冲突");
    expect(screen.getByDisplayValue("LOCAL HOME")).toBeInTheDocument();
  });

  it("rolls an old version into a new draft without claiming it is published", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockImplementation((_input, init) => {
      expect(JSON.parse(String(init?.body))).toEqual({ version: 3, targetVersion: 2 });
      return response({ version: 4, status: "DRAFT", draftContent: { ...DEFAULT_NAVIGATION, primary: [{ ...DEFAULT_NAVIGATION.primary[0], label: "历史首页" }] } });
    });
    renderEditor();

    await user.click(screen.getByRole("button", { name: "回滚到版本 2" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("历史版本已恢复为新草稿"));
    expect(screen.getByDisplayValue("历史首页")).toBeInTheDocument();
    expect(screen.getAllByText("草稿").length).toBeGreaterThan(0);
  });
});
