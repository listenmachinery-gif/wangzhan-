// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Link from "next/link";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ContactClickTracker } from "@/components/analytics/ContactClickTracker";
import { ProductViewTracker } from "@/components/analytics/ProductViewTracker";
import { CompanyInquiryForm } from "@/components/company/CompanyInquiryForm";
import { InquiryForm } from "@/components/InquiryForm";
import SmallElectricShearSelector from "@/components/SmallElectricShearSelector";
import type { ProductCategory } from "@/data/products";
import { ANALYTICS_CONSENT_COOKIE, ANALYTICS_TAG_READY_EVENT, writeAnalyticsConsent } from "@/lib/analytics/consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const category: ProductCategory = {
  id: "shearing-machines",
  name: "Shearing Machines",
  navLabel: "Shearing Machines",
  summary: "",
  description: "",
  image: "/product.png",
  heroImage: "/hero.png",
  capability: "Cutting",
};

function eventCalls(name: string) {
  return vi.mocked(window.gtag!).mock.calls.filter((call) => call[0] === "event" && call[1] === name);
}

function allEventCalls() {
  return vi.mocked(window.gtag!).mock.calls;
}

describe("public conversion analytics", () => {
  beforeEach(() => {
    document.cookie = `${ANALYTICS_CONSENT_COOKIE}=; Max-Age=0; Path=/`;
    window.gtag = vi.fn();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    document.cookie = `${ANALYTICS_CONSENT_COOKIE}=; Max-Age=0; Path=/`;
    delete window.gtag;
  });

  it("tracks database and legacy products once without waiting for a second render", async () => {
    writeAnalyticsConsent("accepted");
    const database = render(
      <ProductViewTracker
        productId="product-uuid"
        productSlug="compact-electric-shearing-machine"
        productName="Small Electric Shearing Machine"
        productCategory="Shearing Machines"
      />,
    );
    await waitFor(() => expect(eventCalls("product_view")).toHaveLength(1));
    database.rerender(
      <ProductViewTracker
        productId="product-uuid"
        productSlug="compact-electric-shearing-machine"
        productName="Small Electric Shearing Machine"
        productCategory="Shearing Machines"
      />,
    );
    expect(eventCalls("product_view")).toHaveLength(1);
    database.unmount();

    render(
      <ProductViewTracker
        productSlug="foot-shear"
        productName="Foot Shear"
        productCategory="Shearing Machines"
      />,
    );
    await waitFor(() => expect(eventCalls("product_view")).toHaveLength(2));
    expect(eventCalls("product_view")[1][2]).toEqual({
      product_slug: "foot-shear",
      product_name: "Foot Shear",
      product_category: "Shearing Machines",
    });
  });

  it("tracks an already-mounted product once when consent is accepted later", async () => {
    render(
      <ProductViewTracker
        productSlug="compact-electric-shearing-machine"
        productName="Small Electric Shearing Machine"
        productCategory="Shearing Machines"
      />,
    );
    expect(eventCalls("product_view")).toHaveLength(0);

    writeAnalyticsConsent("accepted");

    await waitFor(() => expect(eventCalls("product_view")).toHaveLength(1));
    writeAnalyticsConsent("accepted");
    expect(eventCalls("product_view")).toHaveLength(1);
  });

  it("waits for a late Google tag without losing the accepted product view", async () => {
    delete window.gtag;
    render(
      <ProductViewTracker
        productSlug="compact-electric-shearing-machine"
        productName="Small Electric Shearing Machine"
        productCategory="Shearing Machines"
      />,
    );
    writeAnalyticsConsent("accepted");

    window.gtag = vi.fn();
    window.dispatchEvent(new Event(ANALYTICS_TAG_READY_EVENT));

    await waitFor(() => expect(eventCalls("product_view")).toHaveLength(1));
  });

  it("tracks inquiry start once and submit only after a successful API response", async () => {
    writeAnalyticsConsent("accepted");
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ message: "Received" }) } as Response);
    const user = userEvent.setup();
    render(<InquiryForm productCategories={[category]} />);

    await user.type(screen.getByLabelText("Name"), "Private Buyer");
    await user.type(screen.getByLabelText("Email"), "buyer@example.com");
    await user.type(screen.getByLabelText("Production Requirement"), "Private requirement");
    expect(eventCalls("inquiry_start")).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: /Send Inquiry/ }));

    await screen.findByText("Received");
    expect(eventCalls("inquiry_submit")).toHaveLength(1);
    expect(eventCalls("inquiry_submit")[0][2]).toEqual({ form_id: "general-inquiry" });
    expect(JSON.stringify(allEventCalls())).not.toContain("Private Buyer");
    expect(JSON.stringify(allEventCalls())).not.toContain("buyer@example.com");
    expect(JSON.stringify(allEventCalls())).not.toContain("Private requirement");
  });

  it("does not count failed or honeypot submissions", async () => {
    writeAnalyticsConsent("accepted");
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ message: "Received" }) } as Response);
    const user = userEvent.setup();
    const view = render(<CompanyInquiryForm productOptions={[{ value: "shear", label: "Shear" }]} />);
    await user.type(screen.getByLabelText(/^Name/), "Robot Buyer");
    await user.type(screen.getByLabelText(/^Email/), "robot@example.com");
    await user.type(screen.getByLabelText(/^Message/), "Automated message");
    fireEvent.change(view.container.querySelector('input[name="website"]')!, { target: { value: "https://spam.example" } });
    await user.click(screen.getByRole("button", { name: /Send Engineering Inquiry/ }));
    await screen.findByText("Received");
    expect(eventCalls("inquiry_submit")).toHaveLength(0);
    view.unmount();

    vi.mocked(fetch).mockResolvedValue({ ok: false, json: async () => ({ message: "Unavailable" }) } as Response);
    render(<CompanyInquiryForm productOptions={[{ value: "shear", label: "Shear" }]} />);
    await user.type(screen.getByLabelText(/^Name/), "Real Buyer");
    await user.type(screen.getByLabelText(/^Email/), "real@example.com");
    await user.type(screen.getByLabelText(/^Message/), "Real message");
    await user.click(screen.getByRole("button", { name: /Send Engineering Inquiry/ }));
    await screen.findByText(/Direct delivery is currently unavailable/);
    expect(eventCalls("inquiry_submit")).toHaveLength(0);
  });

  it("tracks selector start and successful submit without selection or contact values", async () => {
    writeAnalyticsConsent("accepted");
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ message: "Selector received" }) } as Response);
    const user = userEvent.setup();
    render(<SmallElectricShearSelector />);

    await user.type(screen.getByLabelText(/^Cutting Thickness/), "1.5");
    await user.type(screen.getByLabelText(/^Cutting Width/), "1300");
    await user.type(screen.getByLabelText("Email"), "selector@example.com");
    await user.click(screen.getByRole("button", { name: /Send Inquiry/ }));

    await screen.findByText("Selector received");
    expect(eventCalls("inquiry_start")).toHaveLength(1);
    expect(eventCalls("inquiry_submit")).toHaveLength(1);
    expect(eventCalls("inquiry_submit")[0][2]).toEqual({
      form_id: "small-electric-shear-selector",
      product_slug: "compact-electric-shearing-machine",
    });
    expect(JSON.stringify(allEventCalls())).not.toContain("selector@example.com");
    expect(JSON.stringify(allEventCalls())).not.toContain("1300");
  });

  it("delegates contact and explicit download clicks but ignores fake catalog navigation", async () => {
    writeAnalyticsConsent("accepted");
    const user = userEvent.setup();
    render(
      <>
        <ContactClickTracker />
        <a href="mailto:private@example.com">Email sales</a>
        <a href="https://wa.me/8615655537083">WhatsApp sales</a>
        <Link href="/products">Download Catalog</Link>
        <a href="/catalogs/zyron.pdf" data-analytics-download="ZYRON product catalog">Real catalog</a>
      </>,
    );

    await user.click(screen.getByRole("link", { name: "Email sales" }));
    await user.click(screen.getByRole("link", { name: "WhatsApp sales" }));
    await user.click(screen.getByRole("link", { name: "Download Catalog" }));
    await user.click(screen.getByRole("link", { name: "Real catalog" }));

    expect(eventCalls("email_click")).toHaveLength(1);
    expect(eventCalls("email_click")[0][2]).toEqual({ link_path: "mailto" });
    expect(eventCalls("whatsapp_click")).toHaveLength(1);
    expect(eventCalls("whatsapp_click")[0][2]).toEqual({ link_path: "whatsapp" });
    expect(eventCalls("catalog_download")).toHaveLength(1);
    expect(eventCalls("catalog_download")[0][2]).toEqual({
      asset_name: "ZYRON product catalog",
      asset_path: "/catalogs/zyron.pdf",
    });
    expect(JSON.stringify(allEventCalls())).not.toContain("private@example.com");
    expect(JSON.stringify(allEventCalls())).not.toContain("8615655537083");
  });
});
