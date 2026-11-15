import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { LocalTestStorageAdapter } from "@/lib/storage/local-test-storage";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("StorageAdapter immutable object contract", () => {
  it("creates a new object, returns a readable URL, and refuses key overwrite", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "zyron-media-contract-"));
    roots.push(root);
    const storage = new LocalTestStorageAdapter(root);
    const input = {
      key: "media/asset.png",
      body: Buffer.from("image bytes"),
      contentType: "image/png",
    };

    await storage.put(input);
    await expect(storage.getSignedUrl(input.key)).resolves.toMatch(/^data:image\/png;base64,/);
    await expect(storage.put(input)).rejects.toThrow();

    await storage.delete(input.key);
    await expect(storage.getSignedUrl(input.key)).rejects.toThrow();
  });
});
