import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  DuplicateMediaError,
  MediaPolicyError,
  inspectMediaUpload,
} from "@/lib/storage/file-signatures";

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
const png = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);

describe("media upload file policy", () => {
  it.each([
    ["machine.jpg", "image/jpeg", jpeg, "image/jpeg"],
    ["machine.png", "image/png", png, "image/png"],
  ])("accepts a valid %s signature", async (filename, declaredMime, bytes, expectedMime) => {
    const result = await inspectMediaUpload({
      filename,
      declaredMime,
      bytes,
      altText: "Metal shearing machine",
      usage: "EDITORIAL_IMAGE",
    });

    expect(result.detectedMime).toBe(expectedMime);
    expect(result.checksum).toBe(createHash("sha256").update(bytes).digest("hex"));
  });

  it("rejects extension and declared MIME mismatches", async () => {
    await expect(
      inspectMediaUpload({
        filename: "machine.png",
        declaredMime: "image/png",
        bytes: jpeg,
        altText: "Machine",
        usage: "EDITORIAL_IMAGE",
      }),
    ).rejects.toMatchObject({ code: "SIGNATURE_MISMATCH" } satisfies Partial<MediaPolicyError>);
  });

  it("rejects content over the type-specific byte limit", async () => {
    await expect(
      inspectMediaUpload({
        filename: "large.jpg",
        declaredMime: "image/jpeg",
        bytes: Buffer.concat([jpeg, Buffer.alloc(10)]),
        altText: "Large machine",
        usage: "EDITORIAL_IMAGE",
        limits: { image: 12, document: 12, video: 12 },
      }),
    ).rejects.toMatchObject({ code: "FILE_TOO_LARGE" } satisfies Partial<MediaPolicyError>);
  });

  it.each([
    '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><image href="https://evil.example/pixel" /></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><path onload="alert(1)" /></svg>',
  ])("rejects unsafe SVG content", async (svg) => {
    await expect(
      inspectMediaUpload({
        filename: "diagram.svg",
        declaredMime: "image/svg+xml",
        bytes: Buffer.from(svg),
        altText: "Machine diagram",
        usage: "EDITORIAL_IMAGE",
      }),
    ).rejects.toMatchObject({ code: "UNSAFE_SVG" } satisfies Partial<MediaPolicyError>);
  });

  it("rejects a checksum already present in the media library", async () => {
    const checksum = createHash("sha256").update(jpeg).digest("hex");

    await expect(
      inspectMediaUpload({
        filename: "duplicate.jpg",
        declaredMime: "image/jpeg",
        bytes: jpeg,
        altText: "Machine",
        usage: "EDITORIAL_IMAGE",
        existingChecksums: new Set([checksum]),
      }),
    ).rejects.toBeInstanceOf(DuplicateMediaError);
  });

  it("requires meaningful alt text for editorial images", async () => {
    await expect(
      inspectMediaUpload({
        filename: "machine.jpg",
        declaredMime: "image/jpeg",
        bytes: jpeg,
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
});
