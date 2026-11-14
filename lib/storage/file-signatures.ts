import { createHash } from "node:crypto";
import path from "node:path";
import sharp from "sharp";

export type MediaUsage = "EDITORIAL_IMAGE" | "DECORATIVE_IMAGE" | "DOCUMENT" | "VIDEO";

export type MediaByteLimits = {
  image: number;
  document: number;
  video: number;
};

export type MediaInspectionInput = {
  filename: string;
  declaredMime: string;
  bytes: Uint8Array;
  altText?: string | null;
  usage: MediaUsage;
  existingChecksums?: ReadonlySet<string>;
  limits?: MediaByteLimits;
};

export type MediaInspection = {
  detectedMime: string;
  extension: string;
  checksum: string;
  byteSize: number;
  width?: number;
  height?: number;
};

export type MediaPolicyCode =
  | "UNSUPPORTED_FILE_TYPE"
  | "SIGNATURE_MISMATCH"
  | "FILE_TOO_LARGE"
  | "UNSAFE_SVG"
  | "MALFORMED_MEDIA"
  | "USAGE_MISMATCH"
  | "DUPLICATE_MEDIA"
  | "ALT_TEXT_REQUIRED";

export class MediaPolicyError extends Error {
  constructor(
    public readonly code: MediaPolicyCode,
    message: string,
  ) {
    super(message);
    this.name = "MediaPolicyError";
  }
}

export class DuplicateMediaError extends MediaPolicyError {
  constructor(public readonly checksum: string) {
    super("DUPLICATE_MEDIA", "An identical media asset already exists.");
    this.name = "DuplicateMediaError";
  }
}

const DEFAULT_LIMITS: MediaByteLimits = {
  image: 10 * 1024 * 1024,
  document: 25 * 1024 * 1024,
  video: 25 * 1024 * 1024,
};

const TYPE_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

function detectMime(bytes: Uint8Array): string | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    Buffer.from(bytes.slice(8, 12)).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  if (Buffer.from(bytes.slice(0, 5)).toString("ascii") === "%PDF-") return "application/pdf";
  if (Buffer.from(bytes.slice(4, 8)).toString("ascii") === "ftyp") return "video/mp4";
  if (startsWith(bytes, [0x1a, 0x45, 0xdf, 0xa3])) return "video/webm";

  return null;
}

function limitFor(mime: string, limits: MediaByteLimits) {
  if (mime.startsWith("image/")) return limits.image;
  if (mime.startsWith("video/")) return limits.video;
  return limits.document;
}

export async function inspectMediaUpload(input: MediaInspectionInput): Promise<MediaInspection> {
  const extension = path.extname(input.filename).toLowerCase();
  const extensionMime = TYPE_BY_EXTENSION[extension];
  const detectedMime = detectMime(input.bytes);

  if (!extensionMime || !detectedMime) {
    throw new MediaPolicyError("UNSUPPORTED_FILE_TYPE", "This file type is not supported.");
  }
  if (extensionMime !== input.declaredMime || detectedMime !== input.declaredMime) {
    throw new MediaPolicyError("SIGNATURE_MISMATCH", "File extension, MIME type, and content do not match.");
  }

  const limits = input.limits ?? DEFAULT_LIMITS;
  if (input.bytes.byteLength > limitFor(detectedMime, limits)) {
    throw new MediaPolicyError("FILE_TOO_LARGE", "File exceeds the allowed size.");
  }
  const usageMatches =
    ((input.usage === "EDITORIAL_IMAGE" || input.usage === "DECORATIVE_IMAGE") && detectedMime.startsWith("image/")) ||
    (input.usage === "DOCUMENT" && detectedMime === "application/pdf") ||
    (input.usage === "VIDEO" && detectedMime.startsWith("video/"));
  if (!usageMatches) {
    throw new MediaPolicyError("USAGE_MISMATCH", "Declared usage does not match the detected media type.");
  }
  let width: number | undefined;
  let height: number | undefined;
  if (detectedMime.startsWith("image/")) {
    try {
      const metadata = await sharp(input.bytes, { failOn: "error" }).metadata();
      if (!metadata.width || !metadata.height) throw new Error("Missing image dimensions.");
      width = metadata.width;
      height = metadata.height;
    } catch {
      throw new MediaPolicyError("MALFORMED_MEDIA", "Image content is truncated or malformed.");
    }
  }
  if (input.usage === "EDITORIAL_IMAGE" && !input.altText?.trim()) {
    throw new MediaPolicyError("ALT_TEXT_REQUIRED", "Editorial images require alt text.");
  }

  const checksum = createHash("sha256").update(input.bytes).digest("hex");
  if (input.existingChecksums?.has(checksum)) throw new DuplicateMediaError(checksum);

  return { detectedMime, extension, checksum, byteSize: input.bytes.byteLength, width, height };
}
