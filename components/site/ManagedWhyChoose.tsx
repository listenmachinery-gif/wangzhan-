import Link from "next/link";
import { Headphones, PackageCheck, SlidersHorizontal, Wrench } from "lucide-react";

import { defaultHomepageDocument } from "@/lib/page-builder/default-homepage";
import { getComponentDefinition } from "@/lib/page-builder/registry";
import type { PageNode } from "@/lib/page-builder/schema";

type AdvantagesContent = {
  eyebrow: string; heading: string; description: string;
  items: Array<{ title: string; body: string }>;
  primaryLabel: string; primaryHref: string; secondaryLabel: string; secondaryHref: string;
};

const fallback = defaultHomepageDocument.nodes.find((node) => node.type === "ADVANTAGES")!;
const icons = [SlidersHorizontal, Wrench, PackageCheck, Headphones];

function contentFor(node?: PageNode): AdvantagesContent {
  const candidate = node?.type === "ADVANTAGES" ? node : fallback;
  const parsed = getComponentDefinition("ADVANTAGES")!.contentSchema.safeParse(candidate.content);
  return (parsed.success ? parsed.data : fallback.content) as AdvantagesContent;
}

export function ManagedWhyChoose({ node }: { node?: PageNode }) {
  const content = contentFor(node);
  return <section className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24"><div className="mx-auto max-w-[1440px]"><div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.22em] text-ignition">{content.eyebrow}</p><h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-6xl">{content.heading}</h2></div><p className="max-w-3xl text-base leading-8 text-zinc-400">{content.description}</p></div><div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{content.items.map((item, index) => { const Icon = icons[index % icons.length]; return <div key={`${item.title}-${index}`} className="rounded-sm border border-white/10 bg-white/[0.04] p-7 transition hover:border-ignition"><Icon size={28} className="text-ignition" /><h3 className="mt-5 text-2xl font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-6 text-zinc-400">{item.body}</p></div>; })}</div><div className="mt-10 flex flex-wrap gap-3"><Link href={content.primaryHref} className="inline-flex h-11 items-center justify-center rounded-sm bg-ignition px-5 text-sm font-semibold text-white transition hover:bg-neon">{content.primaryLabel}</Link><Link href={content.secondaryHref} className="inline-flex h-11 items-center justify-center rounded-sm border border-white/25 px-5 text-sm font-semibold text-white transition hover:border-ignition hover:text-ignition">{content.secondaryLabel}</Link></div></div></section>;
}
