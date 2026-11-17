import type { AnalyticsEnvironment } from "@prisma/client";

import type { AnalyticsOverview, AnalyticsRange } from "@/lib/analytics/types";
import type { FirstPartyOverview } from "@/lib/analytics/first-party/types";

export type DashboardRange = AnalyticsRange;

export type DashboardBreakdown = {
  value: string;
  label?: string;
  visitors: number;
  sessions: number;
  pageViews: number;
  events?: number;
  inquiries: number;
};

export type DashboardTrendPoint = {
  date: string;
  visitors: number;
  sessions: number;
  pageViews: number;
  inquiries: number;
};

export type DashboardFirstPartyReport = {
  range: { from: string; to: string };
  environment: AnalyticsEnvironment;
  firstParty: {
    trend: DashboardTrendPoint[];
    sources: DashboardBreakdown[];
    countries: DashboardBreakdown[];
    devices: DashboardBreakdown[];
    products: DashboardBreakdown[];
    funnel: {
      visitors: number;
      chatVisitors: number;
      linkedLeads: number;
      inquirySubmissions: number;
      chatToLeadRate: number;
    };
  };
};

export type DashboardContentStats = {
  products: number;
  publishedProducts: number;
  newLeads: number;
};

export type DashboardKpi = {
  id: string;
  label: string;
  value: number | null;
  available: boolean;
  format: "number" | "percent";
  source: "第一方实时" | "第一方汇总" | "GA4" | "Search Console" | "CMS" | "CRM";
  reason?: string;
  changePercent?: number | null;
};

export type DashboardModelInput = {
  live: FirstPartyOverview | null;
  firstParty: DashboardFirstPartyReport | null;
  google: AnalyticsOverview | null;
  content: DashboardContentStats;
};

export type DashboardInquiry = {
  id: string;
  inquiryNumber?: string | null;
  country?: string | null;
  status?: string | null;
  createdAt?: string | null;
  nextFollowUpAt?: string | null;
  interestedProduct?: { id?: string; name?: string; slug?: string } | null;
  stage?: { code?: string; name?: string; color?: string } | null;
};
