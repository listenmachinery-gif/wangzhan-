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
