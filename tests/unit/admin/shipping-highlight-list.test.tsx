// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ShippingHighlightList } from "@/components/admin/shipping/ShippingHighlightList";

const item = {
  id: "shipping-1", slug: "germany-shipment", status: "PUBLISHED", version: 2, publishedVersion: 2,
  publishedAt: "2026-11-17T00:00:00.000Z", publishedShipmentDate: "2026-11-16T00:00:00.000Z",
  publishedCountryCode: "DE", categoryId: "category-1", productId: "product-1", coverMediaId: "cover-1",
  updatedAt: "2026-11-17T01:00:00.000Z",
  draftContent: { title: "德国电动剪板机发货", shipmentDate: "2026-11-16", countryCode: "DE", equipmentName: "电动剪板机", quantity: 3 },
};

afterEach(cleanup);

describe("ShippingHighlightList", () => {
  it("shows Chinese country names, status, shipment date, and edit links", () => {
    render(<ShippingHighlightList items={[item]} categories={[{ id: "category-1", name: "剪板机" }]} filters={{}} />);
    expect(screen.getAllByText("德国").some((element) => element.tagName === "TD")).toBe(true);
    expect(screen.getAllByText("已发布").some((element) => element.tagName === "SPAN")).toBe(true);
    expect(screen.getByText("2026年11月16日")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "编辑" })).toHaveAttribute("href", "/admin/shipping-highlights/shipping-1");
  });

  it("renders keyword, status, country, category, and shipment-date filters", () => {
    render(<ShippingHighlightList items={[item]} categories={[{ id: "category-1", name: "剪板机" }]} filters={{ query: "德国", countryCode: "DE" }} />);
    expect(screen.getByRole("textbox", { name: "关键词" })).toHaveValue("德国");
    expect(screen.getByRole("combobox", { name: "状态" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "国家或地区" })).toHaveValue("DE");
    expect(screen.getByRole("combobox", { name: "产品分类" })).toBeInTheDocument();
    expect(screen.getByLabelText("发货开始日期")).toBeInTheDocument();
    expect(screen.getByLabelText("发货结束日期")).toBeInTheDocument();
  });

  it("shows an honest empty state", () => {
    render(<ShippingHighlightList items={[]} categories={[]} filters={{}} />);
    expect(screen.getByText("暂无符合条件的发货记录")).toBeInTheDocument();
  });
});
