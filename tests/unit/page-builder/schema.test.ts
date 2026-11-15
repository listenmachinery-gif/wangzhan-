import { describe, expect, it } from "vitest";

import { can, type Principal } from "@/lib/auth/permissions";
import { pageDocumentSchema } from "@/lib/page-builder/schema";

const contentEditor: Principal = {
  id: "content-editor",
  email: "content@zyron.test",
  name: "Content Editor",
  roles: ["CONTENT_EDITOR"],
};

const sales: Principal = {
  id: "sales",
  email: "sales@zyron.test",
  name: "Sales",
  roles: ["SALES"],
};

describe("page builder document schema", () => {
  it("accepts a bounded responsive component tree", () => {
    const result = pageDocumentSchema.parse({
      schemaVersion: 1,
      nodes: [
        {
          id: "factory-stats",
          type: "FACTORY_STATS",
          content: { heading: "Manufacturing capacity" },
          style: { paddingY: 64, backgroundColor: "#0B0D10", columns: 4 },
          responsive: {
            tablet: { columns: 2 },
            mobile: { columns: 1, paddingY: 32, visible: true },
          },
          children: [],
        },
      ],
    });

    expect(result.nodes[0]).toMatchObject({
      id: "factory-stats",
      type: "FACTORY_STATS",
      responsive: { mobile: { columns: 1 } },
    });
  });

  it("rejects executable content and unbounded style values", () => {
    expect(() => pageDocumentSchema.parse({
      schemaVersion: 1,
      nodes: [{
        id: "unsafe",
        type: "RICH_TEXT",
        content: { html: "<script>alert(1)</script>" },
        style: { zIndex: 999999, backgroundImage: "javascript:alert(1)" },
      }],
    })).toThrow();
  });

  it("rejects unsupported schema versions and oversized node collections", () => {
    expect(() => pageDocumentSchema.parse({ schemaVersion: 2, nodes: [] })).toThrow();
    expect(() => pageDocumentSchema.parse({
      schemaVersion: 1,
      nodes: Array.from({ length: 101 }, (_, index) => ({
        id: `node-${index}`,
        type: "SPACER",
        content: {},
      })),
    })).toThrow();
  });
});

describe("page builder permissions", () => {
  it("lets content editors read and write pages but keeps publishing server-authorized", () => {
    expect(can(contentEditor, "page.read")).toBe(true);
    expect(can(contentEditor, "page.write")).toBe(true);
    expect(can(contentEditor, "page.publish")).toBe(true);
    expect(can(sales, "page.read")).toBe(false);
    expect(can(sales, "page.write")).toBe(false);
    expect(can(sales, "page.publish")).toBe(false);
  });
});
