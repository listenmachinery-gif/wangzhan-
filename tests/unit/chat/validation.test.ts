import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { issueChatToken, verifyChatToken } from "@/lib/auth/chat-token";
import { chatConversationInputSchema, chatMessageInputSchema } from "@/lib/validation/chat";

const originalEnvironment = { ...process.env };

beforeEach(() => {
  process.env.REALTIME_ENABLED = "true";
  process.env.UPSTASH_REDIS_URL = "rediss://default:secret@example.upstash.io:6379";
  process.env.REALTIME_TOKEN_SECRET = "chat-token-secret".repeat(3);
  process.env.VERCEL_ENV = "preview";
});

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe("chat validation", () => {
  it("accepts optional contact fields and normalizes email", () => {
    expect(chatConversationInputSchema.parse({
      landingPath: "/products/small-electric-shear",
      name: "  Buyer  ",
      email: " Buyer@Example.COM ",
      whatsapp: " +86 138 0000 0000 ",
      website: "",
    })).toEqual({
      landingPath: "/products/small-electric-shear",
      name: "Buyer",
      email: "buyer@example.com",
      whatsapp: "+86 138 0000 0000",
      website: "",
    });
    expect(chatConversationInputSchema.parse({ landingPath: "/contact" })).toEqual({ landingPath: "/contact" });
  });

  it("allows plain text up to 5,000 characters and rejects honeypots", () => {
    expect(chatMessageInputSchema.parse({
      clientMessageId: "client-message-1",
      body: "<script>alert('render only as text')</script>",
      website: "",
    }).body).toContain("<script>");
    expect(chatMessageInputSchema.parse({ clientMessageId: "client-message-2", body: "x".repeat(5000) }).body).toHaveLength(5000);
    expect(() => chatMessageInputSchema.parse({ clientMessageId: "client-message-3", body: "x".repeat(5001) })).toThrow();
    expect(() => chatMessageInputSchema.parse({ clientMessageId: "client-message-4", body: "Hello", website: "bot.example" })).toThrow();
  });
});

describe("scoped chat tokens", () => {
  it("round-trips a short-lived visitor token", () => {
    const now = new Date("2026-11-16T10:00:00.000Z");
    const token = issueChatToken({
      subjectType: "visitor",
      subjectId: "anonymous_123",
      conversationId: "conversation_123",
      environment: "PREVIEW",
    }, now);

    expect(verifyChatToken(token, new Date("2026-11-16T10:04:59.000Z"))).toMatchObject({
      subjectType: "visitor",
      subjectId: "anonymous_123",
      conversationId: "conversation_123",
      environment: "PREVIEW",
    });
    expect(() => verifyChatToken(token, new Date("2026-11-16T10:05:01.000Z"))).toThrow(/expired/i);
  });

  it("rejects token tampering", () => {
    const token = issueChatToken({
      subjectType: "visitor",
      subjectId: "anonymous_123",
      conversationId: "conversation_123",
      environment: "PREVIEW",
    }, new Date("2026-11-16T10:00:00.000Z"));

    expect(() => verifyChatToken(`${token.slice(0, -1)}x`, new Date("2026-11-16T10:01:00.000Z"))).toThrow(/invalid/i);
  });
});
