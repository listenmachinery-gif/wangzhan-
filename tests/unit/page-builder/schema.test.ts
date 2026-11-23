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
  it("rejects duplicate node ids across the full document tree", () => {
    const duplicate = {
      schemaVersion: 1,
      nodes: [
        { id: "same-id", type: "PARAGRAPH", content: { text: "First" } },
        { id: "container", type: "SECTION", content: { label: "Section" }, children: [
          { id: "same-id", type: "PARAGRAPH", content: { text: "Second" } },
        ] },
      ],
    };

    expect(pageDocumentSchema.safeParse(duplicate).success).toBe(false);
  });

  it("accepts a bounded responsive component tree", () => {
    const result = pageDocumentSchema.parse({
      schemaVersion: 1,
      nodes: [
        {
          id: "factory-stats",
          type: "FACTORY_STATS",
          placement: "BEFORE_LEGACY",
          content: { heading: "Manufacturing capacity" },
          style: { paddingY: 64, backgroundColor: "#0B0D10", columns: 4 },
          responsive: {
            tablet: { columns: 2 },
            mobile: { columns: 1, paddingY: 32, visible: true },
          },
          responsiveTextStyles: {
            tablet: { heading: { fontSize: 36, textAlign: "left" } },
            mobile: { heading: { fontSize: 24, textAlign: "center" } },
          },
          children: [],
        },
      ],
    });

    expect(result.nodes[0]).toMatchObject({
      id: "factory-stats",
      type: "FACTORY_STATS",
      placement: "BEFORE_LEGACY",
      responsive: { mobile: { columns: 1 } },
      responsiveTextStyles: { mobile: { heading: { fontSize: 24 } } },
    });
  });

  it("accepts an explicit full product page takeover mode", () => {
    const result = pageDocumentSchema.parse({
      schemaVersion: 1,
      renderMode: "REPLACE_LEGACY",
      nodes: [],
    });

    expect(result.renderMode).toBe("REPLACE_LEGACY");
  });

  it("rejects unknown page render modes", () => {
    expect(() => pageDocumentSchema.parse({
      schemaVersion: 1,
      renderMode: "REPLACE_EVERYTHING",
      nodes: [],
    })).toThrow();
  });

  it("rejects unknown legacy slot placement values", () => {
    expect(() => pageDocumentSchema.parse({
      schemaVersion: 1,
      nodes: [{ id: "bad-slot", type: "SPACER", placement: "MIDDLE", content: { size: 20 } }],
    })).toThrow();
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
