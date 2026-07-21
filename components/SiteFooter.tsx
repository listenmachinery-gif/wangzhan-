import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategoryHref, productCategories } from "@/data/products";

const supportLinks = [
  { label: "Contact Support", href: "/contact" },
  { label: "Machine Selection", href: "/contact" },
  { label: "Download Catalog", href: "/products" },
  { label: "Spare Parts", href: "/contact" },
];

const exploreLinks = [
  { label: "Applications", href: "/cases" },
  { label: "Factory & Solutions", href: "/factory" },
  { label: "Insights", href: "/news" },
  { label: "About ZYRON", href: "/factory" },
];

const buyLinks = [
  { label: "Get a Quote", href: "/contact" },
  { label: "Contact an Engineer", href: "/contact" },
  { label: "OEM / ODM Cooperation", href: "/contact" },
  { label: "Distributor Inquiry", href: "/contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8">
        <div className="grid gap-5 border-b border-white/10 pb-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-2xl font-semibold text-white">ZYRON Heavy Industry</p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              One-stop manufacturer of sheet metal machinery, HVAC duct production equipment, laser cutting machines,
              press machines, rolling machines, and shredding solutions.
            </p>
            <div className="mt-5 grid gap-2 text-sm leading-6 text-zinc-400">
              <p>Email: info@zyroncnc.com</p>
              <p>WhatsApp: +8615655537083</p>
              <p>Address: Dongjiao Industrial Park, Bowang Town, Bowang District, Ma&apos;anshan City, Anhui Province, China</p>
            </div>
          </div>
          <Link
            href="/contact"
            className="inline-flex w-fit items-center gap-2 rounded-sm bg-ignition px-5 py-3 text-sm font-semibold text-white transition hover:bg-neon lg:justify-self-end"
          >
            Start a Project
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-10 py-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold text-white">Product Categories</p>
            <div className="mt-4 grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
              {productCategories.map((category) => (
                <Link key={category.id} href={getCategoryHref(category.id)} className="transition hover:text-white">
                  {category.navLabel}
                </Link>
              ))}
            </div>
          </div>

          <FooterColumn title="Service & Support" links={supportLinks} />
          <FooterColumn title="Where to Buy" links={buyLinks} />
          <FooterColumn title="Explore" links={exploreLinks} />
        </div>

        <div className="grid gap-5 border-t border-white/10 pt-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-white">Subscribe for Machinery Updates</p>
            <p className="mt-2 text-sm text-zinc-500">New product releases, buying guides, and production line ideas.</p>
          </div>
          <div className="flex max-w-md gap-2">
            <input
              className="h-11 min-w-0 flex-1 rounded-sm border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-ignition"
              placeholder="Email address"
            />
            <button className="rounded-sm bg-ignition px-4 text-sm font-semibold text-white transition hover:bg-neon">
              Subscribe
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-zinc-500">
        Copyright 2026 ZYRON Heavy Industry. All rights reserved.
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: Array<{ label: string; href: string }> }) {
  return (
    <div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <div className="mt-4 grid gap-3 text-sm text-zinc-400">
        {links.map((link) => (
          <Link key={link.label} href={link.href} className="transition hover:text-white">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
