import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { StandardProductPage } from "@/components/products/StandardProductPage";
import { buildShippingStructuredData } from "@/components/shipping/ShippingHighlightGallery";
import { validProductModuleData } from "@/tests/fixtures/product-modules";

describe("published product structured data", () => {
  it("renders Product, Breadcrumb, and visible FAQ data from the same product record", () => {
    const faq = validProductModuleData.FAQ as { items: Array<{ question: string; answer: string }> };
    const html = renderToStaticMarkup(<StandardProductPage product={{
      slug: "structured-machine",
      name: "Structured Machine",
      summary: "A visible industrial machine summary.",
      registeredWidget: null,
      modules: [
        { type: "HERO", position: 0, visible: true, data: validProductModuleData.HERO },
        { type: "FAQ", position: 1, visible: true, data: faq },
      ],
    }}/>);

    expect(html).toContain('"@type":"Product"');
    expect(html).toContain('"name":"Structured Machine"');
    expect(html).toContain('"url":"https://www.zyroncnc.com/products/structured-machine"');
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain(faq.items[0].question);
  });
});

describe("shipping highlight structured data", () => {
  it("builds Product, Article, and Breadcrumb data from one published snapshot", () => {
    const schemas = buildShippingStructuredData({
      slug: "germany-shipment",
      publishedAt: new Date("2026-11-17T00:00:00.000Z"),
      document: {
        title: "Electric shears shipped to Germany", summary: "Shipment summary", shipmentDate: "2026-11-16", countryCode: "DE",
        equipmentName: "Electric Shearing Machine", modelName: "Q11", quantity: 2, body: [], coverMediaId: "cover-1",
        media: [{ id: "cover", mediaAssetId: "cover-1", role: "COVER", position: 0, altText: "Electric shears ready for shipment" }],
        seoTitle: "Electric Shears Shipped to Germany | ZYRON", seoDescription: "A complete ZYRON export shipment of electric shears prepared for delivery to a customer in Germany with inspection and packing details.",
      },
    });
    expect(schemas.map((schema) => schema["@type"])).toEqual(["Product", "Article", "BreadcrumbList"]);
    expect(JSON.stringify(schemas)).toContain("https://www.zyroncnc.com/shipping-highlights/germany-shipment");
  });
});
