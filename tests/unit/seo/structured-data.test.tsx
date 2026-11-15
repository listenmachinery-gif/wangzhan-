import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { StandardProductPage } from "@/components/products/StandardProductPage";
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
