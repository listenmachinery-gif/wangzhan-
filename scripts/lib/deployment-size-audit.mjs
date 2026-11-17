import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

async function listRegularFiles(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries.toSorted((left, right) => left.name.localeCompare(right.name))) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listRegularFiles(root, absolutePath)));
    } else if (entry.isFile()) {
      const metadata = await stat(absolutePath);
      files.push({
        absolutePath,
        relativePath: path.relative(root, absolutePath).split(path.sep).join("/"),
        sizeBytes: metadata.size,
      });
    }
  }

  return files;
}

export async function summarizeDirectory(root) {
  const files = await listRegularFiles(root);
  const byExtension = {};

  for (const file of files) {
    const extension = path.extname(file.relativePath).toLowerCase() || "<none>";
    const current = byExtension[extension] ?? { bytes: 0, files: 0 };
    current.bytes += file.sizeBytes;
    current.files += 1;
    byExtension[extension] = current;
  }

  return {
    fileCount: files.length,
    totalBytes: files.reduce((total, file) => total + file.sizeBytes, 0),
    byExtension,
  };
}

export async function findDuplicateGroups(root) {
  const files = await listRegularFiles(root);
  const filesBySize = new Map();

  for (const file of files) {
    const matchingSize = filesBySize.get(file.sizeBytes) ?? [];
    matchingSize.push(file);
    filesBySize.set(file.sizeBytes, matchingSize);
  }

  const filesByHash = new Map();
  for (const sameSizeFiles of filesBySize.values()) {
    if (sameSizeFiles.length < 2) continue;
    for (const file of sameSizeFiles) {
      const hash = createHash("sha256")
        .update(await readFile(file.absolutePath))
        .digest("hex");
      const matchingHash = filesByHash.get(hash) ?? [];
      matchingHash.push(file);
      filesByHash.set(hash, matchingHash);
    }
  }

  return [...filesByHash.entries()]
    .filter(([, matchingFiles]) => matchingFiles.length > 1)
    .map(([hash, matchingFiles]) => ({
      hash,
      sizeBytes: matchingFiles[0].sizeBytes,
      reclaimableBytes: matchingFiles[0].sizeBytes * (matchingFiles.length - 1),
      files: matchingFiles.map((file) => file.relativePath).toSorted(),
    }))
    .toSorted((left, right) => right.reclaimableBytes - left.reclaimableBytes);
}

