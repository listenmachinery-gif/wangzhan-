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
import { defaultHomepageDocument, homepageRedesignDocument } from "@/lib/page-builder/default-homepage";
import { aboutZyronDocument } from "@/lib/page-builder/about-zyron-content";

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
  const showcasePage = {
    ...page,
    id: "showcase-page",
    name: "Showcase",
    slug: "showcase",
    document: {
      schemaVersion: 1 as const,
      nodes: [{
        id: "showcase-media",
        type: "MEDIA_SHOWCASE" as const,
        content: {
          eyebrow: "Showcase",
          heading: "Machinery in Action",
          description: "Real machinery media.",
          items: [
            { title: "First", description: "First item", src: "/first.jpg", mediaKind: "image", alt: "First" },
            { title: "Second", description: "Second item", src: "/second.jpg", mediaKind: "image", alt: "Second" },
          ],
        },
      }],
    },
  };

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

  it("edits per-element typography independently for tablet and mobile", async () => {
    const onPersist = vi.fn().mockResolvedValue({ version: 2 });
    const user = userEvent.setup();
    render(<PageBuilder page={page} canPublish onPersist={onPersist} />);

    await user.selectOptions(screen.getByRole("combobox", { name: "文字元素" }), "heading");
    await user.click(screen.getByRole("button", { name: "平板预览" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "单独文字字号" }), { target: { value: "36" } });
    await user.selectOptions(screen.getByRole("combobox", { name: "单独文字字体" }), "serif");
    await user.selectOptions(screen.getByRole("combobox", { name: "单独文字对齐" }), "right");
    await user.click(screen.getByRole("button", { name: "手机预览" }));
    expect(screen.getByRole("spinbutton", { name: "单独文字字号" })).toHaveValue(null);
    fireEvent.change(screen.getByRole("spinbutton", { name: "单独文字字号" }), { target: { value: "24" } });
    await user.click(screen.getByRole("button", { name: "保存草稿" }));

    await waitFor(() => expect(onPersist).toHaveBeenCalledTimes(1));
    expect(onPersist.mock.calls[0][0].document.nodes[0]).toMatchObject({
      responsiveTextStyles: {
        tablet: { heading: { fontSize: 36, fontFamily: "serif", textAlign: "right" } },
        mobile: { heading: { fontSize: 24 } },
      },
    });
    expect(onPersist.mock.calls[0][0].document.nodes[0].textStyles?.heading).toBeUndefined();
  });

  it("uses multiline editors for text fields and structured text values", async () => {
    const user = userEvent.setup();
    const aboutPage = { ...page, id: "about-page", slug: "about-zyron", document: aboutZyronDocument };
    render(<PageBuilder page={aboutPage} canPublish onPersist={vi.fn()} />);

    const eyebrow = screen.getByRole("textbox", { name: "品牌标签" });
    expect(eyebrow.tagName).toBe("TEXTAREA");
    await user.clear(eyebrow);
    await user.type(eyebrow, "ABOUT{enter}ZYRON");
    expect(eyebrow).toHaveValue("ABOUT\nZYRON");

    const valueTitle = screen.getByRole("textbox", { name: "第 1 项 标题" });
    expect(valueTitle.tagName).toBe("TEXTAREA");
    expect(valueTitle).toHaveValue("Reliable\nMachines");
  });

  it("replaces the global support map through the media library and syncs alt text", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      items: [{ id: "map-asset", originalName: "global-map.jpg", mimeType: "image/jpeg", altText: "ZYRON global delivery network", category: "Company", previewUrl: "https://preview.example/global-map.jpg" }],
      nextCursor: null,
    })));
    const onPersist = vi.fn().mockResolvedValue({ version: 2 });
    const user = userEvent.setup();
    const globalNode = aboutZyronDocument.nodes[6];
    const legacyContent: Record<string, unknown> = {
      ...(globalNode.content as Record<string, unknown>),
      mapAriaLabel: "Legacy global support map",
    };
    delete legacyContent.mapImage;
    delete legacyContent.mapImageAlt;
    delete legacyContent.mapImageFocus;
    const globalOnly = {
      ...page,
      id: "about-global-page",
      slug: "about-global",
      document: { ...aboutZyronDocument, nodes: [{ ...globalNode, content: legacyContent as typeof globalNode.content }] },
    };
    render(<PageBuilder page={globalOnly} canPublish onPersist={onPersist} />);

    await user.click(screen.getByRole("button", { name: "从媒体资源库替换" }));
    await user.click(await screen.findByRole("button", { name: /global-map\.jpg/ }));
    await user.click(screen.getByRole("button", { name: "保存草稿" }));
    await waitFor(() => expect(onPersist).toHaveBeenCalledTimes(1));

    expect(onPersist.mock.calls[0][0].document.nodes[0].content).toMatchObject({
      mapImage: "/api/media/map-asset",
      mapImageAlt: "ZYRON global delivery network",
    });
    fetchMock.mockRestore();
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

  it("edits media repeaters with add, remove, reorder, and independent library replacement", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      items: [{ id: "media-new", originalName: "replacement.jpg", mimeType: "image/jpeg", altText: "Replacement", category: "Products", previewUrl: "https://preview.example/replacement.jpg" }],
      nextCursor: null,
    })));
    const onPersist = vi.fn().mockResolvedValue({ version: 2 });
    const user = userEvent.setup();
    render(<PageBuilder page={showcasePage} canPublish onPersist={onPersist} />);

    expect(screen.getAllByTestId("media-repeater-item")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "下移第 1 项" }));
    expect(screen.getByRole("textbox", { name: "第 1 项 标题" })).toHaveValue("Second");

    await user.click(screen.getByRole("button", { name: "添加媒体项目" }));
    expect(screen.getAllByTestId("media-repeater-item")).toHaveLength(3);
    await user.click(screen.getByRole("button", { name: "移除第 3 项" }));
    expect(screen.getAllByTestId("media-repeater-item")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "替换第 1 项图片" }));
    await user.click(await screen.findByRole("button", { name: /replacement\.jpg/ }));
    await user.click(screen.getByRole("button", { name: "保存草稿" }));

    await waitFor(() => expect(onPersist).toHaveBeenCalledTimes(1));
    const saved = onPersist.mock.calls[0][0].document.nodes[0].content.items;
    expect(saved[0]).toMatchObject({ title: "Second", src: "/api/media/media-new", alt: "Replacement" });
    expect(fetchMock.mock.calls[0][0]).toContain("kind=image");
    fetchMock.mockRestore();
  });

  it("edits ordinary card and FAQ repeaters without requiring raw JSON", async () => {
    const faqPage = {
      ...page,
      document: {
        schemaVersion: 1 as const,
        nodes: [{
          id: "faq",
          type: "FAQ" as const,
          content: { heading: "FAQ", items: [{ title: "Question", body: "Answer" }] },
        }],
      },
    };
    const user = userEvent.setup();
    render(<PageBuilder page={faqPage} canPublish onPersist={vi.fn()} />);

    expect(screen.getByRole("textbox", { name: "第 1 项 标题" })).toHaveValue("Question");
    expect(screen.getByRole("textbox", { name: "第 1 项 正文" })).toHaveValue("Answer");
    expect(screen.queryByRole("textbox", { name: "问答" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "添加项目" }));
    expect(screen.getAllByTestId("structured-repeater-item")).toHaveLength(2);
  });

  it("edits homepage insight publication status with a structured selector", async () => {
    const user = userEvent.setup();
    render(<PageBuilder page={{ ...page, document: homepageRedesignDocument }} canPublish onPersist={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "选择 首页行业洞察" }));
    const statuses = screen.getAllByRole("combobox", { name: /第 \d+ 项 发布状态/ });
    expect(statuses).toHaveLength(3);
    expect(statuses[0]).toHaveValue("draft");
    await user.selectOptions(statuses[0], "published");
    expect(statuses[0]).toHaveValue("published");
  });

  it("supports global hide/restore, background media, width, gap, and image fit controls", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      items: [{ id: "background-1", originalName: "factory-bg.jpg", mimeType: "image/jpeg", altText: "Factory", category: "Factory", previewUrl: "https://preview.example/factory.jpg" }],
    })));
    const onPersist = vi.fn().mockResolvedValue({ version: 2 });
    const user = userEvent.setup();
    render(<PageBuilder page={page} canPublish onPersist={onPersist} />);

    await user.click(screen.getByRole("button", { name: "隐藏当前组件" }));
    expect(screen.getByRole("button", { name: "恢复当前组件" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "恢复当前组件" }));
    await user.selectOptions(screen.getByRole("combobox", { name: "区块宽度" }), "full");
    fireEvent.change(screen.getByRole("spinbutton", { name: "元素间距" }), { target: { value: "32" } });
    await user.selectOptions(screen.getByRole("combobox", { name: "图片适配" }), "contain");
    await user.click(screen.getByRole("button", { name: "从媒体库选择背景图片" }));
    await user.click(await screen.findByRole("button", { name: /factory-bg\.jpg/ }));
    await user.click(screen.getByRole("button", { name: "保存草稿" }));

    await waitFor(() => expect(onPersist).toHaveBeenCalledTimes(1));
    expect(onPersist.mock.calls[0][0].document.nodes[0].style).toMatchObject({
      visible: true,
      width: "full",
      gap: 32,
      objectFit: "contain",
      backgroundImage: "/api/media/background-1",
    });
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
