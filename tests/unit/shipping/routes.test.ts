import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(), list: vi.fn(), get: vi.fn(), create: vi.fn(), saveDraft: vi.fn(),
  publish: vi.fn(), archive: vi.fn(), versions: vi.fn(), rollback: vi.fn(),
}));

vi.mock("@/lib/auth/guards", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/auth/guards")>(),
  requirePermission: mocks.requirePermission,
}));

vi.mock("@/lib/services/shipping-highlight-service", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/services/shipping-highlight-service")>(),
  ShippingHighlightService: class {
    list = mocks.list; get = mocks.get; create = mocks.create; saveDraft = mocks.saveDraft;
    publish = mocks.publish; archive = mocks.archive; versions = mocks.versions; rollback = mocks.rollback;
  },
}));

import { GET as listHighlights, POST as createHighlight } from "@/app/api/admin/shipping-highlights/route";
import { DELETE as archiveHighlight, GET as getHighlight, PATCH as saveHighlight } from "@/app/api/admin/shipping-highlights/[id]/route";
import { POST as publishHighlight } from "@/app/api/admin/shipping-highlights/[id]/publish/route";
import { POST as rollbackHighlight } from "@/app/api/admin/shipping-highlights/[id]/rollback/route";
import { GET as listVersions } from "@/app/api/admin/shipping-highlights/[id]/versions/route";
import { AuthenticationRequiredError, PermissionDeniedError } from "@/lib/auth/guards";
import { ShippingConflictError, ShippingNotFoundError, ShippingValidationError } from "@/lib/services/shipping-highlight-service";

const principal = { id: "content", email: "content@zyron.test", name: "Content", roles: ["CONTENT_EDITOR"] };
const context = { params: Promise.resolve({ id: "shipping-1" }) };

function request(path: string, method: "POST" | "PATCH" | "DELETE", body: unknown, trusted = true) {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: { "content-type": "application/json", host: "localhost", origin: trusted ? "http://localhost" : "https://evil.test", "sec-fetch-site": trusted ? "same-origin" : "cross-site" },
    body: JSON.stringify(body),
  });
}

describe("shipping highlight administration routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requirePermission.mockResolvedValue(principal);
    mocks.list.mockResolvedValue([]);
    mocks.get.mockResolvedValue({ id: "shipping-1" });
    mocks.create.mockResolvedValue({ id: "shipping-1" });
    mocks.saveDraft.mockResolvedValue({ id: "shipping-1", version: 2 });
    mocks.publish.mockResolvedValue({ id: "shipping-1", status: "PUBLISHED" });
    mocks.archive.mockResolvedValue({ id: "shipping-1", status: "ARCHIVED" });
    mocks.versions.mockResolvedValue([]);
    mocks.rollback.mockResolvedValue({ id: "shipping-1", status: "DRAFT" });
  });

  it("returns 401 and 403 for authentication and permission failures", async () => {
    mocks.requirePermission.mockRejectedValueOnce(new AuthenticationRequiredError());
    expect((await listHighlights(new NextRequest("http://localhost/api/admin/shipping-highlights"))).status).toBe(401);
    mocks.requirePermission.mockRejectedValueOnce(new PermissionDeniedError());
    expect((await getHighlight(new NextRequest("http://localhost/api/admin/shipping-highlights/shipping-1"), context)).status).toBe(403);
  });

  it("rejects cross-site mutations before calling the service", async () => {
    const response = await createHighlight(request("/api/admin/shipping-highlights", "POST", {}, false));
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ code: "UNTRUSTED_ORIGIN" });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("routes list, create, get, save, publish, archive, versions, and rollback with exact permissions", async () => {
    await listHighlights(new NextRequest("http://localhost/api/admin/shipping-highlights?status=DRAFT&query=shear"));
    expect(mocks.list).toHaveBeenCalledWith(principal, { status: "DRAFT", query: "shear" });
    expect(mocks.requirePermission).toHaveBeenCalledWith("shipping.read");

    const createBody = { slug: "shipment", document: {} };
    expect((await createHighlight(request("/api/admin/shipping-highlights", "POST", createBody))).status).toBe(201);
    expect(mocks.create).toHaveBeenCalledWith(principal, createBody);

    await getHighlight(new NextRequest("http://localhost/api/admin/shipping-highlights/shipping-1"), context);
    expect(mocks.get).toHaveBeenCalledWith(principal, "shipping-1");
    await saveHighlight(request("/api/admin/shipping-highlights/shipping-1", "PATCH", { version: 1, document: {} }), context);
    expect(mocks.saveDraft).toHaveBeenCalledWith(principal, "shipping-1", { version: 1, document: {} });
    await publishHighlight(request("/api/admin/shipping-highlights/shipping-1/publish", "POST", { version: 2 }), context);
    expect(mocks.publish).toHaveBeenCalledWith(principal, "shipping-1", { version: 2 });
    await archiveHighlight(request("/api/admin/shipping-highlights/shipping-1", "DELETE", { version: 3 }), context);
    expect(mocks.archive).toHaveBeenCalledWith(principal, "shipping-1", { version: 3 });
    await listVersions(new NextRequest("http://localhost/api/admin/shipping-highlights/shipping-1/versions"), context);
    expect(mocks.versions).toHaveBeenCalledWith(principal, "shipping-1");
    await rollbackHighlight(request("/api/admin/shipping-highlights/shipping-1/rollback", "POST", { version: 3, targetVersion: 1 }), context);
    expect(mocks.rollback).toHaveBeenCalledWith(principal, "shipping-1", { version: 3, targetVersion: 1 });
  });

  it("maps validation, not-found, and conflict errors", async () => {
    mocks.create.mockRejectedValueOnce(new ShippingValidationError("invalid", ["missing cover"]));
    const invalid = await createHighlight(request("/api/admin/shipping-highlights", "POST", {}));
    expect(invalid.status).toBe(400);
    await expect(invalid.json()).resolves.toEqual({ code: "INVALID_SHIPPING_HIGHLIGHT", message: "invalid", details: ["missing cover"] });

    mocks.get.mockRejectedValueOnce(new ShippingNotFoundError());
    expect((await getHighlight(new NextRequest("http://localhost/api/admin/shipping-highlights/missing"), context)).status).toBe(404);
    mocks.publish.mockRejectedValueOnce(new ShippingConflictError("stale version"));
    const conflict = await publishHighlight(request("/api/admin/shipping-highlights/shipping-1/publish", "POST", { version: 1 }), context);
    expect(conflict.status).toBe(409);
    await expect(conflict.json()).resolves.toEqual({ code: "VERSION_CONFLICT", message: "stale version" });
  });

  it("returns a redacted 500 for unknown failures", async () => {
    mocks.list.mockRejectedValueOnce(new Error("DATABASE_URL=postgres://secret"));
    const response = await listHighlights(new NextRequest("http://localhost/api/admin/shipping-highlights"));
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toMatch(/postgres|secret|database_url/i);
  });
});
