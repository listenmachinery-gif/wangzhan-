import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CookiePreferencesButton } from "@/components/analytics/CookiePreferencesButton";
import { getCategoryHref, productCategories } from "@/data/products";
import type { NavigationSnapshot } from "@/lib/navigation/schema";

const buyLinks = [
  { id: "quote", label: "Get a Quote", href: "/contact" },
  { id: "engineer", label: "Contact an Engineer", href: "/contact" },
  { id: "oem", label: "OEM / ODM Cooperation", href: "/contact" },
  { id: "distributor", label: "Distributor Inquiry", href: "/contact" },
];

export function SiteFooter({ navigation }: { navigation: NavigationSnapshot }) {
  const footer = navigation.footer ?? {
    brandName: "ZYRON Heavy Industry",
    description: "One-stop manufacturer of sheet metal machinery, HVAC duct production equipment, laser cutting machines, press machines, rolling machines, and shredding solutions.",
    email: "info@zyroncnc.com",
    whatsapp: "+8615655537083",
    address: "Dongjiao Industrial Park, Bowang Town, Bowang District, Ma'anshan City, Anhui Province, China",
    ctaLabel: "Start a Project",
    ctaHref: "/contact",
    copyright: "Copyright 2026 ZYRON Heavy Industry. All rights reserved.",
  };
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8">
        <div className="grid gap-5 border-b border-white/10 pb-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-2xl font-semibold text-white">{footer.brandName}</p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              {footer.description}
            </p>
            <div className="mt-5 grid gap-2 text-sm leading-6 text-zinc-400">
              <p>Email: {footer.email}</p>
              <p>WhatsApp: {footer.whatsapp}</p>
              <p>Address: {footer.address}</p>
            </div>
          </div>
          <Link href={footer.ctaHref} className="inline-flex w-fit items-center gap-2 rounded-sm bg-ignition px-5 py-3 text-sm font-semibold text-white transition hover:bg-neon lg:justify-self-end">
            {footer.ctaLabel}<ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-10 py-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold text-white">Product Categories</p>
            <div className="mt-4 grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
              {productCategories.map((category) => (
                <Link key={category.id} href={getCategoryHref(category.id)} className="transition hover:text-white">{category.navLabel}</Link>
              ))}
            </div>
          </div>

          {navigation.footerGroups.map((group) => (
            <FooterColumn
              key={group.id}
              title={group.label}
              links={group.items
                .filter((item) => item.visible && item.href && item.href !== "/privacy")
                .map((item) => ({ id: item.id, label: item.label, href: item.href! }))}
            />
          ))}
          <FooterColumn title="Where to Buy" links={buyLinks} />
        </div>

        <div className="grid gap-5 border-t border-white/10 pt-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-white">Subscribe for Machinery Updates</p>
            <p className="mt-2 text-sm text-zinc-500">New product releases, machinery updates, and production line ideas.</p>
          </div>
          <div className="flex max-w-md gap-2">
            <input className="h-11 min-w-0 flex-1 rounded-sm border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-ignition" placeholder="Email address" />
            <button className="rounded-sm bg-ignition px-4 text-sm font-semibold text-white transition hover:bg-neon">Subscribe</button>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-xs text-zinc-500">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <span>{footer.copyright}</span>
          <Link href="/privacy" className="transition hover:text-white">Privacy Policy</Link>
          <CookiePreferencesButton />
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: Array<{ id: string; label: string; href: string }> }) {
  return (
    <div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <div className="mt-4 grid gap-3 text-sm text-zinc-400">
        {links.map((link) => <Link key={link.id} href={link.href} className="transition hover:text-white">{link.label}</Link>)}
      </div>
    </div>
  );
}
