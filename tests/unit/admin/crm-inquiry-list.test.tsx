// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import LegacyInquiryPage from "@/app/admin/leads/page";
import type { Principal } from "@/lib/auth/permissions";

const { getCurrentPrincipal, list, listStages, listAssignees, push, redirect } = vi.hoisted(() => ({
  getCurrentPrincipal: vi.fn(),
  list: vi.fn(),
  listStages: vi.fn(),
  listAssignees: vi.fn(),
  push: vi.fn(),
  redirect: vi.fn((path: string) => { throw new Error(`Redirect: ${path}`); }),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), redirect }));
vi.mock("@/lib/auth/session", () => ({ getCurrentPrincipal }));
vi.mock("@/lib/services/lead-service", () => ({
  LeadService: class {
    list = list;
    listStages = listStages;
    listAssignees = listAssignees;
  },
  LeadPermissionError: class extends Error {},
}));

const admin: Principal = { id: "admin", email: "admin@example.com", name: "管理员", roles: ["ADMIN"] };
const lead = {
  id: "lead-1", inquiryNumber: "INQ-001", name: "Jane Buyer", email: "buyer@example.com",
  phone: null, whatsapp: "+14155550123", country: "US", company: "Acme",
  interestedProduct: { name: "CNC Shear" }, message: "Need a machine",
  status: "QUOTED", stage: { code: "QUOTATION_SENT", name: "已发送报价" },
  sourceChannel: "PHONE", customerLevel: "A", assignments: [{ assignee: { name: "李销售" } }],
  lastFollowUpAt: new Date("2025-10-31T01:00:00Z"), nextFollowUpAt: new Date("2025-11-16T01:00:00Z"),
  estimatedDealAmount: { toString: () => "1500.25" }, estimatedCurrency: "USD",
  createdAt: new Date("2025-10-30T01:00:00Z"),
};

beforeEach(() => {
  getCurrentPrincipal.mockResolvedValue(admin);
  list.mockResolvedValue({ items: [lead], total: 1, page: 1, pageSize: 20 });
  listStages.mockResolvedValue([{ code: "QUOTATION_SENT", name: "已发送报价" }]);
  listAssignees.mockResolvedValue([{ id: "sales", name: "李销售" }]);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("inquiry list routes", () => {
  it("renders the CRM filters, a named table, and real stage, level, source and product values on the legacy URL", async () => {
    render(await LegacyInquiryPage({ searchParams: Promise.resolve({}) }));

    for (const label of ["搜索询盘", "销售阶段", "客户等级", "国家或地区", "来源渠道", "负责人", "逾期状态"]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "新增询盘" })).toHaveAttribute("href", "/admin/inquiries/new");
    const table = screen.getByRole("table", { name: "询盘列表" });
    expect(within(table).getAllByRole("columnheader").map((element) => element.textContent)).toEqual([
      "询盘编号", "客户", "公司", "国家", "联系方式", "产品", "来源", "阶段", "等级", "负责人",
      "最近跟进", "下次跟进", "逾期状态", "预计金额", "创建时间",
    ]);
    const row = within(table).getByRole("row", { name: /Jane Buyer/ });
    for (const label of ["已发送报价", "A", "电话", "已逾期"]) {
      expect(within(row).getByLabelText(`状态：${label}`)).toBeInTheDocument();
    }
    expect(row).toHaveTextContent("CNC Shear");
    expect(row).toHaveTextContent("USD 1500.25");
    expect(within(row).getByRole("link", { name: "INQ-001" })).toHaveAttribute("href", "/admin/leads/lead-1");
  });

  it("renders the same results and preserves search and filters in pagination on both URLs", async () => {
    const { default: InquiryPage } = await import("@/app/admin/inquiries/page");
    list.mockResolvedValue({ items: [lead], total: 61, page: 2, pageSize: 20 });
    const query = { query: "Jane Buyer", stageCode: "QUOTATION_SENT", sourceChannel: "PHONE", overdue: "false", page: "2" };

    for (const [Page, path] of [[LegacyInquiryPage, "/admin/leads"], [InquiryPage, "/admin/inquiries"]] as const) {
      const { unmount } = render(await Page({ searchParams: Promise.resolve(query) }));
      expect(screen.getByRole("row", { name: /Jane Buyer/ })).toBeInTheDocument();
      expect(list).toHaveBeenLastCalledWith(admin, query);
      expect(screen.getByRole("searchbox", { name: "搜索询盘" })).toHaveValue("Jane Buyer");
      const next = screen.getByRole("link", { name: "下一页" }).getAttribute("href");
      expect(next).toBeTruthy();
      const url = new URL(next!, "http://localhost");
      expect(url.pathname).toBe(path);
      expect(Object.fromEntries(url.searchParams)).toEqual({ ...query, page: "3" });
      expect(screen.getByRole("link", { name: "上一页" })).toHaveAttribute("href", expect.stringContaining("page=1"));
      unmount();
    }
  });

  it("shows status from a legacy URL and clears it independently of other filters", async () => {
    list.mockResolvedValue({ items: [lead], total: 45, page: 1, pageSize: 20 });
    render(await LegacyInquiryPage({ searchParams: Promise.resolve({ status: "NEW", query: "Jane" }) }));

    const filters = screen.getByRole("search", { name: "询盘筛选" }) as HTMLFormElement;
    const status = within(filters).getByRole("combobox", { name: "旧版状态" });
    expect(status).toHaveValue("NEW");
    expect(within(status).getByRole("option", { name: "新询盘" })).toHaveProperty("selected", true);
    expect(screen.getByRole("link", { name: "下一页" })).toHaveAttribute("href", expect.stringContaining("status=NEW"));

    await userEvent.setup().selectOptions(status, "");
    const form = new FormData(filters);
    expect(form.get("status")).toBe("");
    expect(form.get("query")).toBe("Jane");
  });

  it("drops an incompatible legacy status when the sales stage changes", async () => {
    listStages.mockResolvedValue([{ code: "WON", name: "已成交" }]);
    render(await LegacyInquiryPage({ searchParams: Promise.resolve({ status: "NEW", query: "Jane" }) }));

    const filters = screen.getByRole("search", { name: "询盘筛选" }) as HTMLFormElement;
    await userEvent.setup().selectOptions(within(filters).getByRole("combobox", { name: "销售阶段" }), "WON");
    const submitted = Object.fromEntries(Array.from(new FormData(filters), ([key, value]) => [key, String(value)]));
    await LegacyInquiryPage({ searchParams: Promise.resolve(submitted) });

    expect(list).toHaveBeenLastCalledWith(admin, { stageCode: "WON", query: "Jane" });
  });

  it("submits the legacy SPAM filter independently of the current sales stage", async () => {
    render(await LegacyInquiryPage({ searchParams: Promise.resolve({ stageCode: "QUOTATION_SENT" }) }));

    const filters = screen.getByRole("search", { name: "询盘筛选" }) as HTMLFormElement;
    const status = within(filters).getByRole("combobox", { name: "旧版状态" });
    expect(within(status).getByRole("option", { name: "垃圾询盘" })).toHaveValue("SPAM");
    await userEvent.setup().selectOptions(status, "SPAM");
    const submitted = Object.fromEntries(Array.from(new FormData(filters), ([key, value]) => [key, String(value)]));
    await LegacyInquiryPage({ searchParams: Promise.resolve(submitted) });

    expect(list).toHaveBeenLastCalledWith(admin, { status: "SPAM" });
  });

  it("shows the empty state and hides export and creation from a team viewer", async () => {
    getCurrentPrincipal.mockResolvedValue({ ...admin, roles: ["CRM_VIEWER"] });
    list.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 });
    render(await LegacyInquiryPage({ searchParams: Promise.resolve({ stageCode: "", query: "" }) }));

    expect(screen.getByRole("status")).toHaveTextContent("没有符合条件的询盘");
    expect(screen.queryByRole("link", { name: "新增询盘" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /导出/ })).not.toBeInTheDocument();
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ roles: ["CRM_VIEWER"] }), {});
  });

  it("rejects a direct request for manual entry without create permission", async () => {
    const { default: NewInquiryPage } = await import("@/app/admin/inquiries/new/page");
    getCurrentPrincipal.mockResolvedValue({ ...admin, roles: ["CRM_VIEWER"] });
    render(await NewInquiryPage());

    expect(screen.getByRole("alert")).toHaveTextContent("无权新增询盘");
    expect(listAssignees).not.toHaveBeenCalled();
  });
});

async function renderForm() {
  const { ManualInquiryForm } = await import("@/components/admin/crm/ManualInquiryForm");
  render(<ManualInquiryForm assignees={[{ id: "sales", name: "李销售" }]} assigneeRequired={false} />);
}

async function fillInquiry() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/客户姓名/), "Jane Buyer");
  await user.type(screen.getByLabelText(/电子邮箱/), "buyer@example.com");
  await user.type(screen.getByLabelText(/需求描述/), "Need a machine");
  return user;
}

describe("manual inquiry", () => {
  it("marks the required fields, and blocks empty and invalid-email submissions", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await renderForm();
    const user = userEvent.setup();
    for (const label of ["客户信息", "公司信息", "需求信息", "归属与跟进"]) {
      expect(screen.getByRole("group", { name: label })).toBeInTheDocument();
    }
    const submit = screen.getByRole("button", { name: "创建询盘" });
    const email = screen.getByLabelText(/电子邮箱/);
    await user.click(submit);
    expect(screen.getByLabelText(/客户姓名/)).toBeRequired();
    expect(screen.getByLabelText(/需求描述/)).toBeRequired();
    expect(email).toBeRequired();
    await user.type(screen.getByLabelText(/客户姓名/), "Jane Buyer");
    await user.type(email, "invalid");
    await user.type(screen.getByLabelText(/需求描述/), "Need a machine");
    await user.click(submit);
    expect(email).toBeInvalid();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("requires an explicit second submission to create distinct records after showing scoped duplicates", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(Response.json({
        code: "DUPLICATE_CONFIRMATION_REQUIRED",
        duplicateCandidates: {
          contacts: [{ id: "contact-old", customerCode: "CU-01", fullName: "Jane Buyer" }],
          companies: [{ id: "company-old", companyCode: "CO-01", name: "Acme" }],
        },
      }, { status: 409 }))
      .mockResolvedValueOnce(Response.json({ inquiry: { id: "lead-new" }, duplicateCandidates: { contacts: [], companies: [] } }, { status: 201 }));
    vi.stubGlobal("fetch", fetch);
    await renderForm();
    const user = await fillInquiry();
    await user.type(screen.getByLabelText(/公司名称/), "Acme");
    await user.click(screen.getByLabelText("同时新建联系人"));
    await user.click(screen.getByLabelText("同时新建公司"));
    const submit = screen.getByRole("button", { name: "创建询盘" });
    await user.click(submit);

    const warning = await screen.findByRole("alert");
    expect(warning).toHaveTextContent(/可能重复/);
    expect(warning).toHaveTextContent("Jane Buyer");
    expect(warning).toHaveTextContent("CU-01");
    expect(warning).toHaveTextContent("Acme");
    expect(warning).toHaveTextContent("CO-01");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
    expect(submit).toBeDisabled();
    const [url, request] = fetch.mock.calls[0];
    expect(url).toBe("/api/admin/inquiries");
    expect(request.method).toBe("POST");
    expect(JSON.parse(request.body)).toMatchObject({
      name: "Jane Buyer", email: "buyer@example.com", message: "Need a machine", companyName: "Acme",
      contact: { fullName: "Jane Buyer", email: "buyer@example.com" }, company: { name: "Acme" },
    });
    expect(JSON.parse(request.body).confirmDuplicateCreation).not.toBe(true);

    await user.click(screen.getByLabelText(/确认继续创建/));
    expect(fetch).toHaveBeenCalledTimes(1);
    await user.click(submit);
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toMatchObject({ confirmDuplicateCreation: true });
    expect(push).toHaveBeenCalledWith("/admin/leads/lead-new");
  });

  it.each([
    [400, "INVALID_LEAD", "请检查"],
    [403, "FORBIDDEN", "无权"],
    [409, "VERSION_CONFLICT", "冲突"],
    [200, undefined, "无法确认"],
  ])("reports an unsuccessful creation (%s) and keeps the entered values", async (status, code, message) => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ code, inquiry: { id: "lead-new" } }, { status }));
    vi.stubGlobal("fetch", fetch);
    await renderForm();
    const user = await fillInquiry();
    await user.click(screen.getByRole("button", { name: "创建询盘" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(screen.getByLabelText(/电子邮箱/)).toHaveValue("buyer@example.com");
    expect(push).not.toHaveBeenCalled();
  });
});
