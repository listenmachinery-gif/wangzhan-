import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_NAVIGATION } from "@/lib/navigation/default-navigation";

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  get: vi.fn(),
  saveDraft: vi.fn(),
  publish: vi.fn(),
  versions: vi.fn(),
  rollback: vi.fn(),
}));

vi.mock("@/lib/auth/guards", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/auth/guards")>(),
  requirePermission: mocks.requirePermission,
}));

vi.mock("@/lib/services/navigation-service", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/services/navigation-service")>(),
  NavigationService: class {
    get = mocks.get;
    saveDraft = mocks.saveDraft;
    publish = mocks.publish;
    versions = mocks.versions;
    rollback = mocks.rollback;
  },
}));

import { GET as getNavigation, PATCH as saveNavigation } from "@/app/api/admin/navigation/route";
import { POST as publishNavigation } from "@/app/api/admin/navigation/publish/route";
import { POST as rollbackNavigation } from "@/app/api/admin/navigation/rollback/route";
import { GET as getNavigationVersions } from "@/app/api/admin/navigation/versions/route";
import { AuthenticationRequiredError } from "@/lib/auth/guards";
import {
  NavigationConflictError,
  NavigationValidationError,
} from "@/lib/services/navigation-service";

const principal = { id: "content", email: "content@zyron.test", name: "Content", roles: ["CONTENT_EDITOR"] };

function mutationRequest(path: string, method: "PATCH" | "POST", body: unknown, trusted = true) {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      host: "localhost",
      origin: trusted ? "http://localhost" : "https://evil.test",
      "sec-fetch-site": trusted ? "same-origin" : "cross-site",
    },
    body: JSON.stringify(body),
  });
}

describe("navigation administration routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requirePermission.mockResolvedValue(principal);
    mocks.get.mockResolvedValue({ key: "PRIMARY", version: 0, draftContent: DEFAULT_NAVIGATION });
    mocks.saveDraft.mockResolvedValue({ key: "PRIMARY", version: 1, draftContent: DEFAULT_NAVIGATION });
    mocks.publish.mockResolvedValue({ key: "PRIMARY", version: 2, publishedContent: DEFAULT_NAVIGATION });
    mocks.versions.mockResolvedValue([]);
    mocks.rollback.mockResolvedValue({ key: "PRIMARY", version: 3, draftContent: DEFAULT_NAVIGATION });
  });

  it("returns 401 without an authenticated administrator", async () => {
    mocks.requirePermission.mockRejectedValueOnce(new AuthenticationRequiredError("Authentication required."));
    const response = await getNavigation();
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ code: "UNAUTHENTICATED" });
  });

  it("rejects a cross-site draft mutation before calling the service", async () => {
    const response = await saveNavigation(mutationRequest(
      "/api/admin/navigation",
      "PATCH",
      { version: 0, document: DEFAULT_NAVIGATION },
      false,
    ));
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ code: "UNTRUSTED_ORIGIN" });
    expect(mocks.saveDraft).not.toHaveBeenCalled();
  });

  it("saves, publishes, lists versions, and rolls back with exact permissions", async () => {
    const saveResponse = await saveNavigation(mutationRequest(
      "/api/admin/navigation",
      "PATCH",
      { version: 0, document: DEFAULT_NAVIGATION },
    ));
    expect(saveResponse.status).toBe(200);
    expect(mocks.requirePermission).toHaveBeenCalledWith("navigation.write");
    expect(mocks.saveDraft).toHaveBeenCalledWith(principal, { version: 0, document: DEFAULT_NAVIGATION });

    const publishResponse = await publishNavigation(mutationRequest(
      "/api/admin/navigation/publish",
      "POST",
      { version: 1 },
    ));
    expect(publishResponse.status).toBe(200);
    expect(mocks.requirePermission).toHaveBeenCalledWith("navigation.publish");
    expect(mocks.publish).toHaveBeenCalledWith(principal, { version: 1 });

    const versionsResponse = await getNavigationVersions();
    expect(versionsResponse.status).toBe(200);
    expect(mocks.requirePermission).toHaveBeenCalledWith("navigation.read");
    expect(mocks.versions).toHaveBeenCalledWith(principal);

    const rollbackResponse = await rollbackNavigation(mutationRequest(
      "/api/admin/navigation/rollback",
      "POST",
      { version: 2, targetVersion: 1 },
    ));
    expect(rollbackResponse.status).toBe(200);
    expect(mocks.rollback).toHaveBeenCalledWith(principal, { version: 2, targetVersion: 1 });
  });

  it("maps validation and version conflicts without exposing internal errors", async () => {
    mocks.saveDraft.mockRejectedValueOnce(new NavigationValidationError("invalid node"));
    const invalid = await saveNavigation(mutationRequest(
      "/api/admin/navigation",
      "PATCH",
      { version: 0, document: {} },
    ));
    expect(invalid.status).toBe(400);
    await expect(invalid.json()).resolves.toMatchObject({ code: "INVALID_NAVIGATION" });

    mocks.publish.mockRejectedValueOnce(new NavigationConflictError("stale version"));
    const conflict = await publishNavigation(mutationRequest(
      "/api/admin/navigation/publish",
      "POST",
      { version: 1 },
    ));
    expect(conflict.status).toBe(409);
    await expect(conflict.json()).resolves.toEqual({ code: "VERSION_CONFLICT", message: "stale version" });

    mocks.get.mockRejectedValueOnce(new Error("DATABASE_URL=postgres://secret"));
    const failed = await getNavigation();
    expect(failed.status).toBe(500);
    expect(JSON.stringify(await failed.json())).not.toMatch(/postgres|secret|database_url/i);
  });
});
