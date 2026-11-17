// @vitest-environment jsdom

import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

import { DEFAULT_NAVIGATION } from "@/lib/navigation/default-navigation";
import type { NavigationSnapshot } from "@/lib/navigation/schema";

import { NavigationEditor } from "@/components/admin/navigation/NavigationEditor";

const versions = [
  { id: "version-3", version: 3, action: "PUBLISH", createdAt: "2026-11-17T08:00:00.000Z", publishedAt: "2026-11-17T08:00:00.000Z", createdBy: { name: "内容编辑", email: "content@zyroncnc.com" } },
  { id: "version-2", version: 2, action: "SAVE", createdAt: "2026-11-17T07:00:00.000Z", publishedAt: null, createdBy: { name: "内容编辑", email: "content@zyroncnc.com" } },
];

function response(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }));
}

function renderEditor(document: NavigationSnapshot = structuredClone(DEFAULT_NAVIGATION)) {
  return render(<NavigationEditor initialDocument={document} version={3} status="PUBLISHED" versions={versions} />);
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
    expect(screen.getAllByTestId("primary-navigation-item")).toHaveLength(6);
    await user.click(screen.getByRole("button", { name: "删除 新菜单" }));
    expect(screen.getAllByTestId("primary-navigation-item")).toHaveLength(5);

    await user.click(screen.getByRole("button", { name: "为 SUPPORT 新增子项" }));
    expect(screen.getByRole("textbox", { name: "SUPPORT 子菜单 3 名称" })).toBeInTheDocument();
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
