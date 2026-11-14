import type { ReactNode } from "react";

import type { ProductModuleType } from "@/lib/product-modules/types";

export function SectionShell({
  type,
  eyebrow,
  title,
  paragraphs,
  children,
  dark = false,
}: {
  type: ProductModuleType;
  eyebrow: string;
  title: string;
  paragraphs?: string[];
  children?: ReactNode;
  dark?: boolean;
}) {
  const headingId = `product-module-${type.toLowerCase()}`;
  return (
    <section
      data-product-module={type}
      aria-labelledby={headingId}
      className={dark ? "bg-neutral-950 px-5 py-16 text-white sm:px-8 lg:py-24" : "bg-white px-5 py-16 text-neutral-950 sm:px-8 lg:py-24"}
    >
      <div className="mx-auto max-w-[1440px]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ignition">{eyebrow}</p>
        <h2 id={headingId} className="mt-4 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">{title}</h2>
        {paragraphs?.map((paragraph) => (
          <p key={paragraph} className={`mt-5 max-w-4xl text-base leading-8 ${dark ? "text-neutral-300" : "text-neutral-600"}`}>
            {paragraph}
          </p>
        ))}
        {children}
      </div>
    </section>
  );
}
