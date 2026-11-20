import { describe, expect, it } from "vitest";

import { companyStats } from "@/data/company";

describe("public company claims", () => {
  it("uses capability labels instead of unverified company statistics", () => {
    expect(companyStats).toEqual([
      { value: "Cutting", label: "Sheet Processing" },
      { value: "Bending", label: "Forming Equipment" },
      { value: "Rolling", label: "Curved Forming" },
      { value: "Ductwork", label: "HVAC Production" },
    ]);
  });
});
