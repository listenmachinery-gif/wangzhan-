// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
  status: "NEW",
  spamRecoveryStatus: "NEW",
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
  canUpdateFollowUp: true,
  canMarkSpam: true,
  canRestoreSpam: false,
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
        canUpdateFollowUp={false}
        canMarkSpam={false}
        canRestoreSpam={false}
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
      capabilities: { canEditStage, canUpdateFollowUp: canEditStage, canAssign, canAddNote: false },
    });
    const Page = (await import("@/app/admin/inquiries/[id]/page")).default;
    render(await Page({ params: Promise.resolve({ id: "lead-1" }) }));
    if (canEditStage) {
      expect(screen.getByLabelText("销售阶段")).toBeEnabled();
      expect(screen.getByLabelText("下次跟进时间（本地时间）")).toBeEnabled();
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
      capabilities: { canEditStage: true, canUpdateFollowUp: true, canAssign: true, canAddNote: true },
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


describe("next follow-up compatibility editor", () => {
  it("saves a local date/time with the optimistic version and refreshes", async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ version: 8 }));
    vi.stubGlobal("fetch", fetch);
    render(<InquiryDetail {...props} />);
    fireEvent.change(screen.getByLabelText("下次跟进时间（本地时间）"), { target: { value: "2030-02-03T14:30" } });
    await userEvent.setup().click(screen.getByRole("button", { name: "保存跟进时间" }));
    expect(fetch.mock.calls[0][0]).toBe("/api/admin/inquiries/lead-1");
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ version: 7, nextFollowUpAt: new Date(2030, 1, 3, 14, 30).toISOString() });
    expect(screen.getByRole("status")).toHaveTextContent("已保存");
    expect(refresh).toHaveBeenCalledOnce();
  });
  it("clears an existing follow-up without creating tasks", async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ version: 8 }));
    vi.stubGlobal("fetch", fetch);
    render(<InquiryDetail {...props} inquiry={{ ...inquiry, nextFollowUpAt: new Date(2030, 1, 3, 14, 30).toISOString() }} />);
    expect(screen.getByLabelText("下次跟进时间（本地时间）")).toHaveValue("2030-02-03T14:30");
    await userEvent.setup().click(screen.getByRole("button", { name: "清除跟进时间" }));
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ version: 7, nextFollowUpAt: null });
    expect(refresh).toHaveBeenCalledOnce();
  });
  it("locks the editor on conflict and offers reload recovery", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({}, { status: 409 })));
    render(<InquiryDetail {...props} inquiry={{ ...inquiry, nextFollowUpAt: "2030-02-03T06:30:00.000Z" }} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "清除跟进时间" }));
    expect(screen.getByRole("alert")).toHaveTextContent("版本冲突");
    expect(screen.getByLabelText("下次跟进时间（本地时间）")).toBeDisabled();
    expect(screen.getByRole("button", { name: "保存跟进时间" })).toBeDisabled();
    await userEvent.setup().click(screen.getByRole("button", { name: "重新加载" }));
    expect(refresh).toHaveBeenCalledOnce();
  });
  it("shows the read-only value without update capability even when stage editing is allowed", () => {
    render(<InquiryDetail {...props} canUpdateFollowUp={false} inquiry={{ ...inquiry, nextFollowUpAt: "2030-02-03T06:30:00.000Z" }} />);
    expect(screen.queryByLabelText("下次跟进时间（本地时间）")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "保存跟进时间" })).not.toBeInTheDocument();
    expect(screen.getByText("下次跟进").nextElementSibling).toHaveAttribute("datetime", "2030-02-03T06:30:00.000Z");
  });
});


describe("SPAM quarantine controls", () => {
  const spam = { ...inquiry, status: "SPAM" as const, stageCode: "REQUIREMENT_CONFIRMED", stageName: "需求已确认", spamRecoveryStatus: "CONTACTED" as const };
  it("prominently shows quarantine despite a preserved stage and removes stage selection", () => {
    render(<InquiryDetail {...props} inquiry={spam} canMarkSpam={false} canRestoreSpam />);
    expect(screen.getByRole("status")).toHaveTextContent("垃圾询盘（已隔离）");
    expect(screen.getByText("需求已确认")).toBeInTheDocument();
    expect(screen.queryByLabelText("销售阶段")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "保存阶段" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "标记垃圾询盘" })).not.toBeInTheDocument();
  });
  it.each([
    { label: "mark", value: inquiry, restore: false, status: "SPAM", button: "标记垃圾询盘" },
    { label: "restore detailed stage", value: spam, restore: true, status: "CONTACTED", button: "恢复询盘" },
    { label: "restore without saved stage", value: { ...spam, spamRecoveryStatus: "NEW" as const }, restore: true, status: "NEW", button: "恢复询盘" },
  ])("uses the versioned legacy-status path to $label", async ({ value, restore, status, button }) => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ version: 8 }));
    vi.stubGlobal("fetch", fetch);
    render(<InquiryDetail {...props} inquiry={value} canMarkSpam={!restore} canRestoreSpam={restore} />);
    await userEvent.setup().click(screen.getByRole("button", { name: button }));
    expect(fetch.mock.calls[0][0]).toBe("/api/admin/inquiries/lead-1");
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ version: 7, status });
    expect(refresh).toHaveBeenCalledOnce();
  });
  it("blocks stale recovery and offers reload", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({}, { status: 409 })));
    render(<InquiryDetail {...props} inquiry={spam} canMarkSpam={false} canRestoreSpam />);
    await userEvent.setup().click(screen.getByRole("button", { name: "恢复询盘" }));
    expect(screen.getByRole("alert")).toHaveTextContent("版本冲突");
    expect(screen.getByRole("button", { name: "恢复询盘" })).toBeDisabled();
    await userEvent.setup().click(screen.getByRole("button", { name: "重新加载" }));
    expect(refresh).toHaveBeenCalledOnce();
  });
  it("gives viewers quarantine visibility without mark or restore actions", () => {
    render(<InquiryDetail {...props} inquiry={spam} canEditStage={false} canUpdateFollowUp={false} canAssign={false} canAddNote={false} canMarkSpam={false} canRestoreSpam={false} />);
    expect(screen.getByRole("status")).toHaveTextContent("垃圾询盘（已隔离）");
    expect(screen.queryByRole("button", { name: /标记垃圾询盘|恢复询盘/ })).not.toBeInTheDocument();
  });
  it.each([
    { preSpamStage: { code: "REQUIREMENT_CONFIRMED" }, expected: "CONTACTED" },
    { preSpamStage: null, expected: "NEW" },
  ])("projects recovery from the saved stage only: $expected", async ({ preSpamStage, expected }) => {
    get.mockResolvedValue({ ...spam, preSpamStage, stage: { code: spam.stageCode, name: spam.stageName }, assignments: [], activities: [],
      capabilities: { canEditStage: true, canUpdateFollowUp: true, canAddNote: true, canAssign: true, canMarkSpam: false, canRestoreSpam: true } });
    const fetch = vi.fn().mockResolvedValue(Response.json({ version: 8 }));
    vi.stubGlobal("fetch", fetch);
    const Page = (await import("@/app/admin/inquiries/[id]/page")).default;
    render(await Page({ params: Promise.resolve({ id: inquiry.id }) }));
    await userEvent.setup().click(screen.getByRole("button", { name: "恢复询盘" }));
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ version: 7, status: expected });
  });
});
