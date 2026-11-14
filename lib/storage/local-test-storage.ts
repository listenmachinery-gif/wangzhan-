import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import type { StorageAdapter, StoragePutInput } from "@/lib/storage/storage-adapter";

export class LocalTestStorageAdapter implements StorageAdapter {
  private readonly root: string;

  constructor(root: string) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Local test object storage is disabled in production.");
    }
    this.root = path.resolve(root);
  }

  private resolve(key: string) {
    const target = path.resolve(this.root, key);
    if (!target.startsWith(`${this.root}${path.sep}`)) throw new Error("Invalid object key.");
    return target;
  }

  async put(input: StoragePutInput) {
    const target = this.resolve(input.key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, input.body);
  }

  async getSignedUrl(key: string) {
    const body = await readFile(this.resolve(key));
    const extension = path.extname(key).toLowerCase();
    const mime =
      ({
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
        ".pdf": "application/pdf",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
      } as Record<string, string>)[extension] ?? "application/octet-stream";
    return `data:${mime};base64,${body.toString("base64")}`;
  }

  async delete(key: string) {
    await rm(this.resolve(key), { force: true });
  }
}
