export class UntrustedOriginError extends Error {
  constructor() {
    super("Admin mutation must originate from the same origin.");
    this.name = "UntrustedOriginError";
  }
}

export class PayloadTooLargeError extends Error {}
export class ContentLengthRequiredError extends Error {}

export const MAX_ADMIN_UPLOAD_REQUEST_BYTES = 26 * 1024 * 1024;

export function assertSameOriginMutation(request: Request) {
  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host") || requestUrl.host;
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol || requestUrl.protocol.replace(":", "");
  const expectedOrigin = `${protocol}://${host}`;
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");

  if (origin !== expectedOrigin || (fetchSite !== null && fetchSite !== "same-origin")) {
    throw new UntrustedOriginError();
  }
}

export function assertBoundedUploadRequest(request: Request) {
  const rawLength = request.headers.get("content-length");
  if (!rawLength) throw new ContentLengthRequiredError("Content-Length is required.");
  const length = Number(rawLength);
  if (!Number.isSafeInteger(length) || length < 0 || length > MAX_ADMIN_UPLOAD_REQUEST_BYTES) {
    throw new PayloadTooLargeError("Upload request exceeds the maximum allowed size.");
  }
}
