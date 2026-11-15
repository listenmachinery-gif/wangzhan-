import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  DuplicateMediaError,
  MediaPolicyError,
  inspectMediaUpload,
} from "@/lib/storage/file-signatures";

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

describe("media upload file policy", () => {
  it.each([["machine.png", "image/png", png, "image/png"]])("accepts a valid %s signature", async (filename, declaredMime, bytes, expectedMime) => {
    const result = await inspectMediaUpload({
      filename,
      declaredMime,
      bytes,
      altText: "Metal shearing machine",
      usage: "EDITORIAL_IMAGE",
    });

    expect(result.detectedMime).toBe(expectedMime);
    expect(result).toMatchObject({ width: 1, height: 1 });
    expect(result.checksum).toBe(createHash("sha256").update(bytes).digest("hex"));
  });

  it("rejects extension and declared MIME mismatches", async () => {
    await expect(
      inspectMediaUpload({
        filename: "machine.png",
        declaredMime: "image/jpeg",
        bytes: png,
        altText: "Machine",
        usage: "EDITORIAL_IMAGE",
      }),
    ).rejects.toMatchObject({ code: "SIGNATURE_MISMATCH" } satisfies Partial<MediaPolicyError>);
  });

  it("rejects content over the type-specific byte limit", async () => {
    await expect(
      inspectMediaUpload({
        filename: "large.png",
        declaredMime: "image/png",
        bytes: Buffer.concat([png, Buffer.alloc(10)]),
        altText: "Large machine",
        usage: "EDITORIAL_IMAGE",
        limits: { image: png.byteLength, document: 12, video: 12 },
      }),
    ).rejects.toMatchObject({ code: "FILE_TOO_LARGE" } satisfies Partial<MediaPolicyError>);
  });

  it.each([
    '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0" /></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><image href="https://evil.example/pixel" /></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><path onload="alert(1)" /></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><a href="java&#x73;cript:alert(1)">x</a></svg>',
  ])("rejects SVG content rather than serving active XML", async (svg) => {
    await expect(
      inspectMediaUpload({
        filename: "diagram.svg",
        declaredMime: "image/svg+xml",
        bytes: Buffer.from(svg),
        altText: "Machine diagram",
        usage: "EDITORIAL_IMAGE",
      }),
    ).rejects.toMatchObject({ code: "UNSUPPORTED_FILE_TYPE" } satisfies Partial<MediaPolicyError>);
  });

  it("rejects truncated images even when the leading magic bytes match", async () => {
    await expect(
      inspectMediaUpload({
        filename: "broken.jpg",
        declaredMime: "image/jpeg",
        bytes: Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
        altText: "Broken image",
        usage: "EDITORIAL_IMAGE",
      }),
    ).rejects.toMatchObject({ code: "MALFORMED_MEDIA" } satisfies Partial<MediaPolicyError>);
  });

  it("rejects a checksum already present in the media library", async () => {
    const checksum = createHash("sha256").update(png).digest("hex");

    await expect(
      inspectMediaUpload({
        filename: "duplicate.png",
        declaredMime: "image/png",
        bytes: png,
        altText: "Machine",
        usage: "EDITORIAL_IMAGE",
        existingChecksums: new Set([checksum]),
      }),
    ).rejects.toBeInstanceOf(DuplicateMediaError);
  });

  it("requires meaningful alt text for editorial images", async () => {
    await expect(
      inspectMediaUpload({
        filename: "machine.png",
        declaredMime: "image/png",
        bytes: png,
        altText: " ",
        usage: "EDITORIAL_IMAGE",
      }),
    ).rejects.toMatchObject({ code: "ALT_TEXT_REQUIRED" } satisfies Partial<MediaPolicyError>);
  });

  it("allows missing alt text for non-editorial documents", async () => {
    const pdf = Buffer.from("%PDF-1.7\n");
    const result = await inspectMediaUpload({
      filename: "manual.pdf",
      declaredMime: "application/pdf",
      bytes: pdf,
      usage: "DOCUMENT",
    });

    expect(result.detectedMime).toBe("application/pdf");
  });

  it("rejects a declared usage that does not match the detected media type", async () => {
    await expect(
      inspectMediaUpload({
        filename: "manual.pdf",
        declaredMime: "application/pdf",
        bytes: Buffer.from("%PDF-1.7\n"),
        usage: "VIDEO",
      }),
    ).rejects.toMatchObject({ code: "USAGE_MISMATCH" } satisfies Partial<MediaPolicyError>);
  });
});
