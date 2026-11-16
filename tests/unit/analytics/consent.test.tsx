// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ googleAnalytics: vi.fn() }));

vi.mock("@/components/analytics/ConsentAwareGoogleAnalytics", () => ({
  ConsentAwareGoogleAnalytics: (props: { measurementId: string }) => {
    mocks.googleAnalytics(props);
    return <div data-testid="google-analytics" data-ga-id={props.measurementId} />;
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/products",
  useSearchParams: () => new URLSearchParams(),
}));

import { AnalyticsConsentProvider } from "@/components/analytics/AnalyticsConsentProvider";
import { CookiePreferencesButton } from "@/components/analytics/CookiePreferencesButton";
import {
  ANALYTICS_CONSENT_COOKIE,
  readAnalyticsConsent,
} from "@/lib/analytics/consent";

function clearConsent() {
  document.cookie = `${ANALYTICS_CONSENT_COOKIE}=; Max-Age=0; Path=/`;
}

describe("AnalyticsConsentProvider", () => {
  beforeEach(() => {
    clearConsent();
    process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID = "G-TEST123";
    mocks.googleAnalytics.mockClear();
    delete window.gtag;
    delete window.dataLayer;
    document.cookie = "_ga=GA1.1.123.456; Path=/";
    document.cookie = "_ga_TEST123=GS1.1.123.1.0.0.0.0; Path=/";
  });

  afterEach(() => {
    cleanup();
    clearConsent();
    delete process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
    delete window.gtag;
    delete window.dataLayer;
    delete (window as unknown as Record<string, unknown>)["ga-disable-G-TEST123"];
  });

  it("does not mount Google before a choice and persists rejection", async () => {
    const user = userEvent.setup();
    render(<AnalyticsConsentProvider><p>Website</p></AnalyticsConsentProvider>);

    const dialog = screen.getByRole("dialog", { name: "Analytics cookie preferences" });
    expect(dialog).toBeInTheDocument();
    expect(screen.queryByTestId("google-analytics")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept analytics" })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Reject analytics" }));

    expect(readAnalyticsConsent()).toBe("rejected");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("google-analytics")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Analytics cookies rejected");
  });

  it("mounts Google only after acceptance and restores the persisted choice", async () => {
    const user = userEvent.setup();
    const view = render(<AnalyticsConsentProvider><p>Website</p></AnalyticsConsentProvider>);

    await user.click(screen.getByRole("button", { name: "Accept analytics" }));

    expect(readAnalyticsConsent()).toBe("accepted");
    expect(screen.getByTestId("google-analytics")).toHaveAttribute("data-ga-id", "G-TEST123");
    expect(screen.getByRole("status")).toHaveTextContent("Analytics cookies accepted");

    view.unmount();
    render(<AnalyticsConsentProvider><p>Website again</p></AnalyticsConsentProvider>);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("google-analytics")).toBeInTheDocument();
  });

  it("initializes the GA command queue immediately after consent is accepted", async () => {
    const user = userEvent.setup();
    render(<AnalyticsConsentProvider><p>Website</p></AnalyticsConsentProvider>);

    await user.click(screen.getByRole("button", { name: "Accept analytics" }));

    await waitFor(() => expect(typeof window.gtag).toBe("function"));
    expect(window.dataLayer?.every((command) => !Array.isArray(command))).toBe(true);
    const commands = window.dataLayer?.map((command) => Array.from(command as ArrayLike<unknown>));
    expect(commands).toEqual(expect.arrayContaining([
      ["config", "G-TEST123", { send_page_view: false }],
    ]));
  });

  it("keeps Google absent when the public Measurement ID is missing", async () => {
    delete process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
    const user = userEvent.setup();
    render(<AnalyticsConsentProvider><p>Website</p></AnalyticsConsentProvider>);

    await user.click(screen.getByRole("button", { name: "Accept analytics" }));

    expect(readAnalyticsConsent()).toBe("accepted");
    expect(screen.queryByTestId("google-analytics")).not.toBeInTheDocument();
  });

  it("reopens preferences from the footer without changing consent", async () => {
    const user = userEvent.setup();
    render(
      <AnalyticsConsentProvider>
        <CookiePreferencesButton />
      </AnalyticsConsentProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Reject analytics" }));

    await user.click(screen.getByRole("button", { name: "Cookie preferences" }));

    expect(readAnalyticsConsent()).toBe("rejected");
    expect(screen.getByRole("dialog", { name: "Analytics cookie preferences" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept analytics" })).toHaveFocus();
  });

  it("stops collection and clears Google Analytics cookies after accepted consent is withdrawn", async () => {
    const user = userEvent.setup();
    render(
      <AnalyticsConsentProvider>
        <CookiePreferencesButton />
      </AnalyticsConsentProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Accept analytics" }));
    expect((window as unknown as Record<string, unknown>)["ga-disable-G-TEST123"]).toBe(false);

    await user.click(screen.getByRole("button", { name: "Cookie preferences" }));
    await user.click(screen.getByRole("button", { name: "Reject analytics" }));

    expect((window as unknown as Record<string, unknown>)["ga-disable-G-TEST123"]).toBe(true);
    expect(document.cookie).not.toContain("_ga=");
    expect(document.cookie).not.toContain("_ga_TEST123=");
    expect(screen.queryByTestId("google-analytics")).not.toBeInTheDocument();
  });

  it("re-enables collection after accepted consent is withdrawn and accepted again", async () => {
    const user = userEvent.setup();
    render(
      <AnalyticsConsentProvider>
        <CookiePreferencesButton />
      </AnalyticsConsentProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Accept analytics" }));
    await user.click(screen.getByRole("button", { name: "Cookie preferences" }));
    await user.click(screen.getByRole("button", { name: "Reject analytics" }));
    await user.click(screen.getByRole("button", { name: "Cookie preferences" }));
    await user.click(screen.getByRole("button", { name: "Accept analytics" }));

    expect((window as unknown as Record<string, unknown>)["ga-disable-G-TEST123"]).toBe(false);
    expect(screen.getByTestId("google-analytics")).toBeInTheDocument();
  });

  it("uses only client document cookies", () => {
    const sources = [
      "lib/analytics/consent.ts",
      "components/analytics/AnalyticsConsentProvider.tsx",
    ].map((file) => readFileSync(resolve(process.cwd(), file), "utf8")).join("\n");

    expect(sources).not.toContain("next/headers");
    expect(sources).not.toContain("cookies()");
  });
});
