"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ShearingBackgaugeCarousel } from "@/data/shearing-solution-types";

const swipeThreshold = 48;

export default function BackgaugeCarousel({ eyebrow, title, intro, items }: ShearingBackgaugeCarousel) {
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const showPrevious = useCallback(() => {
    setActiveIndex((index) => (index - 1 + items.length) % items.length);
  }, [items.length]);

  const showNext = useCallback(() => {
    setActiveIndex((index) => (index + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (
      items.length <= 1 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = window.setInterval(showNext, 5000);
    return () => window.clearInterval(timer);
  }, [items.length, showNext]);

  if (items.length === 0) {
    return null;
  }

  const activeItem = items[activeIndex] ?? items[0];

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    pointerStart.current = { x: event.clientX, y: event.clientY };
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    pointerStart.current = null;

    if (!start) {
      return;
    }

    const horizontalDistance = event.clientX - start.x;
    const verticalDistance = event.clientY - start.y;

    if (
      Math.abs(horizontalDistance) < swipeThreshold ||
      Math.abs(horizontalDistance) <= Math.abs(verticalDistance)
    ) {
      return;
    }

    if (horizontalDistance < 0) {
      showNext();
    } else {
      showPrevious();
    }
  }

  return (
    <section
      data-section="backgauge-options"
      data-auto-carousel
      className="overflow-hidden bg-[#111519] px-5 py-16 text-white sm:px-8 lg:py-24"
      aria-labelledby="backgauge-options-title"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-end lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#76B900]">{eyebrow}</p>
            <h2
              id="backgauge-options-title"
              className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-5xl"
            >
              {title}
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-white/65 lg:justify-self-end">{intro}</p>
        </div>

        <div className="mt-10 border border-white/10 bg-[#0B0D10] shadow-2xl shadow-black/25 lg:mt-12">
          <div
            className="group relative aspect-[4/3] touch-pan-y overflow-hidden bg-[#0B0D10] sm:aspect-[1705/923]"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => {
              pointerStart.current = null;
            }}
          >
            <Image
              key={activeItem.image}
              src={activeItem.image}
              alt={activeItem.alt}
              fill
              priority={false}
              sizes="(min-width: 1280px) 1280px, (min-width: 640px) calc(100vw - 64px), calc(100vw - 40px)"
              className="select-none object-cover transition-transform duration-700 ease-out group-hover:scale-[1.012] motion-reduce:transform-none motion-reduce:transition-none"
              draggable={false}
            />
            <div
              className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(180deg,transparent_28%,rgba(0,0,0,0.08)_45%,rgba(0,0,0,0.92)_100%)] lg:block"
              aria-hidden="true"
            />

            <button
              type="button"
              onClick={showPrevious}
              aria-label="Previous backgauge option"
              className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white backdrop-blur-sm transition-colors hover:border-[#76B900] hover:bg-[#76B900] hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76B900] focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:left-5 sm:size-12 motion-reduce:transition-none"
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Next backgauge option"
              className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white backdrop-blur-sm transition-colors hover:border-[#76B900] hover:bg-[#76B900] hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76B900] focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:right-5 sm:size-12 motion-reduce:transition-none"
            >
              <ArrowRight className="size-5" aria-hidden="true" />
            </button>

            <div
              className="pointer-events-none absolute inset-x-12 bottom-12 mx-auto hidden max-w-4xl text-center lg:block"
              aria-live="polite"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9EDB36] sm:text-xs">
                Option {String(activeIndex + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-xl font-semibold leading-tight text-white sm:text-3xl lg:text-4xl">
                {activeItem.title}
              </h3>
              <p className="mx-auto mt-2 max-w-3xl text-[13px] leading-5 text-white/80 sm:mt-3 sm:text-base sm:leading-7 lg:text-lg">
                {activeItem.text}
              </p>
            </div>
          </div>

          <div data-mobile-copy-below className="border-t border-white/10 px-5 py-6 text-center lg:hidden" aria-live="polite">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9EDB36] sm:text-xs">
              Option {String(activeIndex + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-2 text-xl font-semibold leading-tight text-white sm:text-3xl">
              {activeItem.title}
            </h3>
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
              {activeItem.text}
            </p>
          </div>

          <div className="grid border-t border-white/10 sm:grid-cols-3" aria-label="Select a backgauge option">
            {items.map((item, index) => (
              <button
                key={item.image}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show ${item.title}`}
                aria-pressed={index === activeIndex}
                className={`group/selector flex min-h-20 items-center gap-4 border-white/10 px-5 py-4 text-left transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#76B900] sm:border-l sm:first:border-l-0 motion-reduce:transition-none ${
                  index === activeIndex ? "bg-white/[0.08]" : "bg-transparent hover:bg-white/[0.04]"
                }`}
              >
                <span
                  className={`text-xs font-semibold tabular-nums transition-colors motion-reduce:transition-none ${
                    index === activeIndex ? "text-[#9EDB36]" : "text-white/35 group-hover/selector:text-white/60"
                  }`}
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={`text-sm font-semibold leading-5 transition-colors motion-reduce:transition-none ${
                    index === activeIndex ? "text-white" : "text-white/55 group-hover/selector:text-white"
                  }`}
                >
                  {item.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
