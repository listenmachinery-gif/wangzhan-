import { createHash } from "node:crypto";
import path from "node:path";

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
};

export type MediaPolicyCode =
  | "UNSUPPORTED_FILE_TYPE"
  | "SIGNATURE_MISMATCH"
  | "FILE_TOO_LARGE"
  | "UNSAFE_SVG"
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
  video: 100 * 1024 * 1024,
};

const TYPE_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
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

  const text = Buffer.from(bytes.slice(0, 1024)).toString("utf8").trimStart();
  if (/^(?:<\?xml[^>]*>\s*)?<svg[\s>]/i.test(text)) return "image/svg+xml";
  return null;
}

function assertSafeSvg(bytes: Uint8Array) {
  const source = Buffer.from(bytes).toString("utf8");
  const forbidden = [
    /<\s*script\b/i,
    /\son[a-z]+\s*=/i,
    /(?:href|src)\s*=\s*["']\s*(?:https?:|\/\/|data:|javascript:)/i,
    /<\s*(?:iframe|object|embed|foreignObject)\b/i,
  ];

  if (forbidden.some((pattern) => pattern.test(source))) {
    throw new MediaPolicyError("UNSAFE_SVG", "SVG contains active or externally loaded content.");
  }
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
  if (detectedMime === "image/svg+xml") assertSafeSvg(input.bytes);
  if (input.usage === "EDITORIAL_IMAGE" && !input.altText?.trim()) {
    throw new MediaPolicyError("ALT_TEXT_REQUIRED", "Editorial images require alt text.");
  }

  const checksum = createHash("sha256").update(input.bytes).digest("hex");
  if (input.existingChecksums?.has(checksum)) throw new DuplicateMediaError(checksum);

  return { detectedMime, extension, checksum, byteSize: input.bytes.byteLength };
}
