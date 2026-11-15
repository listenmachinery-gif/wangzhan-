import { describe, expect, it } from "vitest";

import { isPageTransactionConflict } from "@/lib/services/page-service";

describe("page service transaction errors", () => {
  it("recognizes Prisma serializable transaction conflicts", () => {
    expect(isPageTransactionConflict({ code: "P2034" })).toBe(true);
    expect(isPageTransactionConflict({ code: "P2002" })).toBe(false);
    expect(isPageTransactionConflict(new Error("P2034"))).toBe(false);
  });
});
