"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import type { PublicBanner, PublicBannerMedia } from "@/lib/repositories/banner-repository";

export type BannerPreviewViewport = "desktop" | "tablet" | "mobile";

function BannerMediaElement({ media }: { media: PublicBannerMedia }) {
  if (media.kind === "VIDEO") {
    return <video src={media.url} aria-label={media.alt} autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />;
  }
  return <Image unoptimized fill priority src={media.url} alt={media.alt} sizes="100vw" className="object-cover" />;
}

function ResponsiveBannerMedia({ banner }: { banner: PublicBanner }) {
  const variants = [
    { viewport: "mobile", media: "(max-width: 639px)", value: banner.mobile },
    { viewport: "tablet", media: "(min-width: 640px) and (max-width: 1023px)", value: banner.tablet },
    { viewport: "desktop", media: "(min-width: 1024px)", value: banner.desktop },
  ] as const;
  const images = variants.filter(({ value }) => value.kind === "IMAGE");
  const videos = variants.filter(({ value }) => value.kind === "VIDEO");
  return (
    <div data-responsive-banner-media className="absolute inset-0">
      {images.length ? (
        <picture>
          {images.map((variant) => <source key={variant.viewport} data-banner-viewport={variant.viewport} media={variant.media} srcSet={variant.value.url} type={variant.value.mimeType} />)}
          {/* The transparent fallback prevents an image request when the current mixed-media viewport is video. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt={banner.desktop.alt} className="absolute inset-0 h-full w-full object-cover" />
        </picture>
      ) : null}
      {videos.length ? (
        <video aria-label={banner.desktop.alt} autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover">
          {videos.map((variant) => <source key={variant.viewport} data-banner-viewport={variant.viewport} media={variant.media} src={variant.value.url} type={variant.value.mimeType} />)}
        </video>
      ) : null}
    </div>
  );
}

export function BannerSlide({ banner, previewViewport }: { banner: PublicBanner; previewViewport?: BannerPreviewViewport }) {
  const alignment = banner.textPosition === "LEFT"
    ? "items-start text-left"
    : banner.textPosition === "RIGHT"
      ? "items-end text-right"
      : "items-center text-center";
  const preview = Boolean(previewViewport);
  const selectedMedia = previewViewport ? banner[previewViewport] : null;
  return (
    <div data-banner-slide className={`relative isolate h-full overflow-hidden bg-graphite-950 text-white ${preview ? "min-h-72" : "min-h-[calc(100vh-4rem)]"}`}>
      {selectedMedia ? <BannerMediaElement media={selectedMedia} /> : <ResponsiveBannerMedia banner={banner} />}
      <div className="absolute inset-0" style={{ backgroundColor: `rgb(0 0 0 / ${banner.maskOpacity / 100})` }} />
      <div className={`relative z-10 mx-auto flex h-full max-w-[1440px] flex-col justify-center ${preview ? "min-h-72 px-5 py-8" : "min-h-[calc(100vh-4rem)] px-5 py-20 sm:px-8"} ${alignment}`} style={{ color: banner.textColor }}>
        <p className={`${preview ? "text-[10px]" : "text-sm"} font-semibold uppercase tracking-[0.32em] text-ignition`}>ZYRON Heavy Industry</p>
        <h1 className={`mt-3 max-w-5xl font-semibold leading-[1.02] ${preview ? "text-2xl sm:text-3xl" : "mt-5 text-5xl sm:text-6xl lg:text-7xl"}`}>{banner.title}</h1>
        {banner.subtitle ? <p className={`max-w-3xl ${preview ? "mt-3 text-xs leading-5 sm:text-sm" : "mt-6 text-base leading-8 sm:text-lg"}`}>{banner.subtitle}</p> : null}
        {banner.buttonText && banner.buttonUrl ? preview ? (
          <span className="mt-4 inline-flex h-9 items-center justify-center rounded-sm bg-ignition px-4 text-xs font-semibold text-white">{banner.buttonText}</span>
        ) : (
          <Link href={banner.buttonUrl} className="mt-9 inline-flex h-12 items-center justify-center rounded-sm bg-ignition px-7 text-sm font-semibold text-white transition hover:bg-neon">{banner.buttonText}</Link>
        ) : null}
      </div>
    </div>
  );
}

export function HomeBannerCarousel({ banners }: { banners: PublicBanner[] }) {
  const [index, setIndex] = useState(0);
  const banner = banners[index];
  if (!banner) return null;
  const multiple = banners.length > 1;
  return (
    <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden bg-graphite-950 text-white" aria-roledescription="carousel" aria-label="Featured banners">
      <BannerSlide banner={banner} />
      {multiple ? (
        <div className="absolute inset-x-5 bottom-8 z-20 flex items-center justify-between sm:inset-x-8">
          <button type="button" aria-label="Previous banner" onClick={() => setIndex((index - 1 + banners.length) % banners.length)} className="rounded-full border border-white/40 bg-black/30 p-3 text-white hover:border-ignition"><ChevronLeft aria-hidden="true" /></button>
          <div className="flex gap-2" aria-label="Choose banner">
            {banners.map((item, itemIndex) => <button key={item.id} type="button" aria-label={`Show banner ${itemIndex + 1}`} aria-current={itemIndex === index} onClick={() => setIndex(itemIndex)} className={`h-2.5 rounded-full ${itemIndex === index ? "w-8 bg-ignition" : "w-2.5 bg-white/60"}`} />)}
          </div>
          <button type="button" aria-label="Next banner" onClick={() => setIndex((index + 1) % banners.length)} className="rounded-full border border-white/40 bg-black/30 p-3 text-white hover:border-ignition"><ChevronRight aria-hidden="true" /></button>
        </div>
      ) : null}
    </section>
  );
}
