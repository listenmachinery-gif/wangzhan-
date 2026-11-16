// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CustomerForm } from "@/components/admin/crm/CustomerForm";
import { CustomerDetail } from "@/components/admin/crm/CustomerDetail";
import { CustomerList } from "@/components/admin/crm/CustomerList";
import type { CustomerDetail as CustomerValue } from "@/lib/services/customer-service";

const { push, refresh, getCurrentPrincipal, list, get } = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  getCurrentPrincipal: vi.fn(),
  list: vi.fn(),
  get: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
  redirect: (url: string) => {
    throw new Error(url);
  },
  notFound: () => {
    throw new Error("404");
  },
}));
vi.mock("@/lib/auth/session", () => ({ getCurrentPrincipal }));
vi.mock("@/lib/services/customer-service", () => ({
  CustomerService: class {
    list = list;
    get = get;
  },
  CustomerNotFoundError: class extends Error {},
  CustomerPermissionError: class extends Error {},
}));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const customer = {
  id: "customer-1",
  customerCode: "CU-01",
  fullName: "Jane Buyer",
  email: "jane@example.com",
  phone: null,
  whatsapp: null,
  countryCode: "US",
  company: { name: "Acme", canEdit: false },
  canEdit: false,
  inquiryCount: 1,
  inquiries: [
    {
      id: "allowed-1",
      inquiryNumber: "INQ-01",
      status: "NEW",
      stage: { name: "新询盘" },
      createdAt: new Date("2026-11-16"),
    },
  ],
  timeline: [
    {
      id: "a1",
      leadId: "allowed-1",
      content: "Visible activity",
      createdAt: new Date("2026-11-16"),
      type: "NOTE",
    },
  ],
} as unknown as CustomerValue;
describe("customer workspace", () => {
  it("offers an accessible recovery link for invalid list filters without querying customers", async () => {
    getCurrentPrincipal.mockResolvedValue({ id: "admin", roles: ["ADMIN"] });
    const Page = (await import("@/app/admin/customers/page")).default;
    render(await Page({ searchParams: Promise.resolve({ page: "bad" }) }));
    expect(screen.getByRole("alert")).toHaveTextContent("客户筛选条件无效");
    expect(screen.getByRole("link", { name: "清除筛选" })).toHaveAttribute(
      "href",
      "/admin/customers",
    );
    expect(list).not.toHaveBeenCalled();
  });
  it("denies direct customer list and creation routes to unauthorized roles", async () => {
    getCurrentPrincipal.mockResolvedValue({
      id: "editor",
      roles: ["PRODUCT_EDITOR"],
    });
    const Page = (await import("@/app/admin/customers/page")).default;
    const NewPage = (await import("@/app/admin/customers/new/page")).default;
    const view = render(await Page({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("alert")).toHaveTextContent("无权查看客户");
    view.unmount();
    render(await NewPage());
    expect(screen.getByRole("alert")).toHaveTextContent("无权新增客户");
    expect(list).not.toHaveBeenCalled();
  });
  it("shows only authorized inquiries and visibly read-only customer fields", () => {
    render(<CustomerDetail customer={customer} />);
    expect(screen.getByText(/只读/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "INQ-01" })).toHaveAttribute(
      "href",
      "/admin/inquiries/allowed-1",
    );
    expect(
      screen
        .getAllByRole("link")
        .filter((link) =>
          link.getAttribute("href")?.startsWith("/admin/inquiries/"),
        ),
    ).toHaveLength(1);
    expect(screen.queryByText("内部备注")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("Visible activity")).toBeInTheDocument();
  });
  it("lists scoped customer rows with a labeled search and preserved pagination", () => {
    render(
      <CustomerList
        items={[customer]}
        page={1}
        pageSize={20}
        total={22}
        query={{ query: "Jane Buyer" }}
      />,
    );
    expect(screen.getByLabelText("搜索客户")).toHaveValue("Jane Buyer");
    const table = screen.getByRole("table", { name: "客户列表" });
    expect(
      within(table).getByRole("link", { name: "Jane Buyer" }),
    ).toHaveAttribute("href", "/admin/customers/customer-1");
    expect(screen.getByRole("link", { name: "下一页" })).toHaveAttribute(
      "href",
      "/admin/customers?query=Jane+Buyer&page=2",
    );
  });
  it("validates contact information in an accessible error summary", async () => {
    vi.stubGlobal("fetch", vi.fn());
    render(<CustomerForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("客户姓名"), "Jane Buyer");
    await user.click(screen.getByRole("button", { name: "创建客户" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /邮箱|电话|WhatsApp/,
    );
    expect(fetch).not.toHaveBeenCalled();
  });
  it("requires an explicit second action after scoped duplicate candidates and resets confirmation when input changes", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json(
          {
            code: "DUPLICATE_CONFIRMATION_REQUIRED",
            duplicateCandidates: {
              contacts: [
                {
                  id: "old",
                  customerCode: "CU-OLD",
                  fullName: "Jane Existing",
                },
              ],
              companies: [{ id: "co", companyCode: "CO-OLD", name: "Acme" }],
            },
          },
          { status: 409 },
        ),
      )
      .mockResolvedValueOnce(
        Response.json({ customer: { id: "new" } }, { status: 201 }),
      );
    vi.stubGlobal("fetch", fetch);
    render(<CustomerForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("客户姓名"), "Jane Buyer");
    await user.type(screen.getByLabelText("电子邮箱"), "jane@example.com");
    await user.click(screen.getByRole("button", { name: "创建客户" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("CU-OLD");
    expect(screen.getByRole("alert")).toHaveTextContent("CO-OLD");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(
      JSON.parse(fetch.mock.calls[0][1].body).confirmDuplicateCreation,
    ).not.toBe(true);
    await user.click(screen.getByRole("button", { name: "确认创建独立客户" }));
    expect(
      JSON.parse(fetch.mock.calls[1][1].body).confirmDuplicateCreation,
    ).toBe(true);
    expect(push).toHaveBeenCalledWith("/admin/customers/new");
  });
  it("invalidates duplicate confirmation after editing identity", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json(
            {
              code: "DUPLICATE_CONFIRMATION_REQUIRED",
              duplicateCandidates: { contacts: [], companies: [] },
            },
            { status: 409 },
          ),
        ),
    );
    render(<CustomerForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("客户姓名"), "Jane");
    await user.type(screen.getByLabelText("电子邮箱"), "jane@example.com");
    await user.click(screen.getByRole("button", { name: "创建客户" }));
    expect(
      await screen.findByRole("button", { name: "确认创建独立客户" }),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText("客户姓名"), " Updated");
    expect(
      screen.queryByRole("button", { name: "确认创建独立客户" }),
    ).not.toBeInTheDocument();
  });
  it("updates with the scoped version and shows reload guidance for a conflict", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        Response.json({ code: "VERSION_CONFLICT" }, { status: 409 }),
      );
    vi.stubGlobal("fetch", fetch);
    render(
      <CustomerForm
        customer={{
          id: "customer-1",
          version: 4,
          fullName: "Jane",
          email: "jane@example.com",
        }}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "保存客户" }));
    expect(fetch.mock.calls[0][0]).toBe("/api/admin/customers/customer-1");
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({
      version: 4,
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("重新加载");
    expect(screen.getByRole("button", { name: "保存客户" })).toBeDisabled();
  });
});
