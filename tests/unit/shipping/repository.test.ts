import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

import type { ShippingHighlightDocument } from "@/lib/shipping/schema";

const databaseMocks = vi.hoisted(() => ({ findMany: vi.fn(), findFirst: vi.fn() }));

vi.mock("@/lib/db/client", () => ({
  db: { shippingHighlight: { findMany: databaseMocks.findMany, findFirst: databaseMocks.findFirst } },
}));

import {
  getPublishedShippingHighlightBySlug,
  listLatestPublishedShippingHighlights,
  listPublishedShippingHighlights,
} from "@/lib/repositories/shipping-highlight-repository";

const document: ShippingHighlightDocument = {
  title: "Electric shearing machines shipped to Germany",
  summary: "A complete export shipment prepared for a German sheet-metal customer.",
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
  body: [{ type: "PARAGRAPH", text: "Inspection completed before loading." }],
  coverMediaId: "cover-1",
  media: [{ id: "cover-link", mediaAssetId: "cover-1", role: "COVER", position: 0, altText: "Electric shearing machines ready for shipping" }],
  seoTitle: "Electric Shearing Machines Shipped to Germany | ZYRON",
  seoDescription: "See how ZYRON inspected, packed, and loaded three electric shearing machines for sea delivery to a sheet-metal customer in Hamburg, Germany.",
};

function row(id: string, patch: Record<string, unknown> = {}) {
  return {
    id,
    slug: id,
    publishedAt: new Date("2026-11-16T00:00:00.000Z"),
    updatedAt: new Date("2026-11-16T01:00:00.000Z"),
    publishedShipmentDate: new Date("2026-11-16T00:00:00.000Z"),
    publishedCountryCode: "DE",
    publishedCategorySlug: "shearing-machines",
    publishedContent: document,
    ...patch,
  };
}

describe("published shipping highlight repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    databaseMocks.findMany.mockResolvedValue([]);
    databaseMocks.findFirst.mockResolvedValue(null);
  });

  it("queries publication-only rows with filters, stable sorting, and cursor pagination", async () => {
    databaseMocks.findMany.mockResolvedValue([row("shipment-2"), row("shipment-1"), row("shipment-0")]);
    const result = await listPublishedShippingHighlights({ countryCode: "de", categorySlug: "shearing-machines", sort: "oldest", limit: 2, cursor: "cursor-1" });

    expect(databaseMocks.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: { not: "ARCHIVED" }, publishedAt: { not: null }, publishedContent: { not: Prisma.DbNull }, publishedCountryCode: "DE", publishedCategorySlug: "shearing-machines" },
      cursor: { id: "cursor-1" }, skip: 1, take: 3,
      orderBy: [{ publishedShipmentDate: "asc" }, { id: "asc" }],
    }));
    expect(result.items.map((item) => item.slug)).toEqual(["shipment-2", "shipment-1"]);
    expect(result.nextCursor).toBe("shipment-1");
  });

  it("skips malformed snapshots and emits a structured error without leaking content", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    databaseMocks.findMany.mockResolvedValue([row("bad", { publishedContent: { title: "private malformed payload" } }), row("good")]);

    const result = await listPublishedShippingHighlights();

    expect(result.items.map((item) => item.slug)).toEqual(["good"]);
    expect(error).toHaveBeenCalledWith("Invalid published shipping highlight snapshot", { id: "bad", slug: "bad" });
    expect(JSON.stringify(error.mock.calls)).not.toContain("private malformed payload");
  });

  it("returns only a valid published detail and preserves an empty state", async () => {
    databaseMocks.findFirst.mockResolvedValueOnce(row("germany-shipment"));
    await expect(getPublishedShippingHighlightBySlug("germany-shipment")).resolves.toMatchObject({ slug: "germany-shipment", document });
    expect(databaseMocks.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ slug: "germany-shipment", status: { not: "ARCHIVED" }, publishedAt: { not: null } }) }));

    databaseMocks.findFirst.mockResolvedValueOnce(row("bad", { publishedContent: {} }));
    await expect(getPublishedShippingHighlightBySlug("bad")).resolves.toBeNull();
    databaseMocks.findMany.mockResolvedValueOnce([]);
    await expect(listPublishedShippingHighlights()).resolves.toEqual({ items: [], nextCursor: null });
  });

  it("provides the newest published records for the homepage", async () => {
    databaseMocks.findMany.mockResolvedValue([row("newest"), row("older")]);
    await expect(listLatestPublishedShippingHighlights(3)).resolves.toEqual([
      expect.objectContaining({ slug: "newest" }), expect.objectContaining({ slug: "older" }),
    ]);
    expect(databaseMocks.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 4, orderBy: [{ publishedShipmentDate: "desc" }, { id: "desc" }] }));
  });
});
