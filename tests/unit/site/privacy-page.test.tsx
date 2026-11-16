// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PrivacyPage, { metadata } from "@/app/(site)/privacy/page";
import { SiteFooter } from "@/components/SiteFooter";

describe("privacy notice", () => {
  it("publishes the analytics and consent information required by the production integration", () => {
    render(<PrivacyPage />);

    expect(metadata.title).toMatch(/Privacy/i);
    expect(screen.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeInTheDocument();
    expect(screen.getByText(/Google Analytics 4/i)).toBeInTheDocument();
    expect(screen.getByText(/only after you choose “Accept analytics”/i)).toBeInTheDocument();
    expect(screen.getByText(/Cookie preferences/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "privacy policy" })).toHaveAttribute("href", expect.stringContaining("policies.google.com"));
    expect(screen.getByText(/info@zyroncnc.com/i)).toBeInTheDocument();
  });

  it("links the site footer to the public privacy policy", () => {
    render(<SiteFooter />);

    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
  });
});
