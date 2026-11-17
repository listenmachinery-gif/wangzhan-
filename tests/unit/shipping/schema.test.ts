import { describe, expect, it } from "vitest";

import {
  parseShippingHighlightDocument,
  shippingHighlightDocumentSchema,
  validateShippingPublication,
} from "@/lib/shipping/schema";

const document = {
  title: "Three ZYRON shearing machines shipped to Germany",
  summary: "A complete cutting equipment shipment prepared for a sheet-metal customer in Hamburg.",
  shipmentDate: "2026-11-16",
  countryCode: "DE",
  city: "Hamburg",
  categoryId: "category-1",
  categorySlug: "shearing-machines",
  productId: "product-1",
  productSlug: "small-electric-shearing-machine",
  equipmentName: "Electric Shearing Machine",
  modelName: "Q11-3x1300",
  quantity: 3,
  containerMethod: "20GP container",
  transportMode: "Sea freight",
  packagingMethod: "Export wooden case",
  body: [
    { type: "HEADING", text: "Loading and inspection" },
    { type: "PARAGRAPH", text: "Every machine completed final inspection before loading." },
    { type: "LINK", text: "View the machine", href: "/products/small-electric-shearing-machine" },
  ],
  coverMediaId: "media-cover",
  media: [
    { id: "shipping-media-cover", mediaAssetId: "media-cover", role: "COVER", position: 0, caption: "Container loading", altText: "ZYRON electric shearing machines prepared for shipment" },
    { id: "shipping-media-video", mediaAssetId: "media-video", role: "VIDEO", position: 1, caption: "Loading video", altText: "Loading the electric shearing machines into the export container" },
  ],
  seoTitle: "Electric Shearing Machines Shipped to Germany | ZYRON",
  seoDescription: "See how ZYRON inspected, packed, and loaded three electric shearing machines for delivery to a sheet-metal customer in Hamburg, Germany.",
} as const;

const assets = [
  { id: "media-cover", lifecycleStatus: "ACTIVE", mimeType: "image/jpeg" },
  { id: "media-video", lifecycleStatus: "ACTIVE", mimeType: "video/mp4" },
] as const;

describe("shippingHighlightDocumentSchema", () => {
  it("normalizes an ISO country code and accepts structured safe content", () => {
    const parsed = parseShippingHighlightDocument({ ...document, countryCode: " de " });
    expect(parsed.countryCode).toBe("DE");
    expect(parsed.body[2]).toMatchObject({ type: "LINK", href: "/products/small-electric-shearing-machine" });
  });

  it.each([
    ["unknown country", { countryCode: "ZZ" }],
    ["quantity below one", { quantity: 0 }],
    ["invalid category slug", { categorySlug: "Bad Slug" }],
    ["invalid product slug", { productSlug: "bad_slug" }],
    ["unsafe external URL", { body: [{ type: "LINK", text: "Bad", href: "http://example.com" }] }],
    ["protocol-relative URL", { body: [{ type: "LINK", text: "Bad", href: "//example.com" }] }],
    ["SEO title too long", { seoTitle: "x".repeat(71) }],
    ["SEO description too long", { seoDescription: "x".repeat(321) }],
  ])("rejects %s", (_label, patch) => {
    expect(shippingHighlightDocumentSchema.safeParse({ ...document, ...patch }).success).toBe(false);
  });

  it("rejects sensitive or unknown fields instead of persisting them", () => {
    expect(shippingHighlightDocumentSchema.safeParse({ ...document, customerEmail: "buyer@example.com" }).success).toBe(false);
    expect(shippingHighlightDocumentSchema.safeParse({ ...document, body: [{ type: "PARAGRAPH", text: "Safe", customerPhone: "+1" }] }).success).toBe(false);
  });

  it("rejects duplicate media identifiers and positions", () => {
    expect(shippingHighlightDocumentSchema.safeParse({
      ...document,
      media: [document.media[0], { ...document.media[0] }],
    }).success).toBe(false);
    expect(shippingHighlightDocumentSchema.safeParse({
      ...document,
      media: [document.media[0], { ...document.media[1], position: 0 }],
    }).success).toBe(false);
  });
});

describe("validateShippingPublication", () => {
  it("passes a complete document with active image and video media", () => {
    expect(validateShippingPublication(parseShippingHighlightDocument(document), [...assets])).toEqual({ blockers: [], warnings: [] });
  });

  it("blocks missing cover, missing real media, inactive assets, media type mismatch, and missing alt text", () => {
    const parsed = parseShippingHighlightDocument({
      ...document,
      coverMediaId: "missing-cover",
      media: [
        { ...document.media[0], altText: "" },
        { ...document.media[1], role: "EQUIPMENT" },
      ],
    });
    const result = validateShippingPublication(parsed, [
      { id: "media-cover", lifecycleStatus: "TOMBSTONED", mimeType: "image/jpeg" },
      { id: "media-video", lifecycleStatus: "ACTIVE", mimeType: "video/mp4" },
    ]);

    expect(result.blockers.join(" ")).toMatch(/封面/);
    expect(result.blockers.join(" ")).toMatch(/有效媒体/);
    expect(result.blockers.join(" ")).toMatch(/alt|替代文本/i);
    expect(result.blockers.join(" ")).toMatch(/媒体类型/);
  });

  it("warns when SEO copy is valid but not within the recommended search snippet length", () => {
    const parsed = parseShippingHighlightDocument({ ...document, seoTitle: "Short title", seoDescription: "Short description" });
    const result = validateShippingPublication(parsed, [...assets]);
    expect(result.blockers).toEqual([]);
    expect(result.warnings.join(" ")).toMatch(/SEO/);
  });
});
