import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CookiePreferencesButton } from "@/components/analytics/CookiePreferencesButton";
import { getCategoryHref, productCategories } from "@/data/products";
import { DEFAULT_NAVIGATION } from "@/lib/navigation/default-navigation";
import type { NavigationSnapshot } from "@/lib/navigation/schema";

export function SiteFooter({ navigation }: { navigation: NavigationSnapshot }) {
  const fallbackFooter = DEFAULT_NAVIGATION.footer!;
  const footer = navigation.footer ?? fallbackFooter;
  const categorySection = footer.productCategories ?? fallbackFooter.productCategories!;
  const actionLinks = footer.actionLinks ?? fallbackFooter.actionLinks!;
  const newsletter = footer.newsletter ?? fallbackFooter.newsletter!;
  const legalLinks = footer.legalLinks ?? fallbackFooter.legalLinks!;
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
          {categorySection.visible ? <div className="lg:col-span-2">
            <p className="text-sm font-semibold text-white">{categorySection.label}</p>
            <div className="mt-4 grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
              {productCategories.map((category) => (
                <Link key={category.id} href={getCategoryHref(category.id)} className="transition hover:text-white">{category.navLabel}</Link>
              ))}
            </div>
          </div> : null}

          {navigation.footerGroups.map((group) => (
            <FooterColumn
              key={group.id}
              title={group.label}
              links={group.items
                .filter((item) => item.visible && item.href && item.href !== "/privacy")
                .map((item) => ({ id: item.id, label: item.label, href: item.href! }))}
            />
          ))}
          <FooterColumn
            title={actionLinks.label}
            links={actionLinks.items
              .filter((item) => item.visible && item.href)
              .map((item) => ({ id: item.id, label: item.label, href: item.href! }))}
          />
        </div>

        {newsletter.visible ? <div className="grid gap-5 border-t border-white/10 pt-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-white">{newsletter.title}</p>
            <p className="mt-2 text-sm text-zinc-500">{newsletter.description}</p>
          </div>
          <Link href={newsletter.ctaHref} className="inline-flex w-fit items-center gap-2 rounded-sm border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:border-ignition hover:text-ignition">
            {newsletter.ctaLabel}<ArrowRight size={15} />
          </Link>
        </div> : null}
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-xs text-zinc-500">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <span>{footer.copyright}</span>
          {legalLinks.filter((item) => item.visible && item.href).map((item) => (
            <Link key={item.id} href={item.href!} className="transition hover:text-white">{item.label}</Link>
          ))}
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
