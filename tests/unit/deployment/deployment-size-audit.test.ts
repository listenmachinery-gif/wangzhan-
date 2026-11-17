import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  findDuplicateGroups,
  summarizeDirectory,
} from "../../../scripts/lib/deployment-size-audit.mjs";

const temporaryDirectories: string[] = [];

async function createFixtureDirectory() {
  const root = await mkdtemp(path.join(tmpdir(), "zyron-deployment-audit-"));
  temporaryDirectories.push(root);
  await mkdir(path.join(root, "nested"));
  await Promise.all([
    writeFile(path.join(root, "first.png"), "same-content"),
    writeFile(path.join(root, "nested", "second.png"), "same-content"),
    writeFile(path.join(root, "notes.txt"), "unique"),
  ]);
  return root;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { force: true, recursive: true }),
    ),
  );
});

describe("deployment size audit", () => {
  it("summarizes regular files by extension without double-counting directories", async () => {
    const root = await createFixtureDirectory();

    await expect(summarizeDirectory(root)).resolves.toEqual({
      fileCount: 3,
      totalBytes: 30,
      byExtension: {
        ".png": { bytes: 24, files: 2 },
        ".txt": { bytes: 6, files: 1 },
      },
    });
  });

  it("groups byte-identical files by SHA-256 and reports reclaimable bytes", async () => {
    const root = await createFixtureDirectory();

    const groups = await findDuplicateGroups(root);

    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({
      files: ["first.png", "nested/second.png"],
      reclaimableBytes: 12,
      sizeBytes: 12,
    });
    expect(groups[0].hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
