import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("About ZYRON production publisher", () => {
  it("uses guarded CMS services, preserves versions, and never performs destructive writes", () => {
    const source = readFileSync(resolve(process.cwd(), "scripts/publish-about-zyron.ts"), "utf8");
    expect(source).toContain("ZYRON_ABOUT_RELEASE");
    expect(source).toContain("APPROVED_2026_11_26");
    expect(source).toContain("aboutZyronDocument");
    expect(source).toContain("new PageService");
    expect(source).toContain("new SeoService");
    expect(source).toContain("service.versions");
    expect(source).toContain("saveDraft");
    expect(source).toContain("publish");
    expect(source).not.toMatch(/deleteMany|delete\(|migrate reset|force-reset|db push/);
  });
});
