import { pathToFileURL } from "node:url";

import type { PrismaClient, SeoRecord } from "@prisma/client";

import { ROLES, type Principal, type RoleKey } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { aboutZyronDocument } from "@/lib/page-builder/about-zyron-content";
import { parsePageDocument, PageService } from "@/lib/services/page-service";
import { SeoService } from "@/lib/services/seo-service";

const RELEASE_APPROVAL = "APPROVED_2026_11_26";
const aboutSeo = {
  title: "About ZYRON | Sheet Metal Machinery Manufacturer",
  description: "Learn how ZYRON develops sheet metal machinery through engineering review, manufacturing coordination, inspection, delivery preparation, and support.",
  canonicalUrl: "/factory",
  openGraphTitle: "About ZYRON | Sheet Metal Machinery Manufacturer",
  openGraphDescription: "Explore ZYRON sheet metal machinery, engineering review, manufacturing coordination, inspection, delivery preparation, and technical support.",
  openGraphMediaId: null,
  robotsIndex: true,
  targetKeyword: "sheet metal machinery manufacturer",
} as const;

type PublishEnvironment = Record<string, string | undefined>;

export type AboutPublishResult = {
  changed: boolean;
  pageId: string;
  pageVersion: number;
  seoId: string;
  seoVersion: number;
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

function sameValue(left: unknown, right: unknown) {
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

function sameSeo(record: SeoRecord) {
  return Object.entries(aboutSeo).every(([key, value]) =>
    sameValue(record[key as keyof typeof aboutSeo], value),
  );
}

export async function publishAboutZyron({
  database,
  env,
  apply = false,
  revalidate = () => undefined,
}: {
  database: PrismaClient;
  env: PublishEnvironment;
  apply?: boolean;
  revalidate?: (path: string) => void | Promise<void>;
}): Promise<AboutPublishResult> {
  if (!apply) throw new Error("About ZYRON publisher is in preview mode. Pass --apply to write.");
  if (env.VERCEL_ENV !== "production" || env.ZYRON_ABOUT_RELEASE !== RELEASE_APPROVAL) {
    throw new Error("About ZYRON production approval gate is closed; no content was changed.");
  }
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is required for About ZYRON publication.");

  const email = env.TARGET_ADMIN_EMAIL?.trim().toLowerCase() || "admin@zyroncnc.com";
  const principal = await productionPrincipal(database, email);
  const service = new PageService(database, revalidate);
  let page = await service.getBySlug(principal, "company");
  let pageChanged = false;

  if (!page) {
    page = await service.create(principal, {
      name: "关于 ZYRON",
      slug: "company",
      pageType: "ABOUT",
      document: aboutZyronDocument,
    });
    pageChanged = true;
  } else {
    const published = page.publishedContent ? parsePageDocument(page.publishedContent) : null;
    const draft = parsePageDocument(page.draftContent);
    if (!published || !sameValue(published, aboutZyronDocument)) {
      const preservedSnapshots = (await service.versions(principal, page.id))
        .map((version) => parsePageDocument(version.snapshot));
      const preserveBeforeOverwrite = async (document: typeof draft) => {
        if (preservedSnapshots.some((snapshot) => sameValue(snapshot, document))) return;
        page = await service.saveDraft(principal, page!.id, {
          version: page!.version,
          document,
        });
        preservedSnapshots.push(document);
      };

      await preserveBeforeOverwrite(draft);
      if (published && !sameValue(published, draft)) await preserveBeforeOverwrite(published);
      if (!sameValue(parsePageDocument(page.draftContent), aboutZyronDocument)) {
        page = await service.saveDraft(principal, page.id, {
          version: page.version,
          name: "关于 ZYRON",
          document: aboutZyronDocument,
        });
      }
      pageChanged = true;
    }
  }

  if (pageChanged || page.status !== "PUBLISHED") {
    page = await service.publish(principal, page.id, { version: page.version });
  }

  const seoService = new SeoService(database, revalidate);
  let seo = await database.seoRecord.findUnique({ where: { pathname: "/factory" } });
  let seoChanged = false;
  if (!seo) {
    const created = await seoService.create(principal, {
      pathname: "/factory",
      productId: null,
      ...aboutSeo,
    });
    seo = created.record;
    seoChanged = true;
  } else if (!sameSeo(seo)) {
    const updated = await seoService.update(principal, seo.id, {
      version: seo.version,
      ...aboutSeo,
    });
    seo = updated.record;
    seoChanged = true;
  }

  if (seoChanged || seo.status !== "PUBLISHED") {
    seo = await seoService.publish(principal, seo.id, { version: seo.version });
  }

  return {
    changed: pageChanged || seoChanged,
    pageId: page.id,
    pageVersion: page.version,
    seoId: seo.id,
    seoVersion: seo.version,
  };
}

async function main() {
  try {
    const result = await publishAboutZyron({
      database: db,
      env: process.env,
      apply: process.argv.includes("--apply"),
    });
    console.log(
      `About ZYRON ${result.changed ? "published" : "already current"}: page=${result.pageId} version=${result.pageVersion} seo=${result.seoId} seoVersion=${result.seoVersion}`,
    );
  } finally {
    await db.$disconnect();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "About ZYRON publication failed.");
    process.exitCode = 1;
  });
}
