// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ChatWorkspace } from "@/components/admin/chat/ChatWorkspace";
import type { Principal } from "@/lib/auth/permissions";

const principal: Principal = { id: "supervisor-1", email: "supervisor@example.com", name: "Supervisor", roles: ["SUPPORT_SUPERVISOR"] };
const conversation = {
  id: "conversation_1",
  status: "OPEN",
  contactName: "Global Buyer",
  contactEmail: "buyer@example.com",
  contactWhatsapp: "+1 555 0100",
  agentUnreadCount: 3,
  lastMessageAt: "2026-11-16T10:00:00.000Z",
  visitor: { id: "visitor_1", countryCode: "US", deviceType: "desktop", lastSeenAt: "2026-11-16T10:00:00.000Z" },
  lead: null,
  assignments: [],
  messages: [{ id: "message_1", body: "Need a quotation", sentAt: "2026-11-16T10:00:00.000Z" }],
};

function response(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }));
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url === "/api/admin/chat/conversations") return response({ items: [conversation], nextCursor: null });
    if (url === "/api/admin/chat/token") return response({ code: "REALTIME_UNAVAILABLE" }, 503);
    if (url.endsWith("/messages") && (!init?.method || init.method === "GET")) {
      return response({ items: [{
        id: "message_1", clientMessageId: "visitor_1", senderType: "VISITOR", type: "TEXT",
        body: "Need a quotation", sentAt: "2026-11-16T10:00:00.000Z", deliveredAt: null, readAt: null,
      }], nextCursor: null });
    }
    if (url.endsWith("/messages") && init?.method === "POST") {
      const body = JSON.parse(String(init.body)) as { clientMessageId: string; body: string };
      return response({ message: {
        id: "message_2", clientMessageId: body.clientMessageId, senderType: "AGENT", type: "TEXT", body: body.body,
        sentAt: "2026-11-16T10:01:00.000Z", deliveredAt: null, readAt: null,
      }, realtime: { published: false, degraded: true } }, 201);
    }
    throw new Error(`Unexpected fetch ${url}`);
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("admin chat workspace", () => {
  it("renders a 280/flexible/340 three-pane workspace and opens a conversation with keyboard", async () => {
    const user = userEvent.setup();
    render(<ChatWorkspace principal={principal} agents={[]} />);

    const list = await screen.findByTestId("conversation-rail");
    expect(list).toHaveClass("lg:w-[280px]");
    expect(screen.getByTestId("conversation-pane")).toHaveClass("flex-1");
    expect(screen.getByTestId("visitor-context")).toHaveClass("xl:w-[340px]");
    expect(screen.getByLabelText("3 条未读消息")).toBeVisible();

    const item = within(list).getByRole("button", { name: /Global Buyer/ });
    item.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByText("Need a quotation")).toBeVisible();
    expect(screen.getByText("buyer@example.com")).toBeVisible();
    expect(screen.getByTestId("chat-workspace")).toHaveAttribute("data-mobile-flow", "list-to-conversation");
  });

  it("replies once and exposes the degraded realtime state", async () => {
    const user = userEvent.setup();
    render(<ChatWorkspace principal={principal} agents={[]} />);
    await user.click(await screen.findByRole("button", { name: /Global Buyer/ }));
    await user.type(await screen.findByRole("textbox", { name: "消息内容" }), "We will prepare a quotation.");
    await user.click(screen.getByRole("button", { name: "发送消息" }));

    expect(await screen.findByText("We will prepare a quotation.")).toBeVisible();
    expect(screen.getByText("已保存 · 实时传送暂不可用")).toBeVisible();
    expect(screen.getAllByText("We will prepare a quotation.")).toHaveLength(1);
  });
});
