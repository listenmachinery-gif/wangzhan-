import { describe, expect, it } from "vitest";

import { resolveProductPageLayout } from "@/lib/page-builder/product-page-layout";
import type { PageDocument, PageNode } from "@/lib/page-builder/schema";

function node(id: string, placement?: PageNode["placement"]): PageNode {
  return {
    id,
    type: "SPACER",
    content: { size: 16 },
    ...(placement ? { placement } : {}),
  };
}

describe("product page layout", () => {
  it("keeps legacy-compatible documents in their explicit before, replacement, and default-after slots", () => {
    const document: PageDocument = {
      schemaVersion: 1,
      nodes: [
        node("before", "BEFORE_LEGACY"),
        node("default-after"),
        node("replace", "REPLACE_LEGACY"),
        node("after", "AFTER_LEGACY"),
      ],
    };

    const layout = resolveProductPageLayout(document);

    expect(layout.before.map(({ id }) => id)).toEqual(["before"]);
    expect(layout.replacement.map(({ id }) => id)).toEqual(["replace"]);
    expect(layout.after.map(({ id }) => id)).toEqual(["default-after", "after"]);
  });

  it("renders every node in document order as replacement content for a full CMS takeover", () => {
    const document: PageDocument = {
      schemaVersion: 1,
      renderMode: "REPLACE_LEGACY",
      nodes: [
        node("hero", "BEFORE_LEGACY"),
        node("specifications"),
        node("inquiry", "AFTER_LEGACY"),
      ],
    };

    const layout = resolveProductPageLayout(document);

    expect(layout.before).toEqual([]);
    expect(layout.after).toEqual([]);
    expect(layout.replacement.map(({ id }) => id)).toEqual([
      "hero",
      "specifications",
      "inquiry",
    ]);
  });
});
