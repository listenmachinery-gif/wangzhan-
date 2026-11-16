// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearPendingFirstPartyAnalytics,
  enqueueFirstPartyEvent,
  flushFirstPartyAnalyticsEvents,
} from "@/lib/analytics/first-party/client";
import { trackAnalyticsEvent } from "@/lib/analytics/client-events";
import { ANALYTICS_CONSENT_COOKIE, writeAnalyticsConsent } from "@/lib/analytics/consent";

function clearConsent() {
  document.cookie = `${ANALYTICS_CONSENT_COOKIE}=; Max-Age=0; Path=/`;
}

describe("first-party analytics browser queue", () => {
  beforeEach(() => {
    clearConsent();
    clearPendingFirstPartyAnalytics();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    clearPendingFirstPartyAnalytics();
    clearConsent();
    vi.unstubAllGlobals();
  });

  it("does not enqueue or request anything before analytics consent", async () => {
    expect(enqueueFirstPartyEvent({ kind: "page_view", pageViewId: "page_1", path: "/" })).toBe(false);
    await expect(flushFirstPartyAnalyticsEvents()).resolves.toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("keeps stable event IDs across a failed request and retry", async () => {
    writeAnalyticsConsent("accepted");
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: 1, duplicates: 0 }), { status: 202 }));

    expect(enqueueFirstPartyEvent({
      kind: "page_view",
      pageViewId: "page_1",
      path: "/products?utm_source=google",
      occurredAt: "2026-11-16T08:00:00.000Z",
    })).toBe(true);

    await expect(flushFirstPartyAnalyticsEvents()).resolves.toBe(false);
    await expect(flushFirstPartyAnalyticsEvents()).resolves.toBe(true);

    const firstBody = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body));
    const secondBody = JSON.parse(String(vi.mocked(fetch).mock.calls[1][1]?.body));
    expect(firstBody.events[0].eventId).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(secondBody.events[0].eventId).toBe(firstBody.events[0].eventId);
    expect(secondBody.events[0].occurredAt).toBe("2026-11-16T08:00:00.000Z");
  });

  it("stops and clears queued data when consent is withdrawn", async () => {
    writeAnalyticsConsent("accepted");
    enqueueFirstPartyEvent({ kind: "page_view", pageViewId: "page_1", path: "/" });

    writeAnalyticsConsent("rejected");
    await expect(flushFirstPartyAnalyticsEvents()).resolves.toBe(false);

    writeAnalyticsConsent("accepted");
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 202 }));
    await expect(flushFirstPartyAnalyticsEvents()).resolves.toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("uses sendBeacon for a final page-exit flush without changing event identity", () => {
    writeAnalyticsConsent("accepted");
    const sendBeacon = vi.fn((...args: [string | URL, BodyInit?]) => {
      void args;
      return true;
    });
    Object.defineProperty(navigator, "sendBeacon", { configurable: true, value: sendBeacon });
    enqueueFirstPartyEvent({
      kind: "page_exit",
      pageViewId: "page_1",
      path: "/products",
      activeSeconds: 42,
      occurredAt: "2026-11-16T08:00:42.000Z",
    });

    expect(flushFirstPartyAnalyticsEvents({ beacon: true })).toBe(true);
    const body = sendBeacon.mock.calls[0][1];
    expect(body).toBeInstanceOf(Blob);
  });

  it("bridges an allowlisted GA conversion into a PII-free first-party event", async () => {
    writeAnalyticsConsent("accepted");
    window.gtag = vi.fn();
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 202 }));

    expect(trackAnalyticsEvent("inquiry_submit", {
      form_id: "general-inquiry",
      product_slug: "small-electric-shearing-machine",
    })).toBe(true);
    await flushFirstPartyAnalyticsEvents();

    const requestBody = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body));
    expect(requestBody.events).toEqual([
      expect.objectContaining({
        kind: "event",
        eventType: "INQUIRY_SUBMIT",
        productSlug: "small-electric-shearing-machine",
        properties: { form_kind: "general-inquiry" },
      }),
    ]);
    expect(JSON.stringify(requestBody)).not.toContain("email");
    delete window.gtag;
  });
});
