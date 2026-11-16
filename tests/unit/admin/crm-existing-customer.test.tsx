// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ManualInquiryForm } from "@/components/admin/crm/ManualInquiryForm";
const { push, principal, inquiryOptions, listAssignees, customerGet } = vi.hoisted(() => ({ push: vi.fn(), principal: vi.fn(), inquiryOptions: vi.fn(), listAssignees: vi.fn(), customerGet: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), redirect: (url: string) => { throw Error(url); }, notFound: () => { throw Error("404"); } }));
vi.mock("@/lib/auth/session", () => ({ getCurrentPrincipal: principal }));
vi.mock("@/lib/services/lead-service", () => ({ LeadService: class { listAssignees = listAssignees; } }));
vi.mock("@/lib/services/customer-service", async (original) => ({ ...await original<typeof import("@/lib/services/customer-service")>(), CustomerService: class { inquiryOptions = inquiryOptions; get = customerGet; } }));
const options = {
  contacts: [{ id: "contact-1", customerCode: "CU-1", fullName: "Existing Buyer", email: "existing@example.com", phone: null, whatsapp: null, countryCode: "US", companyId: "company-1" }],
  companies: [{ id: "company-1", companyCode: "CO-1", name: "Existing Company" }],
};
const props = { assignees: [], assigneeRequired: false, customerOptions: options };
beforeEach(() => {
  principal.mockResolvedValue({ id: "admin", roles: ["ADMIN"] });
  listAssignees.mockResolvedValue([]);
  inquiryOptions.mockResolvedValue(options);
  customerGet.mockResolvedValue({ ...options.contacts[0], company: options.companies[0], canEdit: false, inquiries: [], timeline: [] });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("existing customer linkage", () => {
  it("selects an existing customer/company, prefills snapshots and submits IDs without nested creation", async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ inquiry: { id: "second-inquiry" } }, { status: 201 }));
    vi.stubGlobal("fetch", fetch);
    render(<ManualInquiryForm {...props} />);
    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("关联已有客户"), "contact-1");
    expect(screen.getByRole("textbox", { name: "客户姓名" })).toHaveValue("Existing Buyer");
    expect(screen.getByRole("textbox", { name: "电子邮箱" })).toHaveValue("existing@example.com");
    expect(screen.getByLabelText("关联已有公司")).toHaveValue("company-1");
    expect(screen.getByLabelText("同时新建联系人")).toBeDisabled();
    expect(screen.getByLabelText("同时新建公司")).toBeDisabled();
    await user.type(screen.getByRole("textbox", { name: "需求描述" }), "Second machine inquiry");
    await user.click(screen.getByRole("button", { name: "创建询盘" }));
    const payload = JSON.parse(fetch.mock.calls[0][1].body);
    expect(payload).toMatchObject({ contactId: "contact-1", companyId: "company-1", name: "Existing Buyer", email: "existing@example.com" });
    expect(payload).not.toHaveProperty("contact");
    expect(payload).not.toHaveProperty("company");
    expect(push).toHaveBeenCalledWith("/admin/leads/second-inquiry");
  });
  it("searches options without losing inquiry text or allowing selection races", async () => {
    let finishSearch!: (response: Response) => void;
    const fetch = vi.fn().mockImplementation(() => new Promise<Response>((resolve) => { finishSearch = resolve; }));
    vi.stubGlobal("fetch", fetch);
    render(<ManualInquiryForm {...props} customerOptions={{ contacts: [], companies: [] }} />);
    const user = userEvent.setup();
    await user.type(screen.getByRole("textbox", { name: "需求描述" }), "Keep this requirement");
    await user.type(screen.getByLabelText("搜索已有客户或公司"), "Existing");
    await user.click(screen.getByRole("button", { name: "查询已有客户" }));
    expect(fetch.mock.calls[0][0]).toBe("/api/admin/customers/inquiry-options?query=Existing");
    expect(screen.getByLabelText("关联已有客户")).toBeDisabled();
    expect(screen.getByLabelText("关联已有公司")).toBeDisabled();
    expect(screen.getByRole("button", { name: "创建询盘" })).toBeDisabled();
    finishSearch(Response.json(options));
    expect(await screen.findByRole("option", { name: "Existing Buyer · CU-1" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "需求描述" })).toHaveValue("Keep this requirement");
  });
  it("validates and preselects customer-detail IDs on the server", async () => {
    const Page = (await import("@/app/admin/inquiries/new/page")).default;
    render(await Page({ searchParams: Promise.resolve({ contactId: "contact-1", companyId: "company-1" }) }));
    expect(inquiryOptions).toHaveBeenCalledWith(expect.objectContaining({ id: "admin" }), { contactId: "contact-1", companyId: "company-1" });
    expect(screen.getByLabelText("关联已有客户")).toHaveValue("contact-1");
    expect(screen.getByLabelText("关联已有公司")).toHaveValue("company-1");
    expect(screen.getByRole("textbox", { name: "客户姓名" })).toHaveValue("Existing Buyer");
  });
  it("does not render a form for an out-of-scope preselection", async () => {
    const { CustomerNotFoundError } = await import("@/lib/services/customer-service");
    inquiryOptions.mockRejectedValue(new CustomerNotFoundError());
    const Page = (await import("@/app/admin/inquiries/new/page")).default;
    await expect(Page({ searchParams: Promise.resolve({ contactId: "hidden" }) })).rejects.toThrow("404");
  });
  it.each(["ADMIN", "CRM_VIEWER"])("shows the customer-detail creation link only with inquiry.create: %s", async (role) => {
    principal.mockResolvedValue({ id: "actor", roles: [role] });
    const Page = (await import("@/app/admin/customers/[id]/page")).default;
    render(await Page({ params: Promise.resolve({ id: "contact-1" }) }));
    if (role === "ADMIN") expect(screen.getByRole("link", { name: "新建询盘" })).toHaveAttribute("href", "/admin/inquiries/new?contactId=contact-1&companyId=company-1");
    else expect(screen.queryByRole("link", { name: "新建询盘" })).not.toBeInTheDocument();
  });
});
