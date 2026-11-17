import { access, readFile } from "node:fs/promises";
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

  it("excludes developer-only build inputs without excluding production scripts", async () => {
    const projectRoot = process.cwd();
    const ignoreLines = (await readFile(path.join(projectRoot, ".vercelignore"), "utf8"))
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    expect(ignoreLines).toEqual(
      expect.arrayContaining([
        ".codex/",
        "docs/",
        "tests/",
        "public/**/SOURCES.md",
      ]),
    );
    expect(ignoreLines).not.toContain("scripts/");
    await expect(fileExists(path.join(projectRoot, "scripts/vercel-build.ts"))).resolves.toBe(true);
    await expect(fileExists(path.join(projectRoot, "scripts/reset-admin-password.ts"))).resolves.toBe(true);
    await expect(fileExists(path.join(projectRoot, "prisma/seed-crm.ts"))).resolves.toBe(true);
    await expect(fileExists(path.join(projectRoot, "prisma/seed-rbac.ts"))).resolves.toBe(true);
  });
});
