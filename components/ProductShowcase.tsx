"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ShearingShowcaseImage } from "@/data/shearing-solution-types";

type ProductShowcaseProps = {
  eyebrow: string;
  title: string;
  description: string;
  images: readonly ShearingShowcaseImage[];
};

export default function ProductShowcase({ eyebrow, title, description, images }: ProductShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const showPrevious = useCallback(() => {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  }, [images.length]);
  const showNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (
      isPaused ||
      images.length <= 1 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = window.setInterval(showNext, 5000);
    return () => window.clearInterval(timer);
  }, [images.length, isPaused, showNext]);

  if (images.length === 0) {
    return null;
  }

  const activeImage = images[activeIndex];

  return (
    <section
      data-section="product-showcase"
      data-auto-carousel
      className="bg-[#F3F5F7] px-5 py-16 sm:px-8 lg:py-24"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-end gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5F9400]">{eyebrow}</p>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
              {title}
            </h2>
          </div>
          <p className="border-t-2 border-[#76B900] pt-6 text-base leading-8 text-neutral-600 lg:max-w-2xl">
            {description}
          </p>
        </div>

        <div className="mt-10 overflow-hidden border border-neutral-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
          <div className="relative aspect-[1672/941] overflow-hidden bg-[#E9EEF4]">
            <Image
              key={activeImage.image}
              src={activeImage.image}
              alt={activeImage.alt}
              fill
              sizes="(min-width: 1280px) 1280px, calc(100vw - 40px)"
              className="object-contain"
            />

            <button
              type="button"
              onClick={showPrevious}
              aria-label="Previous product view"
              className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center border border-white/60 bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76B900] focus-visible:ring-offset-2 sm:left-5 sm:size-12"
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Next product view"
              className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center border border-white/60 bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76B900] focus-visible:ring-offset-2 sm:right-5 sm:size-12"
            >
              <ArrowRight className="size-5" aria-hidden="true" />
            </button>

            <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-black/70 px-4 py-2 text-white backdrop-blur-sm sm:bottom-5 sm:left-5">
              <span className="text-xs font-semibold tabular-nums text-[#9EDB36]">
                {String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </span>
              <span className="text-sm font-medium" aria-live="polite">
                {activeImage.label}
              </span>
            </div>
          </div>

          <div className="flex snap-x gap-3 overflow-x-auto p-3 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:p-4">
            {images.map((image, index) => (
              <button
                key={image.image}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show ${image.label}`}
                aria-pressed={index === activeIndex}
                className="group min-w-36 snap-start text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76B900] focus-visible:ring-offset-2 sm:min-w-0"
              >
                <span
                  className={`relative block aspect-[1672/941] overflow-hidden border-2 bg-[#E9EEF4] transition-colors ${
                    index === activeIndex ? "border-[#76B900]" : "border-transparent group-hover:border-neutral-400"
                  }`}
                >
                  <Image
                    src={image.image}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 280px, 144px"
                    className="object-contain transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
                  />
                </span>
                <span
                  className={`mt-2 block text-xs font-semibold uppercase tracking-[0.12em] ${
                    index === activeIndex ? "text-neutral-950" : "text-neutral-500"
                  }`}
                >
                  {image.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
