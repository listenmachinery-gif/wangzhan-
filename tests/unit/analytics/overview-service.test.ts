import { describe, expect, it, vi } from "vitest";
import { generateKeyPairSync } from "node:crypto";

import { readGoogleIntegrationConfig } from "@/lib/analytics/config";
import { GoogleIntegrationError } from "@/lib/analytics/google-http";
import { AnalyticsOverviewService } from "@/lib/analytics/overview-service";
import { SuccessCache } from "@/lib/analytics/success-cache";
import type { AnalyticsRange, Ga4Report, SearchConsoleReport } from "@/lib/analytics/types";

const now = new Date("2026-11-16T02:00:00.000Z");
const window = { startDate: "2026-11-09", endDate: "2026-11-15" };
const previousWindow = { startDate: "2026-11-02", endDate: "2026-11-08" };
const metric = { value: 1, previousValue: 0, changePercent: null };
const { privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 1024,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

function configured() {
  return readGoogleIntegrationConfig({
    ...process.env,
    NEXT_PUBLIC_GA4_MEASUREMENT_ID: "G-ABC123",
    GOOGLE_ANALYTICS_PROPERTY_ID: "123456789",
    GOOGLE_SEARCH_CONSOLE_SITE_URL: "sc-domain:zyroncnc.com",
    GOOGLE_SERVICE_ACCOUNT_EMAIL: "reports@example.iam.gserviceaccount.com",
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: privateKey.replaceAll("\n", "\\n"),
  });
}

function ga4Report(empty = false): Ga4Report {
  const value = empty ? { value: 0, previousValue: 0, changePercent: null } : metric;
  return {
    range: "7d",
    currentWindow: window,
    previousWindow,
    generatedAt: now.toISOString(),
    dataThrough: window.endDate,
    metrics: { activeUsers: value, sessions: value, pageViews: value, engagementRate: value, keyEvents: value },
    daily: empty ? [] : [{ date: "2026-11-09", activeUsers: 1, sessions: 1, pageViews: 1 }],
    topPages: [], acquisition: [], countries: [],
    events: { inquiry_start: 0, inquiry_submit: 0, whatsapp_click: 0, email_click: 0, catalog_download: 0 },
  };
}

function gscReport(empty = false): SearchConsoleReport {
  const value = empty ? { value: 0, previousValue: 0, changePercent: null } : metric;
  return {
    range: "7d",
    currentWindow: window,
    previousWindow,
    generatedAt: now.toISOString(),
    dataThrough: empty ? null : "2026-11-12",
    metrics: { clicks: value, impressions: value, ctr: value, position: value },
    daily: empty ? [] : [{ date: "2026-11-09", clicks: 1, impressions: 1, ctr: 1, position: 1 }],
    queries: [], pages: [], devices: [], countries: [],
  };
}

function service(options: {
  ga4?: {
    getReport: (range: AnalyticsRange, now?: Date) => Promise<Ga4Report>;
    probe: () => Promise<void>;
  };
  gsc?: {
    getReport: (range: AnalyticsRange, now?: Date) => Promise<SearchConsoleReport>;
    probe: () => Promise<void>;
  };
  config?: ReturnType<typeof configured>;
  logger?: (entry: unknown) => void;
} = {}) {
  return new AnalyticsOverviewService({
    config: options.config ?? configured(),
    ga4: options.ga4 ?? { getReport: vi.fn(async () => ga4Report()), probe: vi.fn(async () => undefined) },
    searchConsole: options.gsc ?? { getReport: vi.fn(async () => gscReport()), probe: vi.fn(async () => undefined) },
    cache: new SuccessCache(),
    logger: options.logger,
    requestId: () => "safe-request-id",
  });
}

describe("AnalyticsOverviewService", () => {
  it("returns two connected sources with their own freshness metadata", async () => {
    const overview = await service().getOverview("7d", now);

    expect(overview.ga4).toMatchObject({ state: { code: "CONNECTED" }, data: { dataThrough: "2026-11-15" } });
    expect(overview.searchConsole).toMatchObject({ state: { code: "CONNECTED" }, data: { dataThrough: "2026-11-12" } });
    expect(overview.generatedAt).toBe(now.toISOString());
  });

  it.each([
    ["ga4", "FORBIDDEN"],
    ["searchConsole", "TIMEOUT"],
  ] as const)("keeps the other source when %s fails with %s", async (failedSource, code) => {
    const logger = vi.fn();
    const ga4 = { getReport: vi.fn(async () => ga4Report()), probe: vi.fn() };
    const gsc = { getReport: vi.fn(async () => gscReport()), probe: vi.fn() };
    const failing = failedSource === "ga4" ? ga4 : gsc;
    failing.getReport.mockRejectedValueOnce(new GoogleIntegrationError(code, code === "FORBIDDEN" ? 403 : undefined));

    const overview = await service({ ga4, gsc, logger }).getOverview("7d", now);

    expect(overview[failedSource]).toMatchObject({ state: { code }, data: null });
    expect(overview[failedSource === "ga4" ? "searchConsole" : "ga4"].state.code).toBe("CONNECTED");
    expect(logger).toHaveBeenCalledWith({
      source: failedSource,
      code,
      upstreamStatus: code === "FORBIDDEN" ? 403 : undefined,
      requestId: "safe-request-id",
    });
    expect(JSON.stringify(logger.mock.calls)).not.toContain("private");
  });

  it("reports both sources as unconfigured without calling adapters", async () => {
    const ga4 = { getReport: vi.fn(), probe: vi.fn() };
    const gsc = { getReport: vi.fn(), probe: vi.fn() };
    const config = readGoogleIntegrationConfig({ ...process.env,
      NEXT_PUBLIC_GA4_MEASUREMENT_ID: undefined,
      GOOGLE_ANALYTICS_PROPERTY_ID: undefined,
      GOOGLE_SEARCH_CONSOLE_SITE_URL: undefined,
      GOOGLE_SERVICE_ACCOUNT_EMAIL: undefined,
      GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: undefined,
    });

    const overview = await service({ ga4, gsc, config }).getOverview("7d", now);

    expect(overview.ga4.state.code).toBe("NOT_CONFIGURED");
    expect(overview.searchConsole.state.code).toBe("NOT_CONFIGURED");
    expect(ga4.getReport).not.toHaveBeenCalled();
    expect(gsc.getReport).not.toHaveBeenCalled();
  });

  it("returns successful empty reports as NO_DATA rather than an upstream error", async () => {
    const overview = await service({
      ga4: { getReport: vi.fn(async () => ga4Report(true)), probe: vi.fn() },
      gsc: { getReport: vi.fn(async () => gscReport(true)), probe: vi.fn() },
    }).getOverview("7d", now);

    expect(overview.ga4).toMatchObject({ state: { code: "NO_DATA" }, data: { daily: [] } });
    expect(overview.searchConsole).toMatchObject({ state: { code: "NO_DATA" }, data: { dataThrough: null } });
  });

  it("uses lightweight probes for connection status", async () => {
    const ga4 = { getReport: vi.fn(), probe: vi.fn(async () => undefined) };
    const gsc = { getReport: vi.fn(), probe: vi.fn(async () => undefined) };

    const status = await service({ ga4, gsc }).getStatus(now);

    expect(status.ga4.code).toBe("CONNECTED");
    expect(status.searchConsole.code).toBe("CONNECTED");
    expect(ga4.probe).toHaveBeenCalledOnce();
    expect(gsc.probe).toHaveBeenCalledOnce();
  });
});
