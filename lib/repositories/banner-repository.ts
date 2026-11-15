import type { Banner, MediaAsset, PrismaClient, PublicationStatus } from "@prisma/client";

import { db } from "@/lib/db/client";

type BannerMedia = Pick<MediaAsset, "id" | "altText" | "mimeType">;

export type BannerWithMedia = Pick<
  Banner,
  | "id" | "name" | "title" | "subtitle" | "buttonText" | "buttonUrl"
  | "textColor" | "textPosition" | "maskOpacity" | "enabled" | "position"
  | "startsAt" | "endsAt"
> & {
  status: PublicationStatus;
  desktopMedia: BannerMedia;
  tabletMedia: BannerMedia | null;
  mobileMedia: BannerMedia | null;
};

export type PublicBannerMedia = { url: string; alt: string; kind: "IMAGE" | "VIDEO"; mimeType: string };
export type PublicBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  textColor: string;
  textPosition: "LEFT" | "CENTER" | "RIGHT";
  maskOpacity: number;
  desktop: PublicBannerMedia;
  tablet: PublicBannerMedia;
  mobile: PublicBannerMedia;
};

export function isBannerActiveAt(banner: Pick<BannerWithMedia, "status" | "enabled" | "startsAt" | "endsAt">, now: Date) {
  return banner.status === "PUBLISHED"
    && banner.enabled
    && (!banner.startsAt || banner.startsAt <= now)
    && (!banner.endsAt || banner.endsAt > now);
}

function publicMedia(media: BannerMedia, fallbackAlt: string): PublicBannerMedia {
  return {
    url: `/api/media/${media.id}`,
    alt: media.altText?.trim() || fallbackAlt,
    kind: media.mimeType.startsWith("video/") ? "VIDEO" : "IMAGE",
    mimeType: media.mimeType,
  };
}

export function toPublicBanner(banner: BannerWithMedia): PublicBanner {
  const desktop = publicMedia(banner.desktopMedia, banner.title);
  const tablet = banner.tabletMedia ? publicMedia(banner.tabletMedia, banner.title) : desktop;
  const mobile = banner.mobileMedia ? publicMedia(banner.mobileMedia, banner.title) : tablet;
  const textPosition = banner.textPosition === "LEFT" || banner.textPosition === "RIGHT" ? banner.textPosition : "CENTER";
  return {
    id: banner.id,
    title: banner.title,
    subtitle: banner.subtitle,
    buttonText: banner.buttonText,
    buttonUrl: banner.buttonUrl,
    textColor: banner.textColor || "#ffffff",
    textPosition,
    maskOpacity: banner.maskOpacity ?? 50,
    desktop,
    tablet,
    mobile,
  };
}

export async function listActiveBanners(now = new Date(), database: PrismaClient = db): Promise<PublicBanner[]> {
  const banners = await database.banner.findMany({
    where: {
      status: "PUBLISHED",
      enabled: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
      ],
      desktopMedia: {
        lifecycleStatus: "ACTIVE",
        OR: [{ mimeType: { startsWith: "image/" } }, { mimeType: { startsWith: "video/" } }],
      },
    },
    include: {
      desktopMedia: { select: { id: true, altText: true, mimeType: true } },
      tabletMedia: { select: { id: true, altText: true, mimeType: true } },
      mobileMedia: { select: { id: true, altText: true, mimeType: true } },
    },
    orderBy: [{ position: "asc" }, { id: "asc" }],
  });
  return banners.map((banner) => toPublicBanner(banner));
}
