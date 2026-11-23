// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HomeContactSection } from "@/components/site/home/HomeContactSection";
import { homepageRedesignDocument } from "@/lib/page-builder/default-homepage";

const content = homepageRedesignDocument.nodes[5].content as React.ComponentProps<typeof HomeContactSection>["content"];

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ message: "Inquiry received" }),
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("HomeContactSection", () => {
  it("scrolls to the real form and focuses the first required field", async () => {
    const user = userEvent.setup();
    render(<HomeContactSection content={content} />);

    await user.click(screen.getByRole("button", { name: "Request a Quote" }));
    expect(screen.getByLabelText("Your Name *")).toHaveFocus();
  });

  it("submits the homepage fields through the existing inquiry API once", async () => {
    const user = userEvent.setup();
    render(<HomeContactSection content={content} />);

    await user.type(screen.getByLabelText("Your Name *"), "Metal Buyer");
    await user.type(screen.getByLabelText("Business Email *"), "buyer@example.com");
    await user.selectOptions(screen.getByLabelText("Machine Interest *"), "PRESS BRAKES");
    await user.type(screen.getByLabelText("Your Requirements *"), "2 mm stainless steel, 3200 mm working length.");
    await user.click(screen.getByRole("button", { name: "Send Inquiry →" }));

    await screen.findByText("Inquiry received");
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(JSON.parse(String(init?.body))).toMatchObject({
      name: "Metal Buyer",
      email: "buyer@example.com",
      productInterest: "PRESS BRAKES",
    });
  });
});
