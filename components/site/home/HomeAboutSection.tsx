"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type HomeAboutContent = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  ctaLabel: string;
  ctaHref: string;
  stats: Array<{ value: number; suffix: string; unit: string; label: string }>;
};

function CountUpValue({ value, suffix }: { value: number; suffix: string }) {
  const [displayValue, setDisplayValue] = useState(value);
  const valueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = valueRef.current;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (!node || reducedMotion || typeof IntersectionObserver === "undefined") {
      setDisplayValue(value);
      return;
    }

    setDisplayValue(0);
    let animationFrame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      const startedAt = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / 900, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(value * eased));
        if (progress < 1) animationFrame = requestAnimationFrame(tick);
      };
      animationFrame = requestAnimationFrame(tick);
    }, { threshold: 0.25 });
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [value]);

  return <span ref={valueRef}>{displayValue.toLocaleString("en-US")}{suffix}</span>;
}

export function HomeAboutSection({ content }: { content: HomeAboutContent }) {
  return (
    <section className="bg-[#F5F6F7] px-5 py-20 text-[#1A1D21] sm:px-8 lg:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)] lg:items-center lg:gap-20">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-white">
          <Image
            src={content.image}
            alt={content.imageAlt}
            fill
            sizes="(max-width: 1023px) 100vw, 48vw"
            className="object-contain"
          />
        </div>
        <div>
          <p data-page-text="eyebrow" className="text-sm font-semibold uppercase tracking-[0.2em] text-[#76B900]">{content.eyebrow}</p>
          <h2 data-page-text="title" className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.1] tracking-[-0.025em] sm:text-5xl">{content.title}</h2>
          <div data-page-text="description" className="mt-6 max-w-2xl whitespace-pre-line text-base leading-[1.75] text-[#595E66]">{content.description}</div>
          <div className="mt-8 border-t border-black/10 pt-8">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-8">
              {content.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs font-medium uppercase tracking-[0.08em] text-[#6B7178]">{stat.label}</dt>
                  <dd className="mt-2 flex flex-wrap items-baseline gap-2">
                    <span className="text-3xl font-semibold tracking-[-0.03em] sm:text-[42px]">
                      <CountUpValue value={stat.value} suffix={stat.suffix} />
                    </span>
                    {stat.unit ? <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#4B5158] sm:text-sm">{stat.unit}</span> : null}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <Link data-page-text="ctaLabel" href={content.ctaHref} className="mt-8 inline-flex border-b border-[#76B900] pb-1 text-sm font-semibold text-[#1A1D21] transition-colors hover:text-[#5C9000]">
            {content.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
