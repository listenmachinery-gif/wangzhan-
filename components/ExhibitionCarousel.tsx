"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const exhibitionSlides = [
  {
    src: "/brand/exhibition/exhibition-booth-01.png",
    title: "Precision on the show floor.",
    caption: "Full-scale press brake demonstrations with a bold ZYRON booth identity.",
  },
  {
    src: "/brand/exhibition/exhibition-booth-02.png",
    title: "Built to bend. Built to last.",
    caption: "Live machine presentations for visitors, distributors, and production teams.",
  },
  {
    src: "/brand/exhibition/exhibition-booth-03.png",
    title: "Closer to global customers.",
    caption: "Product consultation, technical discussion, and application matching at international exhibitions.",
  },
  {
    src: "/brand/exhibition/exhibition-booth-04.png",
    title: "A stronger industrial presence.",
    caption: "Integrated booth design with press brake solutions for sheet metal fabrication.",
  },
  {
    src: "/brand/exhibition/exhibition-booth-05.png",
    title: "Machines customers can inspect.",
    caption: "Hands-on conversations around control systems, tooling, accuracy, and production performance.",
  },
  {
    src: "/brand/exhibition/exhibition-booth-06.png",
    title: "Engineering in conversation.",
    caption: "On-site teams connect machine capability with real manufacturing requirements.",
  },
];

export default function ExhibitionCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = exhibitionSlides[activeIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % exhibitionSlides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + exhibitionSlides.length) % exhibitionSlides.length);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % exhibitionSlides.length);
  };

  return (
    <section className="overflow-hidden bg-[#0B0D10] px-5 py-14 text-white sm:px-8 lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-6 flex items-center gap-4">
              <span className="h-px w-16 bg-ignition shadow-[0_0_18px_rgba(118,185,0,0.75)]" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ignition">Exhibitions</p>
            </div>
            <h2 className="max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">
              Meet ZYRON on the global show floor.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-zinc-300">
            From live machine demonstrations to technical consultation, our exhibition booths bring ZYRON forming
            solutions closer to customers, dealers, and manufacturing partners worldwide.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-md border border-white/10 bg-black shadow-[0_28px_90px_rgba(0,0,0,0.42)]">
          <div className="relative aspect-[1.05] sm:aspect-[3/2]">
            {exhibitionSlides.map((slide, index) => (
              <Image
                key={slide.src}
                src={slide.src}
                alt={slide.title}
                fill
                sizes="(min-width: 1024px) 92vw, 100vw"
                className={`object-cover transition-opacity duration-700 ${
                  index === activeIndex ? "opacity-100" : "opacity-0"
                }`}
                priority={index === 0}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/10" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-5 p-5 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ignition">
                  Exhibition {String(activeIndex + 1).padStart(2, "0")} / {String(exhibitionSlides.length).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-5xl">{activeSlide.title}</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-200 sm:text-base sm:leading-7">{activeSlide.caption}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Previous exhibition image"
                  onClick={showPrevious}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur transition hover:border-ignition hover:text-ignition"
                >
                  <ArrowLeft size={19} />
                </button>
                <button
                  type="button"
                  aria-label="Next exhibition image"
                  onClick={showNext}
                  className="inline-flex size-11 items-center justify-center rounded-full bg-ignition text-white transition hover:bg-neon"
                >
                  <ArrowRight size={19} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-6 border-t border-white/10">
            {exhibitionSlides.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                aria-label={`Show exhibition image ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`relative aspect-[3/2] overflow-hidden border-r border-white/10 last:border-r-0 ${
                  index === activeIndex ? "opacity-100" : "opacity-55 hover:opacity-85"
                }`}
              >
                <Image
                  src={slide.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 15vw, 17vw"
                  className="object-cover"
                />
                <span
                  className={`absolute inset-x-0 bottom-0 h-1 ${
                    index === activeIndex ? "bg-ignition" : "bg-transparent"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
