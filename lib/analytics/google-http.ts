import "server-only";

import type { AccessTokenProvider } from "@/lib/analytics/google-auth";
import type { IntegrationErrorCode } from "@/lib/analytics/types";

export type GoogleJsonRequest = {
  url: string;
  method?: "GET" | "POST";
  body?: unknown;
};

export type GoogleJsonClient = (request: GoogleJsonRequest) => Promise<unknown>;

export type GoogleHttpDependencies = {
  tokenProvider: AccessTokenProvider;
  fetcher?: typeof fetch;
  sleep?: (milliseconds: number) => Promise<void>;
  timeoutMs?: number;
};

export class GoogleIntegrationError extends Error {
  constructor(
    public readonly code: IntegrationErrorCode,
    public readonly upstreamStatus?: number,
  ) {
    super(`Google reporting request failed: ${code}`);
    this.name = "GoogleIntegrationError";
  }

  toJSON() {
    return { name: this.name, code: this.code, upstreamStatus: this.upstreamStatus };
  }
}

function errorCode(status: number): IntegrationErrorCode {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 429) return "RATE_LIMITED";
  return "UPSTREAM_UNAVAILABLE";
}

function retryableStatus(status: number) {
  return status === 429 || status >= 500;
}

function abortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

export async function requestGoogleJson<T>(
  request: GoogleJsonRequest,
  dependencies: GoogleHttpDependencies,
): Promise<T> {
  const fetcher = dependencies.fetcher ?? fetch;
  const sleep = dependencies.sleep ?? ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)));
  const timeoutMs = dependencies.timeoutMs ?? 8_000;
  const accessToken = await dependencies.tokenProvider.getAccessToken();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const result = await fetcher(request.url, {
        method: request.method ?? (request.body === undefined ? "GET" : "POST"),
        headers: {
          accept: "application/json",
          authorization: `Bearer ${accessToken}`,
          ...(request.body === undefined ? {} : { "content-type": "application/json" }),
        },
        ...(request.body === undefined ? {} : { body: JSON.stringify(request.body) }),
        signal: controller.signal,
      });

      if (result.ok) return await result.json() as T;

      const code = errorCode(result.status);
      if (attempt === 0 && retryableStatus(result.status)) {
        await sleep(100);
        continue;
      }
      throw new GoogleIntegrationError(code, result.status);
    } catch (error) {
      if (error instanceof GoogleIntegrationError) throw error;
      const code: IntegrationErrorCode = abortError(error) ? "TIMEOUT" : "UPSTREAM_UNAVAILABLE";
      if (attempt === 0) {
        await sleep(100);
        continue;
      }
      throw new GoogleIntegrationError(code);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new GoogleIntegrationError("UPSTREAM_UNAVAILABLE");
}
