"use client";

import { useCallback, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ShearingModelCard } from "@/data/shearing-solution-types";

type ModelCardCarouselProps = {
  cards: readonly ShearingModelCard[];
};

export default function ModelCardCarousel({ cards }: ModelCardCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => (current - 1 + cards.length) % cards.length);
  }, [cards.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % cards.length);
  }, [cards.length]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(cards.length - 1);
    }
  };

  if (cards.length === 0) {
    return null;
  }

  const activeCard = cards[activeIndex];

  return (
    <div
      data-model-card-carousel
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Small electric shearing machine models"
      className="outline-none focus-visible:ring-2 focus-visible:ring-[#76B900] focus-visible:ring-offset-4"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-neutral-600" aria-live="polite">
          Model {activeIndex + 1} of {cards.length}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={showPrevious}
            aria-label="Previous model"
            className="grid size-11 place-items-center border border-neutral-300 bg-white text-neutral-900 transition hover:border-[#76B900] hover:bg-[#76B900] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76B900] motion-reduce:transition-none"
          >
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={showNext}
            aria-label="Next model"
            className="grid size-11 place-items-center border border-neutral-300 bg-white text-neutral-900 transition hover:border-[#76B900] hover:bg-[#76B900] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76B900] motion-reduce:transition-none"
          >
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <article
        key={activeCard.model}
        aria-live="polite"
        className="overflow-hidden border border-neutral-200 bg-[#f3f5f6] shadow-[0_14px_38px_rgba(15,23,42,0.06)]"
      >
        <div className="grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="group relative aspect-[4/3] overflow-hidden bg-white">
            <Image
              src={activeCard.image}
              alt={activeCard.alt}
              fill
              priority={activeIndex === 0}
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
            />
          </div>
          <div className="flex flex-col p-6 sm:p-8 lg:p-10">
            <div className="flex items-center justify-between gap-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#76B900]">Model</p>
              <span className="text-sm font-semibold tabular-nums text-neutral-400">
                {String(activeIndex + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-neutral-950 sm:text-3xl">
              {activeCard.model}
            </h3>
            <dl className="mt-7 grid gap-x-7 sm:grid-cols-2">
              {activeCard.specifications.map((specification) => (
                <div key={specification.label} className="border-t border-neutral-300 py-3.5">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                    {specification.label}
                  </dt>
                  <dd className="mt-1.5 text-base font-semibold leading-6 text-neutral-950">
                    {specification.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </article>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Choose a model">
        {cards.map((card, index) => (
          <button
            key={card.model}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-pressed={index === activeIndex}
            className={`shrink-0 border px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76B900] motion-reduce:transition-none ${
              index === activeIndex
                ? "border-neutral-950 bg-neutral-950 text-white"
                : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-500 hover:text-neutral-950"
            }`}
          >
            {card.model}
          </button>
        ))}
      </div>
    </div>
  );
}
