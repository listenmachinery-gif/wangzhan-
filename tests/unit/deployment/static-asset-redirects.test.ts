import { access } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { findDuplicateGroups } from "../../../scripts/lib/deployment-size-audit.mjs";
import { staticAssetRedirects } from "@/data/static-asset-redirects";
import nextConfig from "../../../next.config";

async function fileExists(target: string) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

describe("static asset deployment footprint", () => {
  it("does not deploy byte-identical public files more than once", async () => {
    const publicRoot = path.join(process.cwd(), "public");

    await expect(findDuplicateGroups(publicRoot)).resolves.toEqual([]);
  });

  it("keeps every removed duplicate URL behind a unique permanent redirect", async () => {
    const publicRoot = path.join(process.cwd(), "public");
    const sources = staticAssetRedirects.map((redirect) => redirect.source);

    expect(staticAssetRedirects).toHaveLength(17);
    expect(new Set(sources).size).toBe(sources.length);

    for (const redirect of staticAssetRedirects) {
      expect(redirect.permanent).toBe(true);
      expect(await fileExists(path.join(publicRoot, redirect.source))).toBe(false);
      expect(await fileExists(path.join(publicRoot, redirect.destination))).toBe(true);
    }
  });

  it("registers every compatibility redirect in the Next.js route configuration", async () => {
    const redirects = await nextConfig.redirects?.();

    expect(redirects).toEqual(expect.arrayContaining([...staticAssetRedirects]));
  });
});
