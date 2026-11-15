import { spawnSync } from "node:child_process";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("RBAC seed CLI entrypoint", () => {
  it("executes the CLI main function from a workspace path containing non-ASCII characters", () => {
    const result = spawnSync(
      path.resolve("node_modules/.bin/tsx"),
      ["prisma/seed-rbac.ts"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: { ...process.env, DATABASE_URL: "" },
      },
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("DATABASE_URL is required.");
  });
});
