// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PublishedShippingHighlight } from "@/lib/repositories/shipping-highlight-repository";

const mocks = vi.hoisted(() => ({
  list: vi.fn(), get: vi.fn(), latest: vi.fn(), categories: vi.fn(), notFound: vi.fn(() => { throw new Error("404"); }),
}));

vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("@/lib/repositories/shipping-highlight-repository", () => ({
  listPublishedShippingHighlights: mocks.list,
  getPublishedShippingHighlightBySlug: mocks.get,
  listLatestPublishedShippingHighlights: mocks.latest,
}));
vi.mock("@/lib/repositories/category-repository", () => ({ listPublishedCategories: mocks.categories }));

import ShippingHighlightsPage from "@/app/(site)/shipping-highlights/page";
import ShippingHighlightDetailPage, { generateMetadata } from "@/app/(site)/shipping-highlights/[slug]/page";
import { LatestShippingHighlights } from "@/components/site/LatestShippingHighlights";
import { ShippingHighlightGallery } from "@/components/shipping/ShippingHighlightGallery";

const highlight: PublishedShippingHighlight = {
  id: "shipping-1",
  slug: "germany-electric-shears",
  publishedAt: new Date("2026-11-17T00:00:00.000Z"),
  updatedAt: new Date("2026-11-17T01:00:00.000Z"),
  shipmentDate: new Date("2026-11-16T00:00:00.000Z"),
  countryCode: "DE",
  categorySlug: "shearing-machines",
  document: {
    title: "Three electric shearing machines shipped to Germany",
    summary: "ZYRON completed inspection, export packing, and container loading for a German customer.",
    shipmentDate: "2026-11-16",
    countryCode: "DE",
    city: "Hamburg",
    categoryId: "category-1",
    categorySlug: "shearing-machines",
    productId: "product-1",
    productSlug: "electric-shear",
    equipmentName: "Electric Shearing Machine",
    modelName: "Q11-3x1300",
    quantity: 3,
    containerMethod: "20GP",
    transportMode: "Sea freight",
    packagingMethod: "Export wooden case",
    body: [{ type: "HEADING", text: "Inspection and loading" }, { type: "PARAGRAPH", text: "Every machine passed final inspection." }],
    coverMediaId: "cover-1",
    media: [
      { id: "cover-link", mediaAssetId: "cover-1", role: "COVER", position: 0, caption: "Loading", altText: "Electric shearing machines ready for shipment" },
      { id: "video-link", mediaAssetId: "video-1", role: "VIDEO", position: 1, caption: "Loading video", altText: "Loading electric shearing machines into a container" },
    ],
    seoTitle: "Electric Shearing Machines Shipped to Germany | ZYRON",
    seoDescription: "See how ZYRON inspected, packed, and loaded three electric shearing machines for sea delivery to a sheet-metal customer in Hamburg, Germany.",
  },
};

describe("public shipping highlight pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.list.mockResolvedValue({ items: [highlight], nextCursor: null });
    mocks.get.mockResolvedValue(highlight);
    mocks.latest.mockResolvedValue([highlight]);
    mocks.categories.mockResolvedValue([{ slug: "shearing-machines", name: "Shearing Machines", products: [] }]);
  });
  afterEach(cleanup);

  it("renders validated list filters with English and Chinese country names", async () => {
    render(await ShippingHighlightsPage({ searchParams: Promise.resolve({ country: "DE", category: "shearing-machines", sort: "oldest" }) }));

    expect(mocks.list).toHaveBeenCalledWith({ countryCode: "DE", categorySlug: "shearing-machines", sort: "oldest" });
    expect(screen.getByRole("heading", { level: 1, name: /Shipping Highlights/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Germany/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/德国/).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Three electric shearing machines/i })).toHaveAttribute("href", "/shipping-highlights/germany-electric-shears");
  });

  it("renders an honest empty state without placeholder shipment cards", async () => {
    mocks.list.mockResolvedValue({ items: [], nextCursor: null });
    render(await ShippingHighlightsPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText(/No shipping highlights match/i)).toBeInTheDocument();
    expect(screen.queryByText(highlight.document.title)).not.toBeInTheDocument();
  });

  it("renders detail media, body, product/article/breadcrumb schemas, and canonical metadata", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: highlight.slug }) });
    expect(metadata.alternates).toEqual({ canonical: `/shipping-highlights/${highlight.slug}` });

    const { container } = render(await ShippingHighlightDetailPage({ params: Promise.resolve({ slug: highlight.slug }) }));
    expect(screen.getByRole("heading", { level: 1, name: highlight.document.title })).toBeInTheDocument();
    expect(screen.getByText(/Hamburg, Germany/)).toBeInTheDocument();
    const schemas = [...container.querySelectorAll('script[type="application/ld+json"]')].map((node) => node.textContent).join(" ");
    expect(schemas).toContain('"@type":"Product"');
    expect(schemas).toContain('"@type":"Article"');
    expect(schemas).toContain('"@type":"BreadcrumbList"');
  });

  it("returns a 404 for unpublished detail records", async () => {
    mocks.get.mockResolvedValue(null);
    await expect(ShippingHighlightDetailPage({ params: Promise.resolve({ slug: "missing" }) })).rejects.toThrow("404");
  });

  it("renders videos with controls and no autoplay, using real media routes", () => {
    const { container } = render(<ShippingHighlightGallery document={highlight.document} />);
    expect(screen.getByRole("img", { name: highlight.document.media[0].altText })).toHaveAttribute("src", expect.stringContaining("%2Fapi%2Fmedia%2Fcover-1"));
    const video = container.querySelector("video");
    expect(video).toHaveAttribute("controls");
    expect(video).not.toHaveAttribute("autoplay");
    expect(video).toHaveAttribute("src", "/api/media/video-1");
  });

  it("shows only real latest records on the homepage and renders nothing when empty", async () => {
    const { container, rerender } = render(<LatestShippingHighlights highlights={[highlight]} />);
    expect(screen.getByText(highlight.document.title)).toBeInTheDocument();
    rerender(<LatestShippingHighlights highlights={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
