// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PageBuilder } from "@/components/admin/pages/PageBuilder";
import { defaultHomepageDocument } from "@/lib/page-builder/default-homepage";

const page = {
  id: "home-page",
  name: "Home",
  slug: "home",
  status: "DRAFT" as const,
  version: 1,
  document: defaultHomepageDocument,
};

afterEach(cleanup);

describe("PageBuilder", () => {
  it("adds, selects, duplicates, and deletes real registered components", async () => {
    const user = userEvent.setup();
    render(<PageBuilder page={page} canPublish onPersist={vi.fn()} />);

    expect(
      screen.getByRole("region", { name: "组件库与页面结构" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "页面画布" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "组件属性" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "添加 标题" }));
    expect(screen.getAllByTestId("page-layer")).toHaveLength(3);
    expect(screen.getByLabelText("标题文字")).toHaveValue(
      "Build better production lines.",
    );

    await user.click(screen.getByRole("button", { name: "复制当前组件" }));
    expect(screen.getAllByTestId("page-layer")).toHaveLength(4);
    await user.click(screen.getByRole("button", { name: "删除当前组件" }));
    expect(screen.getAllByTestId("page-layer")).toHaveLength(3);
  });

  it("reorders layers with keyboard controls", async () => {
    const user = userEvent.setup();
    render(<PageBuilder page={page} canPublish onPersist={vi.fn()} />);

    const layers = screen.getByRole("list", { name: "页面结构" });
    expect(
      within(layers)
        .getAllByTestId("page-layer")
        .map((item) => item.textContent),
    ).toEqual([
      expect.stringContaining("工厂介绍"),
      expect.stringContaining("技术优势"),
    ]);

    await user.click(screen.getByRole("button", { name: "选择 工厂介绍" }));
    await user.click(screen.getByRole("button", { name: "下移 工厂介绍" }));
    expect(
      within(layers)
        .getAllByTestId("page-layer")
        .map((item) => item.textContent),
    ).toEqual([
      expect.stringContaining("技术优势"),
      expect.stringContaining("工厂介绍"),
    ]);
  });

  it("supports undo, redo, and real device preview modes", async () => {
    const user = userEvent.setup();
    render(<PageBuilder page={page} canPublish onPersist={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "添加 段落" }));
    expect(screen.getAllByTestId("page-layer")).toHaveLength(3);
    await user.click(screen.getByRole("button", { name: "撤销" }));
    expect(screen.getAllByTestId("page-layer")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "重做" }));
    expect(screen.getAllByTestId("page-layer")).toHaveLength(3);

    await user.click(screen.getByRole("button", { name: "平板预览" }));
    expect(screen.getByTestId("page-canvas")).toHaveAttribute(
      "data-device",
      "tablet",
    );
    await user.click(screen.getByRole("button", { name: "手机预览" }));
    const canvas = screen.getByTestId("page-canvas");
    expect(canvas).toHaveAttribute("data-device", "mobile");
    expect(canvas.querySelector("style")?.textContent).toContain(
      '[data-device="mobile"] [data-page-component] .grid',
    );
  });

  it("serializes and coalesces concurrent saves for the same edit revision", async () => {
    let finishSave: (value: { version: number }) => void = () => undefined;
    const onPersist = vi.fn(
      () =>
        new Promise<{ version: number }>((resolve) => {
          finishSave = resolve;
        }),
    );
    render(<PageBuilder page={page} canPublish onPersist={onPersist} />);

    fireEvent.change(screen.getByRole("textbox", { name: /^标题$/ }), {
      target: { value: "Serialized heading" },
    });
    const save = screen.getByRole("button", { name: "保存草稿" });
    fireEvent.click(save);
    fireEvent.click(save);

    await waitFor(() => expect(onPersist).toHaveBeenCalledTimes(1));
    finishSave({ version: 2 });
    await waitFor(() => expect(screen.getByText(/草稿已保存/)).toBeVisible());
    expect(onPersist).toHaveBeenCalledTimes(1);
  });

  it("does not advertise layout containers before nested editing is supported", () => {
    render(<PageBuilder page={page} canPublish onPersist={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "添加 Section 容器" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "添加 横向布局" })).not.toBeInTheDocument();
    expect(screen.queryByText("布局")).not.toBeInTheDocument();
  });

  it("invalidates queued saves before rolling back", async () => {
    let finishSave: (value: { version: number }) => void = () => undefined;
    const onPersist = vi.fn(() => new Promise<{ version: number }>((resolve) => { finishSave = resolve; }));
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.endsWith("/versions")) return new Response(JSON.stringify([{ version: 1, action: "CREATE", createdAt: new Date().toISOString(), createdBy: { name: "Admin" } }]));
      if (url.endsWith("/rollback") && init?.method === "POST") {
        const body = JSON.parse(String(init.body));
        expect(body.version).toBe(2);
        return new Response(JSON.stringify({ version: 3, draftContent: defaultHomepageDocument }));
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    const user = userEvent.setup();
    render(<PageBuilder page={page} canPublish onPersist={onPersist} />);

    fireEvent.change(screen.getByRole("textbox", { name: /^标题$/ }), { target: { value: "First queued document" } });
    fireEvent.click(screen.getByRole("button", { name: "保存草稿" }));
    await waitFor(() => expect(onPersist).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByRole("textbox", { name: /^标题$/ }), { target: { value: "Must not overwrite rollback" } });
    fireEvent.click(screen.getByRole("button", { name: "保存草稿" }));
    await user.click(screen.getByRole("button", { name: "历史" }));
    fireEvent.click(await screen.findByRole("button", { name: "恢复为草稿" }));
    finishSave({ version: 2 });

    await waitFor(() => expect(screen.getByText(/已恢复 v1 为新草稿/)).toBeVisible());
    expect(onPersist).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/rollback"), expect.anything());
    fetchMock.mockRestore();
  });
});
