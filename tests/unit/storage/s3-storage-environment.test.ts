import { afterEach, describe, expect, it, vi } from "vitest";

import { resolveS3StorageEnvironment } from "@/lib/storage/s3-storage";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("S3 storage environment", () => {
  it("uses Vercel AWS Marketplace OIDC variables without static credentials", () => {
    process.env = {
      ...ORIGINAL_ENV,
      AWS_REGION: "iad1",
      AWS_ROLE_ARN: "arn:aws:iam::123456789012:role/vercel-storage",
      S3_BUCKET_NAME: "zyron-media-preview",
    };
    delete process.env.OBJECT_STORAGE_BUCKET;
    delete process.env.OBJECT_STORAGE_ACCESS_KEY_ID;
    delete process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY;

    const credentials = vi.fn();
    const config = resolveS3StorageEnvironment(() => credentials);

    expect(config).toMatchObject({
      bucket: "zyron-media-preview",
      region: "iad1",
      credentials,
    });
    expect(config).not.toHaveProperty("accessKeyId");
    expect(config).not.toHaveProperty("secretAccessKey");
  });

  it("keeps existing S3-compatible static credential configuration", () => {
    process.env = {
      ...ORIGINAL_ENV,
      OBJECT_STORAGE_ENDPOINT: "https://example.r2.cloudflarestorage.com",
      OBJECT_STORAGE_REGION: "auto",
      OBJECT_STORAGE_BUCKET: "zyron-cms",
      OBJECT_STORAGE_ACCESS_KEY_ID: "access-key",
      OBJECT_STORAGE_SECRET_ACCESS_KEY: "secret-key",
    };

    expect(resolveS3StorageEnvironment()).toMatchObject({
      endpoint: "https://example.r2.cloudflarestorage.com",
      region: "auto",
      bucket: "zyron-cms",
      accessKeyId: "access-key",
      secretAccessKey: "secret-key",
    });
  });
});
