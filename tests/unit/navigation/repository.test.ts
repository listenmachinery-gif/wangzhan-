import { describe, expect, it } from "vitest";

import { DEFAULT_NAVIGATION } from "@/lib/navigation/default-navigation";
import { parsePublishedNavigation } from "@/lib/repositories/navigation-repository";
import { isNavigationTransactionConflict } from "@/lib/services/navigation-service";

describe("published navigation repository", () => {
  it("returns only a valid published snapshot", () => {
    expect(parsePublishedNavigation(null)).toBeNull();
    expect(parsePublishedNavigation({ publishedAt: null, publishedContent: DEFAULT_NAVIGATION })).toBeNull();
    expect(parsePublishedNavigation({ publishedAt: new Date(), publishedContent: { schemaVersion: 99 } })).toBeNull();
    expect(parsePublishedNavigation({ publishedAt: new Date(), publishedContent: DEFAULT_NAVIGATION })).toEqual(DEFAULT_NAVIGATION);
  });

  it("recognizes only Prisma serializable transaction conflicts", () => {
    expect(isNavigationTransactionConflict({ code: "P2034" })).toBe(true);
    expect(isNavigationTransactionConflict({ code: "P2002" })).toBe(false);
    expect(isNavigationTransactionConflict(new Error("P2034"))).toBe(false);
  });
});

