import { z } from "zod";

const optionalTrimmed = (maximum: number) => z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().max(maximum).optional(),
);

export const chatConversationInputSchema = z.strictObject({
  landingPath: z.string().trim().startsWith("/").max(2048),
  name: optionalTrimmed(120),
  email: z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().toLowerCase().email().max(254).optional(),
  ),
  whatsapp: optionalTrimmed(80),
  website: z.literal("").optional(),
});

export const chatMessageInputSchema = z.strictObject({
  clientMessageId: z.string().trim().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/),
  body: z.string().trim().min(1).max(5000),
  website: z.literal("").optional(),
});

export const chatMessageListQuerySchema = z.strictObject({
  cursor: z.string().trim().min(1).max(128).optional(),
  environment: z.enum(["DEVELOPMENT", "TEST", "PREVIEW", "PRODUCTION"]).optional(),
});

export const adminChatListQuerySchema = z.strictObject({
  environment: z.enum(["DEVELOPMENT", "TEST", "PREVIEW", "PRODUCTION"]),
  status: z.enum(["OPEN", "PENDING", "CLOSED", "SPAM"]).optional(),
  cursor: z.string().trim().min(1).max(128).optional(),
  assigneeId: z.string().trim().min(1).max(128).optional(),
});

export const chatTokenRequestSchema = z.strictObject({
  conversationId: z.string().trim().min(1).max(128),
});

export const chatAssignmentInputSchema = z.strictObject({
  assigneeId: z.string().trim().min(1).max(128),
  currentAssignmentId: z.string().trim().min(1).max(128).nullable(),
});

export const chatStatusInputSchema = z.strictObject({
  status: z.enum(["OPEN", "PENDING", "CLOSED", "SPAM"]),
});

export const chatLeadLinkInputSchema = z.discriminatedUnion("action", [
  z.strictObject({
    action: z.literal("create_or_link"),
    email: z.string().trim().toLowerCase().email().max(254),
    name: optionalTrimmed(120),
    company: optionalTrimmed(160),
  }),
  z.strictObject({
    action: z.literal("link_existing"),
    leadId: z.string().trim().min(1).max(128),
  }),
]);

export type ChatConversationInput = z.infer<typeof chatConversationInputSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageInputSchema>;
export type ChatMessageListQuery = z.infer<typeof chatMessageListQuerySchema>;
export type AdminChatListQuery = z.infer<typeof adminChatListQuerySchema>;
