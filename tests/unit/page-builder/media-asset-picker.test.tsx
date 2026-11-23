// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MediaAssetPicker } from "@/components/admin/pages/MediaAssetPicker";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const firstPage = {
  items: [{
    id: "asset/image one",
    originalName: "machine.jpg",
    mimeType: "image/jpeg",
    altText: "Machine front view",
    category: "Products",
    previewUrl: "https://preview.example/machine.jpg",
  }],
  nextCursor: "next-page",
};

describe("MediaAssetPicker", () => {
  it("moves focus into the dialog, traps it, closes with Escape, and restores the trigger", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(firstPage)));
    const user = userEvent.setup();
    render(<MediaAssetPicker kind="image" onSelect={vi.fn()} />);

    const trigger = screen.getByRole("button", { name: "从媒体资源库替换" });
    await user.click(trigger);

    const search = screen.getByRole("textbox", { name: "搜索媒体" });
    await waitFor(() => expect(search).toHaveFocus());
    await screen.findByRole("button", { name: /machine\.jpg/ });

    const dialog = screen.getByRole("dialog", { name: "选择媒体库图片" });
    const close = screen.getByRole("button", { name: "关闭媒体选择" });
    const loadMore = screen.getByRole("button", { name: "加载更多" });

    loadMore.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(close).toHaveFocus();

    close.focus();
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(loadMore).toHaveFocus();

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("filters, searches, paginates, and returns only a durable site media URL", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify(firstPage)))
      .mockResolvedValueOnce(new Response(JSON.stringify(firstPage)))
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [], nextCursor: null })));
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<MediaAssetPicker kind="image" onSelect={onSelect} label="替换主图" />);

    await user.click(screen.getByRole("button", { name: "替换主图" }));
    await screen.findByRole("button", { name: /machine\.jpg/ });
    expect(fetchMock.mock.calls[0][0]).toContain("kind=image");

    await user.type(screen.getByRole("textbox", { name: "搜索媒体" }), "electric shear");
    await user.click(screen.getByRole("button", { name: "搜索" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1][0]).toContain("query=electric+shear");

    await user.click(screen.getByRole("button", { name: "加载更多" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(fetchMock.mock.calls[2][0]).toContain("cursor=next-page");

    await user.click(screen.getByRole("button", { name: /machine\.jpg/ }));
    expect(onSelect).toHaveBeenCalledWith({
      id: "asset/image one",
      url: "/api/media/asset%2Fimage%20one",
      altText: "Machine front view",
      mimeType: "image/jpeg",
    });
  });
});
