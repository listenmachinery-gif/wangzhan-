import type { CrmSourceChannel } from "@prisma/client";

export const inquirySourceLabels = {
  WEBSITE: "官网",
  EMAIL: "邮件",
  WHATSAPP: "WhatsApp",
  PHONE: "电话",
  FACEBOOK: "Facebook",
  LINKEDIN: "LinkedIn",
  TRADE_SHOW: "展会",
  REFERRAL: "推荐",
  OTHER: "其他",
} satisfies Record<CrmSourceChannel, string>;

export const inquiryCustomerLevels = ["A", "B", "C", "D"] as const;

export type InquiryAssignee = { id: string; name: string };
