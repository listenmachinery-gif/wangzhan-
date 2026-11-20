// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

import { ProductEditor } from "@/components/admin/products/ProductEditor";

afterEach(cleanup);

const product = {
  id: "product-1",
  name: "Compact Electric Shearing Machine",
  slug: "compact-electric-shearing-machine",
  summary: "Compact electric shear",
  description: null,
  categoryId: "category-1",
  status: "DRAFT",
  version: 1,
  sections: [],
};

describe("ProductEditor", () => {
  it("opens the existing visual product page designer", () => {
    render(<ProductEditor
      initialProduct={product}
      categories={[{ id: "category-1", name: "Shearing Machines" }]}
      media={[]}
      pageDesignerHref="/admin/pages/page-1/edit"
    />);

    expect(screen.getByRole("link", { name: "自由设计产品页面" })).toHaveAttribute(
      "href",
      "/admin/pages/page-1/edit",
    );
  });

  it("opens a prefilled product page creation flow when no designer page exists", () => {
    render(<ProductEditor
      initialProduct={product}
      categories={[{ id: "category-1", name: "Shearing Machines" }]}
      media={[]}
      pageDesignerHref="/admin/pages/new?name=Compact%20Electric%20Shearing%20Machine&slug=product-compact-electric-shearing-machine&pageType=PRODUCT&template=detail"
    />);

    expect(screen.getByRole("link", { name: "自由设计产品页面" })).toHaveAttribute(
      "href",
      expect.stringContaining("slug=product-compact-electric-shearing-machine"),
    );
  });
});
