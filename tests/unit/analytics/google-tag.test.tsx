// @vitest-environment jsdom

import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/script", () => ({
  default: (props: { id: string; src: string }) => <div data-testid={props.id} data-src={props.src} />,
}));

import { ConsentAwareGoogleAnalytics } from "@/components/analytics/ConsentAwareGoogleAnalytics";

afterEach(() => {
  cleanup();
  delete window.gtag;
  delete window.dataLayer;
  delete (window as unknown as Record<string, unknown>)["ga-disable-G-TEST123"];
});

describe("ConsentAwareGoogleAnalytics", () => {
  it("initializes GA4 with its automatic page view disabled", async () => {
    window.gtag = vi.fn();

    render(<ConsentAwareGoogleAnalytics measurementId="G-TEST123" />);

    await waitFor(() => expect(window.gtag).toHaveBeenCalledWith(
      "config",
      "G-TEST123",
      { send_page_view: false },
    ));
    expect((window as unknown as Record<string, unknown>)["ga-disable-G-TEST123"]).toBe(false);
  });
});
