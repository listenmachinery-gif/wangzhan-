// @vitest-environment jsdom

import { NextRequest } from "next/server";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  getVisitorTimeline: vi.fn(),
}));

vi.mock("@/lib/auth/guards", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/auth/guards")>(),
  requirePermission: mocks.requirePermission,
}));

vi.mock("@/lib/services/visitor-analytics-query-service", () => ({
  VisitorAnalyticsPermissionError: class VisitorAnalyticsPermissionError extends Error {},
  VisitorAnalyticsNotFoundError: class VisitorAnalyticsNotFoundError extends Error {},
  VisitorAnalyticsQueryService: class { getVisitorTimeline = mocks.getVisitorTimeline; },
}));

import { GET as getVisitor } from "@/app/api/admin/analytics/visitors/[id]/route";
import { VisitorTimelineDrawer } from "@/components/admin/analytics/visitors/VisitorTimelineDrawer";
import { PermissionDeniedError } from "@/lib/auth/guards";
import { VisitorAnalyticsNotFoundError } from "@/lib/services/visitor-analytics-query-service";

const principal = { id: "admin", email: "admin@zyroncnc.com", name: "Admin", roles: ["ADMIN"] };
const detail = {
  id: "visitor-abcdef",
  environment: "TEST",
  firstSeenAt: "2026-11-16T08:00:00.000Z",
  lastSeenAt: "2026-11-16T12:00:00.000Z",
  lastActiveAt: "2026-11-16T12:00:00.000Z",
  firstSource: { source: "google", medium: "organic" },
  lastSource: { source: "google", medium: "organic" },
  countryCode: "US",
  region: "CA",
  city: "Los Angeles",
  deviceType: "desktop",
  browser: "Chrome",
  operatingSystem: "Windows",
  linkedLead: { id: "lead-1", name: "Buyer", email: "buyer@example.com", company: "Buyer Co", status: "NEW" },
  sessions: [{
    id: "session-secret",
    startedAt: "2026-11-16T08:00:00.000Z",
    lastSeenAt: "2026-11-16T08:10:00.000Z",
    lastActiveAt: "2026-11-16T08:10:00.000Z",
    endedAt: null,
    landingPath: "/products/example",
    exitPath: "/contact",
    referrer: "https://www.google.com/",
    source: "google",
    medium: "organic",
    campaign: null,
    countryCode: "US",
    deviceType: "desktop",
    browser: "Chrome",
    operatingSystem: "Windows",
    pageViews: [{
      id: "page-secret", path: "/products/a-very-long-product-path-that-must-wrap-on-small-screens", title: "Example product",
      referrer: null, startedAt: "2026-11-16T08:02:00.000Z", lastHeartbeatAt: null, exitedAt: null, activeSeconds: 12,
      product: { id: "product-1", name: "Example Machine", slug: "example-machine" },
    }],
    events: [{
      id: "event-secret", type: "INQUIRY_SUBMIT", path: "/contact",
      properties: { form_kind: "product", email: "must-not-render@example.com" }, occurredAt: "2026-11-16T08:04:00.000Z",
      product: { id: "product-1", name: "Example Machine", slug: "example-machine" },
    }],
    siteSearches: [{ id: "search-secret", query: "electric shear", resultCount: 3, path: "/products", occurredAt: "2026-11-16T08:03:00.000Z" }],
  }],
};

function response(body: unknown, ok = true, status = 200) {
  return Promise.resolve({ ok, status, json: async () => body } as Response);
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("visitor detail route", () => {
  beforeEach(() => {
    mocks.requirePermission.mockResolvedValue(principal);
    mocks.getVisitorTimeline.mockResolvedValue(detail);
  });

  it("returns an authorized timeline without cookie or session keys", async () => {
    const response = await getVisitor(new NextRequest("http://localhost/api/admin/analytics/visitors/visitor-abcdef"), { params: Promise.resolve({ id: "visitor-abcdef" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.requirePermission).toHaveBeenCalledWith("analytics.read.visitors");
    expect(mocks.getVisitorTimeline).toHaveBeenCalledWith(principal, "visitor-abcdef", "TEST");
    expect(JSON.stringify(body)).not.toMatch(/anonymousId|sessionKey|pageViewKey|eventKey/);
  });

  it("maps permission and missing visitor states", async () => {
    mocks.requirePermission.mockRejectedValueOnce(new PermissionDeniedError("Denied"));
    const forbidden = await getVisitor(new NextRequest("http://localhost/api/admin/analytics/visitors/a"), { params: Promise.resolve({ id: "a" }) });
    expect(forbidden.status).toBe(403);

    mocks.getVisitorTimeline.mockRejectedValueOnce(new VisitorAnalyticsNotFoundError());
    const missing = await getVisitor(new NextRequest("http://localhost/api/admin/analytics/visitors/missing"), { params: Promise.resolve({ id: "missing" }) });
    expect(missing.status).toBe(404);
  });
});

describe("VisitorTimelineDrawer", () => {
  it("renders chronological journeys, safe metadata, CRM/product links, and wrapping paths", async () => {
    vi.stubGlobal("fetch", vi.fn(() => response(detail)));
    render(<VisitorTimelineDrawer visitorId="visitor-abcdef" onClose={vi.fn()} />);

    const dialog = await screen.findByRole("dialog", { name: "访客行为时间线" });
    expect(within(dialog).getByRole("link", { name: /Buyer Co/ })).toHaveAttribute("href", "/admin/leads/lead-1");
    expect(within(dialog).getAllByRole("link", { name: "Example Machine" })[0]).toHaveAttribute("href", "/products/example-machine");
    expect(within(dialog).getByText(/a-very-long-product-path/)).toHaveClass("break-all");
    expect(within(dialog).getByText("form_kind：product")).toBeVisible();
    expect(within(dialog).queryByText(/must-not-render/)).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/session-secret|page-secret|event-secret/)).not.toBeInTheDocument();
    expect(within(dialog).getAllByTestId("timeline-item").map((item) => item.textContent)).toEqual([
      expect.stringContaining("页面浏览"),
      expect.stringContaining("站内搜索"),
      expect.stringContaining("提交询盘"),
    ]);
    expect(dialog).toHaveAttribute("data-mobile-fullscreen", "true");
  });

  it("traps focus, closes on Escape, and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn(() => response(detail)));

    function Harness() {
      const [open, setOpen] = React.useState(false);
      const trigger = React.useRef<HTMLButtonElement>(null);
      return <><button ref={trigger} type="button" onClick={() => setOpen(true)}>查看旅程</button>{open ? <VisitorTimelineDrawer visitorId="visitor-abcdef" onClose={() => setOpen(false)} returnFocusRef={trigger} /> : null}</>;
    }

    const React = await import("react");
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "查看旅程" });
    await user.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "访客行为时间线" });
    const close = await screen.findByRole("button", { name: "关闭访客时间线" });
    expect(close).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "访客行为时间线" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("shows explicit not-found and permission states", async () => {
    vi.stubGlobal("fetch", vi.fn(() => response({ code: "NOT_FOUND" }, false, 404)));
    const view = render(<VisitorTimelineDrawer visitorId="missing" onClose={vi.fn()} />);
    expect(await screen.findByText("找不到该访客记录")).toBeVisible();

    vi.mocked(fetch).mockImplementationOnce(() => response({ code: "FORBIDDEN" }, false, 403));
    view.rerender(<VisitorTimelineDrawer visitorId="forbidden" onClose={vi.fn()} />);
    expect(await screen.findByText("没有权限查看访客详情")).toBeVisible();
  });
});
