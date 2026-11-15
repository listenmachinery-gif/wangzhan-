import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { defaultHomepageDocument } from "@/lib/page-builder/default-homepage";
import { getComponentDefinition } from "@/lib/page-builder/registry";
import type { PageNode } from "@/lib/page-builder/schema";

type FactoryContent = {
  eyebrow: string; heading: string; description: string; image: string; imageAlt: string;
  ctaLabel: string; ctaHref: string; stats: Array<{ value: string; label: string }>;
};

const fallback = defaultHomepageDocument.nodes.find((node) => node.type === "FACTORY_STATS")!;

function contentFor(node?: PageNode): FactoryContent {
  const candidate = node?.type === "FACTORY_STATS" ? node : fallback;
  const parsed = getComponentDefinition("FACTORY_STATS")!.contentSchema.safeParse(candidate.content);
  return (parsed.success ? parsed.data : fallback.content) as FactoryContent;
}

export function ManagedCompanyStrength({ node }: { node?: PageNode }) {
  const content = contentFor(node);
  return <section className="relative min-h-screen overflow-hidden bg-graphite-950 px-5 text-white sm:px-8"><Image src={content.image} alt={content.imageAlt} fill sizes="100vw" className="object-cover" /><div className="absolute inset-0 bg-black/24" /><div className="absolute inset-0 bg-gradient-to-r from-black/98 via-black/78 to-black/30" /><div className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.5)_42%,rgba(0,0,0,0.18)_78%,rgba(0,0,0,0.08)_100%)]" /><div className="absolute inset-x-0 bottom-0 h-[52vh] bg-gradient-to-t from-black/98 via-black/68 to-transparent" /><div className="relative z-10 mx-auto grid min-h-screen max-w-[1440px] gap-10 py-16 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:py-24"><div className="max-w-2xl self-center lg:self-end"><p className="text-sm font-semibold uppercase tracking-[0.24em] text-ignition">{content.eyebrow}</p><h2 className="mt-4 text-4xl font-semibold leading-tight drop-shadow-[0_4px_22px_rgba(0,0,0,0.95)] sm:text-6xl">{content.heading}</h2><p className="mt-5 max-w-xl text-base leading-8 text-zinc-100 drop-shadow-[0_3px_16px_rgba(0,0,0,0.95)]">{content.description}</p><Link href={content.ctaHref} className="mt-8 inline-flex items-center gap-2 rounded-sm border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:border-ignition hover:text-ignition">{content.ctaLabel}<ArrowRight size={16} /></Link></div><div className="grid gap-6 self-end sm:grid-cols-2 lg:gap-x-10">{content.stats.map((stat) => <div key={stat.label} className="border-t border-white/25 pt-5"><p className="text-5xl font-semibold tracking-normal text-white">{stat.value}</p><p className="mt-2 text-sm font-medium uppercase tracking-[0.14em] text-zinc-100">{stat.label}</p></div>)}</div></div></section>;
}
