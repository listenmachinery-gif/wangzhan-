import type { CrmSourceChannel, LeadStatus } from "@prisma/client";

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

export const inquiryLegacyStatusLabels = {
  NEW: "新询盘",
  CONTACTED: "已联系",
  IN_DISCUSSION: "商务谈判",
  QUOTED: "已发送报价",
  WON: "已成交",
  LOST: "已流失",
  SPAM: "垃圾询盘",
} satisfies Record<LeadStatus, string>;

export const inquiryCustomerLevels = ["A", "B", "C", "D"] as const;

export type InquiryAssignee = { id: string; name: string };
