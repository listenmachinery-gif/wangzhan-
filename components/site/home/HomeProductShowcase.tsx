"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export type HomeProductItem = {
  id: string;
  name: string;
  eyebrow: string;
  headline: string;
  description: string;
  buttonText: string;
  image: string;
  href: string;
  alt: string;
};

export type HomeProductShowcaseContent = {
  eyebrow: string;
  heading: string;
  description: string;
  items: HomeProductItem[];
};

export function HomeProductShowcase({ content }: { content: HomeProductShowcaseContent }) {
  const [activeId, setActiveId] = useState(content.items[0]?.id ?? "");
  const active = content.items.find((item) => item.id === activeId) ?? content.items[0];
  if (!active) return null;

  return (
    <section className="overflow-hidden bg-[#0B0D10] px-5 py-20 text-white sm:px-8 lg:py-28">
      <div className="mx-auto max-w-[1440px]">
        <p data-page-text="eyebrow" className="text-sm font-semibold uppercase tracking-[0.2em] text-[#80C900]">{content.eyebrow}</p>
        <h2 data-page-text="heading" className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-5xl">{content.heading}</h2>
        <p data-page-text="description" className="mt-5 max-w-3xl text-base leading-8 text-white/60">{content.description}</p>

        <div className="mt-12 lg:grid lg:grid-cols-[280px_330px_minmax(0,1fr)] lg:items-center lg:gap-10 xl:gap-14">
          <div role="tablist" aria-label="Product series" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-4 lg:mx-0 lg:grid lg:overflow-visible lg:px-0 lg:pb-0">
            {content.items.map((item) => {
              const selected = item.id === active.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`home-product-panel-${item.id}`}
                  id={`home-product-tab-${item.id}`}
                  onClick={() => setActiveId(item.id)}
                  className={`min-h-12 shrink-0 rounded px-4 text-left text-[13px] font-medium tracking-[0.035em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#80C900] lg:w-full ${selected ? "bg-[#80C900] text-[#11160C]" : "bg-white/[0.04] text-[#D9DDE2] hover:bg-white/[0.08] hover:text-white"}`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>

          <div className="relative mt-8 aspect-[2/1] w-full overflow-hidden lg:col-start-3 lg:row-start-1 lg:mt-0 lg:aspect-[1.55/1]">
            <Image
              key={active.image}
              src={active.image}
              alt={active.alt}
              fill
              sizes="(max-width: 1023px) 100vw, 50vw"
              className="object-contain"
            />
          </div>

          <div
            role="tabpanel"
            id={`home-product-panel-${active.id}`}
            aria-labelledby={`home-product-tab-${active.id}`}
            className="mt-8 lg:col-start-2 lg:row-start-1 lg:mt-0"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#80C900]">{active.eyebrow}</p>
            <h3 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">{active.headline}</h3>
            <p className="mt-5 text-sm leading-7 text-white/62 sm:text-base">{active.description}</p>
            <Link href={active.href} className="mt-7 inline-flex border-b border-[#80C900] pb-2 text-sm font-semibold text-white transition-colors hover:text-[#80C900]">
              {active.buttonText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
