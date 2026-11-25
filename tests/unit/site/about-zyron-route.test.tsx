// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PageDocument } from "@/lib/page-builder/schema";

const mocks = vi.hoisted(() => ({
  published: vi.fn<() => Promise<PageDocument | null>>(),
  seo: vi.fn(async (_path: string, fallback: unknown) => fallback),
}));

vi.mock("@/lib/repositories/page-repository", () => ({
  getPublishedPageBySlug: mocks.published,
}));
vi.mock("@/lib/repositories/seo-repository", () => ({
  overlayPublishedSeo: mocks.seo,
}));

import FactoryPage, { generateMetadata } from "@/app/(site)/factory/page";

afterEach(cleanup);

describe("About ZYRON public route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the upgraded default when no compatible published document exists", async () => {
    mocks.published.mockResolvedValue(null);
    const { container } = render(await FactoryPage());
    expect(screen.getByRole("heading", { level: 1, name: /Engineered for Precision/ })).toBeInTheDocument();
    const schema = [...container.querySelectorAll('script[type="application/ld+json"]')].map((node) => node.textContent).join(" ");
    expect(schema).toContain('"@type":"Organization"');
    expect(schema).toContain('"@type":"AboutPage"');
  });

  it("renders a compatible published About document instead of the default", async () => {
    mocks.published.mockResolvedValue({
      schemaVersion: 1,
      nodes: [{
        id: "published-about-hero",
        type: "ABOUT_HERO",
        content: {
          enabled: true,
          desktopImage: "/images/about/zyron-factory-exterior.webp",
          mobileImage: "/images/about/zyron-factory-exterior.webp",
          imageAlt: "Published ZYRON factory",
          eyebrow: "ABOUT ZYRON",
          titleLineOne: "Published About Heading",
          titleLineTwo: "Built for Production.",
          highlight: "Production.",
          description: "Published description",
          values: [{ title: "Published value" }],
          ctaLabel: "Explore",
          ctaHref: "/products",
          showCta: true,
          imagePosition: "right center",
          overlayOpacity: 96,
          showDiagonal: true,
          showMetalDecoration: true,
        },
      }],
    });
    render(await FactoryPage());
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Published About Heading");
    expect(screen.queryByText("Engineered for Precision.")).not.toBeInTheDocument();
  });

  it("provides canonical, indexable, social metadata for the new hero image", async () => {
    const metadata = await generateMetadata();
    expect(metadata.title).toBe("About ZYRON | Sheet Metal Machinery Manufacturer");
    expect(metadata.alternates).toEqual({ canonical: "/factory" });
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(JSON.stringify(metadata.openGraph)).toContain("zyron-factory-exterior.webp");
  });
});
