import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  identity: vi.fn(),
  createOrResumeConversation: vi.fn(),
  listMessages: vi.fn(),
  sendVisitorMessage: vi.fn(),
  sendAgentMessage: vi.fn(),
  listAdminConversations: vi.fn(),
  getCurrentPrincipal: vi.fn(),
}));

vi.mock("@/lib/analytics/first-party/identity", () => ({
  readOrCreateAnalyticsIdentity: mocks.identity,
}));
vi.mock("@/lib/services/chat-service", () => ({
  ChatPermissionError: class ChatPermissionError extends Error {},
  ChatNotFoundError: class ChatNotFoundError extends Error {},
  ChatConflictError: class ChatConflictError extends Error {},
  ChatRateLimitError: class ChatRateLimitError extends Error {},
  ChatService: class {
    createOrResumeConversation = mocks.createOrResumeConversation;
    listMessages = mocks.listMessages;
    sendVisitorMessage = mocks.sendVisitorMessage;
    sendAgentMessage = mocks.sendAgentMessage;
    listAdminConversations = mocks.listAdminConversations;
  },
}));
vi.mock("@/lib/auth/session", () => ({ getCurrentPrincipal: mocks.getCurrentPrincipal }));

import { GET as listAdmin } from "@/app/api/admin/chat/conversations/route";
import { POST as createConversation } from "@/app/api/chat/conversations/route";
import { GET as listMessages, POST as sendMessage } from "@/app/api/chat/conversations/[id]/messages/route";

const identity = {
  visitorId: "anonymous_123",
  sessionId: "session_123",
  visitorCreated: false,
  sessionCreated: false,
  cookieHeaders: ["zyron_sid=signed; Path=/; HttpOnly"],
};
const owner = { anonymousId: "anonymous_123", sessionKey: "session_123", environment: "TEST" };
const principal = { id: "admin-1", email: "admin@zyroncnc.com", name: "Admin", roles: ["ADMIN"] };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.identity.mockReturnValue(identity);
  mocks.getCurrentPrincipal.mockResolvedValue(principal);
});

describe("public chat routes", () => {
  it("creates a conversation using signed anonymous identity and returns refreshed cookies", async () => {
    mocks.createOrResumeConversation.mockResolvedValue({ id: "conversation_123", status: "OPEN" });
    const request = new NextRequest("http://localhost/api/chat/conversations", {
      method: "POST",
      body: JSON.stringify({ landingPath: "/products/example", email: "buyer@example.com" }),
      headers: { "content-type": "application/json" },
    });

    const response = await createConversation(request);
    expect(response.status).toBe(201);
    expect(mocks.createOrResumeConversation).toHaveBeenCalledWith(owner, {
      landingPath: "/products/example",
      email: "buyer@example.com",
    });
    expect(response.headers.get("set-cookie")).toContain("zyron_sid=signed");
  });

  it("syncs by cursor and sends visitor messages through ownership-scoped service calls", async () => {
    mocks.listMessages.mockResolvedValue({ items: [], nextCursor: null });
    mocks.sendVisitorMessage.mockResolvedValue({ message: { id: "message_2" }, realtime: { published: false, degraded: true } });
    const context = { params: Promise.resolve({ id: "conversation_123" }) };

    const getResponse = await listMessages(
      new NextRequest("http://localhost/api/chat/conversations/conversation_123/messages?cursor=message_1"),
      context,
    );
    expect(getResponse.status).toBe(200);
    expect(mocks.listMessages).toHaveBeenCalledWith(owner, "conversation_123", { cursor: "message_1" });

    const postResponse = await sendMessage(new NextRequest(
      "http://localhost/api/chat/conversations/conversation_123/messages",
      { method: "POST", body: JSON.stringify({ clientMessageId: "client_2", body: "Hello" }) },
    ), context);
    expect(postResponse.status).toBe(201);
    expect(mocks.sendVisitorMessage).toHaveBeenCalledWith(owner, "conversation_123", { clientMessageId: "client_2", body: "Hello" });
  });
});

describe("admin chat routes", () => {
  it("requires an authenticated principal and uses server-derived environment", async () => {
    mocks.listAdminConversations.mockResolvedValue({ items: [], nextCursor: null });
    const response = await listAdmin(new NextRequest("http://localhost/api/admin/chat/conversations?status=OPEN"));

    expect(response.status).toBe(200);
    expect(mocks.listAdminConversations).toHaveBeenCalledWith(principal, { status: "OPEN", environment: "TEST" });
  });
});
