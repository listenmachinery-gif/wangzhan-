// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  InquiryDetail,
  type InquiryDetailValue,
} from "@/components/admin/crm/InquiryDetail";

const { refresh, get, listStages, listAssignees, getCurrentPrincipal } =
  vi.hoisted(() => ({
    refresh: vi.fn(),
    get: vi.fn(),
    listStages: vi.fn(),
    listAssignees: vi.fn(),
    getCurrentPrincipal: vi.fn(),
  }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
  redirect: (url: string) => {
    throw new Error(url);
  },
  notFound: () => {
    throw new Error("404");
  },
}));
vi.mock("@/lib/auth/session", () => ({ getCurrentPrincipal }));
vi.mock("@/lib/services/lead-service", () => ({
  LeadService: class {
    get = get;
    listStages = listStages;
    listAssignees = listAssignees;
  },
  LeadPermissionError: class extends Error {},
  LeadNotFoundError: class extends Error {},
}));

const inquiry: InquiryDetailValue = {
  id: "lead-1",
  version: 7,
  name: "Jane Buyer",
  email: "jane@example.com",
  company: "Acme",
  country: "US",
  phone: "+14155550123",
  whatsapp: null,
  inquiryNumber: "INQ-001",
  message: "Original request for a shear",
  product: "CNC Shear",
  material: "Steel",
  thickness: "6 mm",
  workingLength: "3 m",
  quantity: "2",
  voltage: "380 V",
  budget: "$5000",
  stageCode: "NEW",
  stageName: "新询盘",
  ownerId: "sales",
  ownerName: "李销售",
  nextFollowUpAt: null,
  activities: [
    {
      id: "activity-1",
      type: "NOTE",
      content: "Authorized note",
      createdAt: "2026-11-16T01:00:00Z",
      actorName: "李销售",
    },
  ],
};
const stages = [
  { code: "NEW", name: "新询盘", requiresReason: false },
  { code: "CONTACTED", name: "已联系", requiresReason: false },
  { code: "LOST", name: "已流失", requiresReason: true },
];
const props = {
  inquiry,
  stages,
  assignees: [
    { id: "sales", name: "李销售" },
    { id: "sales-2", name: "王销售" },
  ],
  canEditStage: true,
  canAddNote: true,
  canAssign: true,
};
beforeEach(() => {
  getCurrentPrincipal.mockResolvedValue({ id: "admin", roles: ["ADMIN"] });
  listStages.mockResolvedValue(stages);
  listAssignees.mockResolvedValue(props.assignees);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("inquiry workspace", () => {
  it("renders original context, product snapshot, authorized timeline, stage and owner without invented internal fields", () => {
    render(<InquiryDetail {...props} />);
    for (const text of [
      "Jane Buyer",
      "Acme",
      "CNC Shear",
      "Steel",
      "6 mm",
      "Original request for a shear",
      "Authorized note",
    ])
      expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.getByLabelText("销售阶段")).toHaveValue("NEW");
    expect(screen.getByLabelText("负责人")).toHaveValue("sales");
    expect(screen.queryByText("内部备注")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "基础备注" }),
    ).toBeInTheDocument();
  });
  it.each(["stage", "owner"])(
    "sends the version for %s changes and blocks further writes after a conflict",
    async (action) => {
      const fetch = vi
        .fn()
        .mockResolvedValue(
          Response.json({ code: "VERSION_CONFLICT" }, { status: 409 }),
        );
      vi.stubGlobal("fetch", fetch);
      render(<InquiryDetail {...props} />);
      const user = userEvent.setup();
      await user.selectOptions(
        screen.getByLabelText(action === "stage" ? "销售阶段" : "负责人"),
        action === "stage" ? "CONTACTED" : "sales-2",
      );
      await user.click(
        screen.getByRole("button", {
          name: action === "stage" ? "保存阶段" : "保存负责人",
        }),
      );
      expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual(
        action === "stage"
          ? { version: 7, stageCode: "CONTACTED" }
          : { version: 7, action: "assign", assigneeId: "sales-2" },
      );
      expect(await screen.findByRole("alert")).toHaveTextContent(/重新加载/);
      expect(screen.getByRole("button", { name: "保存阶段" })).toBeDisabled();
      await user.click(screen.getByRole("button", { name: "重新加载" }));
      expect(refresh).toHaveBeenCalled();
    },
  );
  it("requires a loss reason and submits it with the selected stage", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(Response.json({ id: "lead-1", version: 8 }));
    vi.stubGlobal("fetch", fetch);
    render(<InquiryDetail {...props} />);
    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("销售阶段"), "LOST");
    expect(screen.getByLabelText("阶段原因")).toBeRequired();
    await user.type(screen.getByLabelText("阶段原因"), "PRICE");
    await user.click(screen.getByRole("button", { name: "保存阶段" }));
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({
      version: 7,
      stageCode: "LOST",
      reasonCode: "PRICE",
    });
    expect(refresh).toHaveBeenCalled();
  });
  it("preserves basic NOTE creation and reports network errors accessibly", async () => {
    const fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(Response.json({ id: "note-2" }, { status: 201 }));
    vi.stubGlobal("fetch", fetch);
    render(<InquiryDetail {...props} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("备注内容"), "Called customer");
    await user.click(screen.getByRole("button", { name: "添加基础备注" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("网络");
    expect(screen.getByLabelText("备注内容")).toHaveValue("Called customer");
    await user.click(screen.getByRole("button", { name: "添加基础备注" }));
    expect(fetch.mock.calls[1][0]).toBe("/api/admin/leads/lead-1/activities");
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({
      type: "NOTE",
      content: "Called customer",
    });
  });
  it("renders a read-only workspace without mutation controls", () => {
    render(
      <InquiryDetail
        {...props}
        canEditStage={false}
        canAssign={false}
        canAddNote={false}
      />,
    );
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("李销售")).toBeInTheDocument();
  });
  it("disables an unchanged assignment to avoid a no-op save that cannot refresh its version", () => {
    render(<InquiryDetail {...props} />);
    expect(screen.getByRole("button", { name: "保存负责人" })).toBeDisabled();
  });
  it.each([
    { team: "managed", canEditStage: true, canAssign: true },
    { team: "viewer-only", canEditStage: false, canAssign: false },
  ])("uses service capabilities for an inactive current owner in a $team team", async ({ canEditStage, canAssign }) => {
    getCurrentPrincipal.mockResolvedValue({ id: "manager", roles: ["SALES_MANAGER", "CRM_VIEWER"] });
    listAssignees.mockResolvedValue([{ id: "replacement", name: "Active replacement" }]);
    get.mockResolvedValue({
      ...inquiry,
      interestedProduct: null,
      stage: { code: "NEW", name: "新询盘" },
      assignments: [{ assigneeId: "inactive", endedAt: null, assignee: { id: "inactive", name: "Inactive owner" } }],
      activities: [],
      capabilities: { canEditStage, canAssign, canAddNote: false },
    });
    const Page = (await import("@/app/admin/inquiries/[id]/page")).default;
    render(await Page({ params: Promise.resolve({ id: "lead-1" }) }));
    if (canEditStage) {
      expect(screen.getByLabelText("销售阶段")).toBeEnabled();
      expect(screen.getByLabelText("负责人")).toHaveValue("inactive");
      await userEvent.setup().selectOptions(screen.getByLabelText("负责人"), "replacement");
      expect(screen.getByRole("button", { name: "保存负责人" })).toBeEnabled();
    } else {
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
      expect(screen.getByText(/只读/)).toBeInTheDocument();
    }
    expect(screen.queryByRole("button", { name: "添加基础备注" })).not.toBeInTheDocument();
  });
  it("shares both route renderers and projects only displayed values to the client", async () => {
    const oldPage = (await import("@/app/admin/leads/[id]/page")).default;
    const newPage = (await import("@/app/admin/inquiries/[id]/page")).default;
    expect(oldPage).toBe(newPage);
    get.mockResolvedValue({
      ...inquiry,
      interestedProduct: { name: "CNC Shear" },
      stage: { code: "NEW", name: "新询盘" },
      assignments: [
        {
          assigneeId: "sales",
          endedAt: null,
          assignee: { id: "sales", name: "李销售" },
        },
      ],
      activities: [],
      capabilities: { canEditStage: true, canAssign: true, canAddNote: true },
      notificationAttempts: [{ token: "secret" }],
      internalNotes: "hidden",
      ipAddress: "private",
    });
    const element = await oldPage({
      params: Promise.resolve({ id: "lead-1" }),
    });
    expect(JSON.stringify(element)).not.toMatch(
      /secret|hidden|private|notificationAttempts|ipAddress/,
    );
    render(element);
    expect(
      screen.getByText("Original request for a shear"),
    ).toBeInTheDocument();
  });
});
