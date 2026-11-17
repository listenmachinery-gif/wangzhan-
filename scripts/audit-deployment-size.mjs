import { access } from "node:fs/promises";
import path from "node:path";

import {
  findDuplicateGroups,
  summarizeDirectory,
} from "./lib/deployment-size-audit.mjs";

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

const projectRoot = process.cwd();
const publicRoot = path.join(projectRoot, "public");
const outputRoot = path.join(projectRoot, ".vercel", "output");
const duplicateGroups = await findDuplicateGroups(publicRoot);
const report = {
  generatedAt: new Date().toISOString(),
  public: await summarizeDirectory(publicRoot),
  exactDuplicates: {
    groupCount: duplicateGroups.length,
    reclaimableBytes: duplicateGroups.reduce(
      (total, group) => total + group.reclaimableBytes,
      0,
    ),
    groups: duplicateGroups,
  },
  vercelOutput: (await exists(outputRoot))
    ? await summarizeDirectory(outputRoot)
    : null,
};

console.log(JSON.stringify(report, null, 2));

