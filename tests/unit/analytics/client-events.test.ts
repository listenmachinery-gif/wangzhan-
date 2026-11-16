// @vitest-environment jsdom

import { cleanup, render, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const route = vi.hoisted(() => ({ pathname: "/products", search: "" }));

vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
  useSearchParams: () => new URLSearchParams(route.search),
}));

import { RoutePageView } from "@/components/analytics/RoutePageView";
import {
  trackAnalyticsEvent,
} from "@/lib/analytics/client-events";
import {
  ANALYTICS_CONSENT_COOKIE,
  writeAnalyticsConsent,
} from "@/lib/analytics/consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function clearConsent() {
  document.cookie = `${ANALYTICS_CONSENT_COOKIE}=; Max-Age=0; Path=/`;
}

describe("client analytics events", () => {
  beforeEach(() => {
    clearConsent();
    route.pathname = "/products";
    route.search = "";
    window.gtag = vi.fn();
  });

  afterEach(() => {
    cleanup();
    clearConsent();
    delete window.gtag;
  });

  it("no-ops without consent or before the Google tag is ready", () => {
    expect(trackAnalyticsEvent("inquiry_start", { form_id: "contact" })).toBe(false);
    expect(window.gtag).not.toHaveBeenCalled();

    writeAnalyticsConsent("accepted");
    delete window.gtag;
    expect(trackAnalyticsEvent("inquiry_start", { form_id: "contact" })).toBe(false);
  });

  it("sends only allow-listed event parameters", () => {
    writeAnalyticsConsent("accepted");

    expect(trackAnalyticsEvent("inquiry_start", { form_id: "contact", product_slug: "small-electric-shear" })).toBe(true);
    expect(window.gtag).toHaveBeenCalledWith("event", "inquiry_start", {
      form_id: "contact",
      product_slug: "small-electric-shear",
    });

    expect(trackAnalyticsEvent("product_view", {
      product_slug: "small-electric-shear",
      product_name: "Small Electric Shearing Machine",
      product_category: "Shearing Machine",
    })).toBe(true);
  });

  it.each(["email", "phone", "message", "lead_id", "session_id"])("rejects the unsafe runtime key %s", (key) => {
    writeAnalyticsConsent("accepted");
    const params = { form_id: "contact", [key]: "private-value" };

    expect(trackAnalyticsEvent("inquiry_start", params as never)).toBe(false);
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it("manually emits one sanitized page view for the first accepted URL and each later URL", async () => {
    writeAnalyticsConsent("accepted");
    const view = render(createElement(RoutePageView));
    await waitFor(() => expect(window.gtag).toHaveBeenCalledTimes(1));
    expect(window.gtag).toHaveBeenLastCalledWith("event", "page_view", {
      page_path: "/products",
      page_location: "http://localhost:3000/products",
    });

    route.pathname = "/products/small-electric-shear";
    view.rerender(createElement(RoutePageView));
    await waitFor(() => expect(window.gtag).toHaveBeenCalledTimes(2));
    expect(window.gtag).toHaveBeenLastCalledWith("event", "page_view", {
      page_path: "/products/small-electric-shear",
      page_location: "http://localhost:3000/products/small-electric-shear",
    });

    view.rerender(createElement(RoutePageView));
    expect(window.gtag).toHaveBeenCalledTimes(2);

    route.search = "utm_source=google";
    view.rerender(createElement(RoutePageView));
    await waitFor(() => expect(window.gtag).toHaveBeenCalledTimes(3));
    expect(window.gtag).toHaveBeenLastCalledWith("event", "page_view", {
      page_path: "/products/small-electric-shear?utm_source=google",
      page_location: "http://localhost:3000/products/small-electric-shear?utm_source=google",
    });
  });

  it("never emits a route view after rejection", () => {
    writeAnalyticsConsent("rejected");
    const view = render(createElement(RoutePageView));
    route.pathname = "/contact";
    view.rerender(createElement(RoutePageView));

    expect(window.gtag).not.toHaveBeenCalled();
  });

  it("allows only marketing parameters and removes sensitive names and PII-shaped values", async () => {
    writeAnalyticsConsent("accepted");
    route.search = "utm_source=google";
    const view = render(createElement(RoutePageView));
    route.pathname = "/contact";
    route.search = "email=buyer%40example.com&utm_source=buyer%40example.com&utm_medium=cpc&name=Alice&source=footer";
    view.rerender(createElement(RoutePageView));

    await waitFor(() => expect(window.gtag).toHaveBeenCalledTimes(2));
    expect(window.gtag).toHaveBeenLastCalledWith("event", "page_view", {
      page_path: "/contact?utm_medium=cpc",
      page_location: "http://localhost:3000/contact?utm_medium=cpc",
    });
  });
});
