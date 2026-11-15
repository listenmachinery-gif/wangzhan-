import { describe, expect, it } from "vitest";

import {
  assertBoundedUploadRequest,
  UntrustedOriginError,
  assertSameOriginMutation,
  ContentLengthRequiredError,
  MAX_ADMIN_UPLOAD_REQUEST_BYTES,
  PayloadTooLargeError,
} from "@/lib/auth/request-security";

describe("admin mutation origin policy", () => {
  it("accepts an exact same-origin browser mutation", () => {
    expect(() =>
      assertSameOriginMutation(
        new Request("https://cms.zyron.test/api/admin/media", {
          method: "POST",
          headers: { origin: "https://cms.zyron.test", "sec-fetch-site": "same-origin" },
        }),
      ),
    ).not.toThrow();
  });

  it.each([
    [{ origin: "https://attacker.test", "sec-fetch-site": "cross-site" }],
    [{ origin: "https://sibling.zyron.test", "sec-fetch-site": "same-site" }],
    [{}],
  ])("rejects untrusted or unverifiable browser mutations", (headers) => {
    expect(() =>
      assertSameOriginMutation(
        new Request("https://cms.zyron.test/api/admin/media", { method: "POST", headers }),
      ),
    ).toThrow(UntrustedOriginError);
  });
});

describe("admin upload request bounds", () => {
  it("accepts a declared request within the hard ceiling", () => {
    expect(() =>
      assertBoundedUploadRequest(
        new Request("https://cms.zyron.test/api/admin/media", {
          headers: { "content-length": String(MAX_ADMIN_UPLOAD_REQUEST_BYTES) },
        }),
      ),
    ).not.toThrow();
  });

  it("rejects oversized and undeclared request bodies before multipart parsing", () => {
    expect(() =>
      assertBoundedUploadRequest(
        new Request("https://cms.zyron.test/api/admin/media", {
          headers: { "content-length": String(MAX_ADMIN_UPLOAD_REQUEST_BYTES + 1) },
        }),
      ),
    ).toThrow(PayloadTooLargeError);
    expect(() =>
      assertBoundedUploadRequest(new Request("https://cms.zyron.test/api/admin/media")),
    ).toThrow(ContentLengthRequiredError);
  });
});
