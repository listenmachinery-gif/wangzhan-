export type AnalyticsIdentityResult = {
  visitorId: string;
  sessionId: string;
  visitorCreated: boolean;
  sessionCreated: boolean;
  cookieHeaders: string[];
};

export type SignedAnalyticsIdentity = {
  id: string;
  seenAt: Date;
};

export type RealtimeVisitorSummary = {
  onlineVisitors: number;
  activeVisitors: number;
  visitorsToday: number;
  sessionsToday: number;
  pageViewsToday: number;
};

export type LiveVisitorArrival = {
  id: string;
  label: string;
  firstSeenAt: string;
  countryCode: string | null;
  city: string | null;
  deviceType: string | null;
  path: string | null;
};

export type FirstPartyOverview = {
  generatedAt: string;
  environment: "PRODUCTION" | "PREVIEW" | "DEVELOPMENT" | "TEST";
  summary: RealtimeVisitorSummary;
  arrivals: LiveVisitorArrival[];
};
