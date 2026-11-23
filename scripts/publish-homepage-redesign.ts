import { pathToFileURL } from "node:url";

import type { PrismaClient } from "@prisma/client";

import { ROLES, type Principal, type RoleKey } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { homepageRedesignDocument } from "@/lib/page-builder/default-homepage";
import { parsePageDocument, PageService } from "@/lib/services/page-service";

const RELEASE_APPROVAL = "APPROVED_2026_11_24";

type PublishEnvironment = Record<string, string | undefined>;

export type HomepagePublishResult = {
  changed: boolean;
  slug: "home";
  pageId: string;
  version: number;
};

function canonicalJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonicalJson(item)]),
    );
  }
  return value;
}

function sameDocument(left: unknown, right: unknown) {
  return JSON.stringify(canonicalJson(left)) === JSON.stringify(canonicalJson(right));
}

async function productionPrincipal(database: PrismaClient, email: string): Promise<Principal> {
  const user = await database.user.findUnique({
    where: { email },
    include: { roles: { include: { role: true } } },
  });
  if (!user || !user.isActive) throw new Error(`Active publishing administrator not found: ${email}`);
  const roles = user.roles
    .map(({ role }) => role.key)
    .filter((role): role is RoleKey => ROLES.includes(role as RoleKey));
  if (!roles.length) throw new Error(`Publishing administrator has no recognized role: ${email}`);
  return { id: user.id, email: user.email, name: user.name, roles };
}

export async function publishHomepageRedesign({
  database,
  env,
  revalidate = () => undefined,
}: {
  database: PrismaClient;
  env: PublishEnvironment;
  revalidate?: (path: string) => void | Promise<void>;
}): Promise<HomepagePublishResult> {
  if (env.VERCEL_ENV !== "production" || env.ZYRON_HOMEPAGE_RELEASE !== RELEASE_APPROVAL) {
    throw new Error("Homepage production approval gate is closed; no content was changed.");
  }
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is required for homepage publication.");

  const email = env.TARGET_ADMIN_EMAIL?.trim().toLowerCase() || "admin@zyroncnc.com";
  const principal = await productionPrincipal(database, email);
  const service = new PageService(database, revalidate);
  let page = await service.getBySlug(principal, "home");

  if (page?.publishedContent) {
    const published = parsePageDocument(page.publishedContent);
    if (sameDocument(published, homepageRedesignDocument)) {
      return { changed: false, slug: "home", pageId: page.id, version: page.version };
    }
  }

  if (!page) {
    page = await service.create(principal, {
      name: "ZYRON 首页",
      slug: "home",
      pageType: "HOME",
      document: homepageRedesignDocument,
    });
  } else {
    const currentDraft = parsePageDocument(page.draftContent);
    if (!sameDocument(currentDraft, homepageRedesignDocument)) {
      page = await service.saveDraft(principal, page.id, {
        version: page.version,
        document: homepageRedesignDocument,
      });
    }
  }

  const published = await service.publish(principal, page.id, { version: page.version });
  return { changed: true, slug: "home", pageId: published.id, version: published.version };
}

async function main() {
  try {
    const result = await publishHomepageRedesign({ database: db, env: process.env });
    console.log(`Homepage redesign ${result.changed ? "published" : "already current"}: page=${result.pageId} version=${result.version}`);
  } finally {
    await db.$disconnect();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Homepage publication failed.");
    process.exitCode = 1;
  });
}
