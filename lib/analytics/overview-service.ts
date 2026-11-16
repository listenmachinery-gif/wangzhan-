import "server-only";

import { randomUUID } from "node:crypto";

import { readGoogleIntegrationConfig, type GoogleConfigSection, type GoogleIntegrationConfig } from "@/lib/analytics/config";
import { getCompletedDateWindows } from "@/lib/analytics/date-ranges";
import { Ga4ReportingService } from "@/lib/analytics/ga4-reporting";
import { createGoogleAccessTokenProvider } from "@/lib/analytics/google-auth";
import { GoogleIntegrationError, requestGoogleJson, type GoogleJsonClient } from "@/lib/analytics/google-http";
import { SearchConsoleReportingService } from "@/lib/analytics/search-console-reporting";
import { SuccessCache } from "@/lib/analytics/success-cache";
import type {
  AnalyticsConnectionOverview,
  AnalyticsOverview,
  AnalyticsRange,
  AnalyticsSourceResult,
  Ga4Report,
  IntegrationErrorCode,
  IntegrationSourceState,
  SearchConsoleReport,
} from "@/lib/analytics/types";

type ReportSource<T> = {
  getReport(range: AnalyticsRange, now?: Date): Promise<T>;
  probe(): Promise<void>;
};

type SafeLogEntry = {
  source: "ga4" | "searchConsole";
  code: IntegrationErrorCode;
  upstreamStatus?: number;
  requestId: string;
};

type AnalyticsOverviewDependencies = {
  config?: GoogleIntegrationConfig;
  ga4?: ReportSource<Ga4Report>;
  searchConsole?: ReportSource<SearchConsoleReport>;
  cache?: SuccessCache;
  logger?: (entry: SafeLogEntry) => void;
  requestId?: () => string;
};

const sharedCache = new SuccessCache();

const stateMessages: Record<IntegrationSourceState["code"], string> = {
  CONNECTED: "已连接",
  NOT_CONFIGURED: "尚未配置",
  INVALID_CONFIG: "配置无效",
  UNAUTHORIZED: "Google 身份认证失败",
  FORBIDDEN: "Google 资源访问权限不足",
  RATE_LIMITED: "Google API 请求频率受限",
  TIMEOUT: "Google API 请求超时",
  UPSTREAM_UNAVAILABLE: "Google 服务暂时不可用",
  NO_DATA: "已连接，所选日期暂无数据",
};

function sourceState(code: IntegrationSourceState["code"], checkedAt: Date): IntegrationSourceState {
  return { code, message: stateMessages[code], checkedAt: checkedAt.toISOString() };
}

function configurationCode(
  source: GoogleConfigSection<unknown>,
  credentials: GoogleConfigSection<unknown>,
): "NOT_CONFIGURED" | "INVALID_CONFIG" | null {
  if (source.state === "invalid" || credentials.state === "invalid") return "INVALID_CONFIG";
  if (source.state === "not_configured" || credentials.state === "not_configured") return "NOT_CONFIGURED";
  return null;
}

function ga4IsEmpty(report: Ga4Report) {
  return Object.values(report.metrics).every(({ value }) => value === 0)
    && report.daily.length === 0
    && Object.values(report.events).every((value) => value === 0);
}

function searchConsoleIsEmpty(report: SearchConsoleReport) {
  return report.metrics.clicks.value === 0
    && report.metrics.impressions.value === 0
    && report.daily.length === 0;
}

export class AnalyticsOverviewService {
  private readonly config: GoogleIntegrationConfig;
  private readonly ga4?: ReportSource<Ga4Report>;
  private readonly searchConsole?: ReportSource<SearchConsoleReport>;
  private readonly cache: SuccessCache;
  private readonly logger: (entry: SafeLogEntry) => void;
  private readonly requestId: () => string;

  constructor(dependencies: AnalyticsOverviewDependencies = {}) {
    this.config = dependencies.config ?? readGoogleIntegrationConfig();
    this.cache = dependencies.cache ?? sharedCache;
    this.logger = dependencies.logger ?? ((entry) => console.error("Google reporting source failure", entry));
    this.requestId = dependencies.requestId ?? randomUUID;

    let client: GoogleJsonClient | undefined;
    if (this.config.credentials.state === "configured") {
      const tokenProvider = createGoogleAccessTokenProvider(this.config.credentials.value);
      client = (request) => requestGoogleJson(request, { tokenProvider });
    }

    this.ga4 = dependencies.ga4 ?? (
      client && this.config.ga4.state === "configured"
        ? new Ga4ReportingService(this.config.ga4.value.propertyId, client)
        : undefined
    );
    this.searchConsole = dependencies.searchConsole ?? (
      client && this.config.searchConsole.state === "configured"
        ? new SearchConsoleReportingService(this.config.searchConsole.value.siteUrl, client)
        : undefined
    );
  }

  private safeError(source: SafeLogEntry["source"], error: unknown, now: Date) {
    const code = error instanceof GoogleIntegrationError ? error.code : "UPSTREAM_UNAVAILABLE";
    const upstreamStatus = error instanceof GoogleIntegrationError ? error.upstreamStatus : undefined;
    this.logger({ source, code, upstreamStatus, requestId: this.requestId() });
    return sourceState(code, now);
  }

  private async reportSource<T>(options: {
    source: SafeLogEntry["source"];
    config: GoogleConfigSection<unknown>;
    adapter?: ReportSource<T>;
    range: AnalyticsRange;
    now: Date;
    cacheKey: string;
    isEmpty: (report: T) => boolean;
  }): Promise<AnalyticsSourceResult<T>> {
    const configCode = configurationCode(options.config, this.config.credentials);
    if (configCode || !options.adapter) {
      return { state: sourceState(configCode ?? "INVALID_CONFIG", options.now), data: null };
    }

    try {
      const data = await this.cache.getOrLoad(
        options.cacheKey,
        () => options.adapter!.getReport(options.range, options.now),
        options.now,
      );
      return {
        state: sourceState(options.isEmpty(data) ? "NO_DATA" : "CONNECTED", options.now),
        data,
      };
    } catch (error) {
      return { state: this.safeError(options.source, error, options.now), data: null };
    }
  }

  async getOverview(range: AnalyticsRange, now = new Date()): Promise<AnalyticsOverview> {
    const gaWindow = getCompletedDateWindows(range, now, "Asia/Shanghai").current;
    const searchWindow = getCompletedDateWindows(range, now, "America/Los_Angeles").current;
    const [ga4, searchConsole] = await Promise.all([
      this.reportSource({
        source: "ga4",
        config: this.config.ga4,
        adapter: this.ga4,
        range,
        now,
        cacheKey: `ga4:${range}:${gaWindow.endDate}`,
        isEmpty: ga4IsEmpty,
      }),
      this.reportSource({
        source: "searchConsole",
        config: this.config.searchConsole,
        adapter: this.searchConsole,
        range,
        now,
        cacheKey: `searchConsole:${range}:${searchWindow.endDate}`,
        isEmpty: searchConsoleIsEmpty,
      }),
    ]);
    return { range, generatedAt: now.toISOString(), ga4, searchConsole };
  }

  private async probeSource(options: {
    source: SafeLogEntry["source"];
    config: GoogleConfigSection<unknown>;
    adapter?: ReportSource<unknown>;
    now: Date;
  }) {
    const configCode = configurationCode(options.config, this.config.credentials);
    if (configCode || !options.adapter) return sourceState(configCode ?? "INVALID_CONFIG", options.now);
    try {
      await this.cache.getOrLoad(
        `status:${options.source}`,
        async () => {
          await options.adapter!.probe();
          return true;
        },
        options.now,
      );
      return sourceState("CONNECTED", options.now);
    } catch (error) {
      return this.safeError(options.source, error, options.now);
    }
  }

  async getStatus(now = new Date()): Promise<AnalyticsConnectionOverview> {
    const [ga4, searchConsole] = await Promise.all([
      this.probeSource({ source: "ga4", config: this.config.ga4, adapter: this.ga4, now }),
      this.probeSource({ source: "searchConsole", config: this.config.searchConsole, adapter: this.searchConsole, now }),
    ]);
    return { generatedAt: now.toISOString(), ga4, searchConsole };
  }
}
