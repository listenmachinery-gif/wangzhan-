// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PublicChatWidget } from "@/components/chat/PublicChatWidget";

function json(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  }));
}

function fetchMock() {
  return vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith("/api/chat/conversations") && init?.method === "POST") {
      return json({ id: "conversation_1", status: "OPEN", contactName: null });
    }
    if (url.includes("/api/chat/conversations/conversation_1/messages") && (!init?.method || init.method === "GET")) {
      return json({ items: [], nextCursor: null });
    }
    if (url.endsWith("/api/chat/token")) return json({ code: "REALTIME_UNAVAILABLE" }, 503);
    if (url.includes("/api/chat/conversations/conversation_1/messages") && init?.method === "POST") {
      const request = JSON.parse(String(init.body)) as { clientMessageId: string; body: string };
      return json({
        message: {
          id: "message_1",
          clientMessageId: request.clientMessageId,
          senderType: "VISITOR",
          type: "TEXT",
          body: request.body,
          sentAt: "2026-11-16T10:00:00.000Z",
          deliveredAt: null,
          readAt: null,
        },
        duplicate: false,
        realtime: { published: false, degraded: true },
      }, 201);
    }
    throw new Error(`Unexpected fetch: ${url}`);
  });
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("fetch", fetchMock());
  Object.defineProperty(window.navigator, "onLine", { configurable: true, value: true });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("public chat widget", () => {
  it("opens independently of analytics consent, traps focus, closes with Escape, and returns focus", async () => {
    const user = userEvent.setup();
    render(<PublicChatWidget />);

    const launcher = screen.getByRole("button", { name: "Chat With Us" });
    await user.click(launcher);
    const dialog = screen.getByRole("dialog", { name: "Chat with ZYRON" });
    expect(dialog).toHaveAttribute("data-mobile-fullscreen", "true");
    expect(screen.getByRole("button", { name: "Close chat" })).toHaveFocus();
    expect(document.cookie).not.toContain("zyron_analytics_consent");

    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Chat with ZYRON" })).not.toBeInTheDocument();
    expect(launcher).toHaveFocus();
  });

  it("starts anonymously, reconciles optimistic messages once, and reports HTTP fallback", async () => {
    const user = userEvent.setup();
    render(<PublicChatWidget />);
    await user.click(screen.getByRole("button", { name: "Chat With Us" }));
    await user.click(screen.getByRole("button", { name: "Continue without contact details" }));

    expect(await screen.findByText("Messages are saved · Live updates unavailable")).toBeVisible();
    await user.type(screen.getByLabelText("Message"), "Please quote this machine");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByText("Please quote this machine")).toBeVisible();
    await waitFor(() => expect(screen.getAllByText("Please quote this machine")).toHaveLength(1));
    expect(localStorage.getItem("zyron_chat_conversation_id")).toBe("conversation_1");
  });

  it("queues while offline and flushes after reconnect without duplicating the message", async () => {
    const user = userEvent.setup();
    render(<PublicChatWidget />);
    await user.click(screen.getByRole("button", { name: "Chat With Us" }));
    await user.click(screen.getByRole("button", { name: "Continue without contact details" }));
    await screen.findByLabelText("Message");

    Object.defineProperty(window.navigator, "onLine", { configurable: true, value: false });
    window.dispatchEvent(new Event("offline"));
    await user.type(screen.getByLabelText("Message"), "Send when online");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByText("Waiting to send")).toBeVisible();

    Object.defineProperty(window.navigator, "onLine", { configurable: true, value: true });
    window.dispatchEvent(new Event("online"));
    await waitFor(() => expect(screen.queryByText("Waiting to send")).not.toBeInTheDocument());
    expect(screen.getAllByText("Send when online")).toHaveLength(1);
  });
});
