import { createServer, type IncomingMessage } from "node:http";
import { once } from "node:events";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { S3StorageAdapter } from "@/lib/storage/s3-storage";

describe("S3-compatible storage adapter", () => {
  const requests: Array<{ method: string; url: string; body: Buffer; headers: IncomingMessage["headers"] }> = [];
  const server = createServer(async (request, response) => {
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(Buffer.from(chunk));
    requests.push({ method: request.method ?? "", url: request.url ?? "", body: Buffer.concat(chunks), headers: request.headers });
    response.statusCode = 200;
    response.setHeader("content-type", "application/xml");
    response.end("<ok/>");
  });
  let adapter: S3StorageAdapter;

  beforeAll(async () => {
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("S3 test service did not bind.");
    adapter = new S3StorageAdapter({ endpoint: `http://127.0.0.1:${address.port}`, region: "auto", bucket: "zyron-test", accessKeyId: "test-access", secretAccessKey: "test-secret" });
  });
  afterAll(() => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

  it("uploads immutably, signs reads, and deletes through an S3-compatible HTTP service", async () => {
    await adapter.put({ key: "media/test.png", body: new Uint8Array([1, 2, 3]), contentType: "image/png", cacheControl: "public,max-age=60" });
    const signed = new URL(await adapter.getSignedUrl("media/test.png", 60));
    await adapter.delete("media/test.png");
    expect(requests).toHaveLength(2);
    expect(requests[0]).toMatchObject({ method: "PUT", url: expect.stringContaining("/zyron-test/media/test.png"), body: Buffer.from([1, 2, 3]) });
    expect(requests[0].headers).toMatchObject({ "content-type": "image/png", "if-none-match": "*" });
    expect(signed.pathname).toBe("/zyron-test/media/test.png");
    expect(signed.searchParams.get("X-Amz-Expires")).toBe("60");
    expect(requests[1]).toMatchObject({ method: "DELETE", url: expect.stringContaining("/zyron-test/media/test.png") });
  });
});
