import { describe, expect, it, vi } from "vitest";

import { GoogleIntegrationError, requestGoogleJson } from "@/lib/analytics/google-http";

const tokenProvider = { getAccessToken: vi.fn(async () => "sensitive-access-token") };

function response(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("requestGoogleJson", () => {
  it("adds a bearer token and returns parsed JSON", async () => {
    const fetcher = vi.fn(async () => response(200, { ok: true }));

    await expect(requestGoogleJson<{ ok: boolean }>({
      url: "https://google.example/report",
      method: "POST",
      body: { range: "7d" },
    }, { tokenProvider, fetcher })).resolves.toEqual({ ok: true });

    expect(fetcher).toHaveBeenCalledWith("https://google.example/report", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({
        authorization: "Bearer sensitive-access-token",
        "content-type": "application/json",
      }),
      body: JSON.stringify({ range: "7d" }),
    }));
  });

  it.each([
    [401, "UNAUTHORIZED"],
    [403, "FORBIDDEN"],
    [400, "UPSTREAM_UNAVAILABLE"],
  ] as const)("maps HTTP %s without retrying or leaking the response", async (status, code) => {
    const secretBody = "private upstream detail";
    const fetcher = vi.fn(async () => response(status, { error: secretBody }));

    const error = await requestGoogleJson({ url: "https://google.example/report" }, {
      tokenProvider,
      fetcher,
      sleep: async () => undefined,
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(GoogleIntegrationError);
    expect(error).toMatchObject({ code, upstreamStatus: status });
    expect(JSON.stringify(error)).not.toContain(secretBody);
    expect(JSON.stringify(error)).not.toContain("sensitive-access-token");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["network", new TypeError("socket closed")],
    ["rate limit", response(429, { error: "quota" })],
    ["server error", response(500, { error: "internal" })],
  ])("retries one %s failure and then succeeds", async (_label, firstFailure) => {
    const fetcher = vi.fn()
      .mockImplementationOnce(async () => {
        if (firstFailure instanceof Error) throw firstFailure;
        return firstFailure;
      })
      .mockResolvedValueOnce(response(200, { ok: true }));
    const sleep = vi.fn(async () => undefined);

    await expect(requestGoogleJson({ url: "https://google.example/report" }, {
      tokenProvider,
      fetcher,
      sleep,
    })).resolves.toEqual({ ok: true });

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledTimes(1);
  });

  it("reports RATE_LIMITED after one retry", async () => {
    const fetcher = vi.fn(async () => response(429, { error: "quota secret" }));

    const error = await requestGoogleJson({ url: "https://google.example/report" }, {
      tokenProvider,
      fetcher,
      sleep: async () => undefined,
    }).catch((caught: unknown) => caught);

    expect(error).toMatchObject({ code: "RATE_LIMITED", upstreamStatus: 429 });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("aborts requests that exceed the configured timeout", async () => {
    const fetcher = vi.fn((_url: string | URL | Request, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    }));

    const error = await requestGoogleJson({ url: "https://google.example/report" }, {
      tokenProvider,
      fetcher: fetcher as typeof fetch,
      timeoutMs: 5,
      sleep: async () => undefined,
    }).catch((caught: unknown) => caught);

    expect(error).toMatchObject({ code: "TIMEOUT" });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
