import type { AnalyticsEnvironment } from "@prisma/client";

export function currentAnalyticsEnvironment(): AnalyticsEnvironment {
  if (process.env.VERCEL_ENV === "production") return "PRODUCTION";
  if (process.env.VERCEL_ENV === "preview") return "PREVIEW";
  if (process.env.NODE_ENV === "test") return "TEST";
  return "DEVELOPMENT";
}
