// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

import { PageCreateForm } from "@/components/admin/pages/PageCreateForm";

afterEach(cleanup);

describe("PageCreateForm", () => {
  it("prefills a product page and selects the product detail template", () => {
    render(<PageCreateForm defaults={{
      name: "Compact Electric Shearing Machine",
      slug: "product-compact-electric-shearing-machine",
      pageType: "PRODUCT",
      template: "detail",
    }} />);

    expect(screen.getByRole("textbox", { name: "页面名称" })).toHaveValue("Compact Electric Shearing Machine");
    expect(screen.getByRole("textbox", { name: "Slug" })).toHaveValue("product-compact-electric-shearing-machine");
    expect(screen.getByRole("combobox", { name: "页面类型" })).toHaveValue("PRODUCT");
    expect(screen.getByRole("radio", { name: /单品详情/ })).toBeChecked();
  });
});
