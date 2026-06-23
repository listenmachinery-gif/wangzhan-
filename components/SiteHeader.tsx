import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, Globe2, Menu } from "lucide-react";
import { getCategoryHref, productCategories, products } from "@/data/products";

const machineGroups = [
  {
    label: "Shearing Machine Series",
    href: getCategoryHref("shearing-machines"),
    categoryId: "shearing-machines",
  },
  {
    label: "Bending Machine Series",
    href: getCategoryHref("bending-machines"),
    categoryId: "bending-machines",
  },
  {
    label: "Laser Cutting Machine Series",
    href: getCategoryHref("laser-cutting-machines"),
    categoryId: "laser-cutting-machines",
  },
  {
    label: "Plate Rolling Machine Series",
    href: getCategoryHref("plate-rolling-machines"),
    categoryId: "plate-rolling-machines",
  },
  {
    label: "Press Machine Series",
    href: getCategoryHref("press-machines"),
    categoryId: "press-machines",
  },
  {
    label: "Rectangular Duct Production Series",
    href: getCategoryHref("rectangular-duct-production"),
    categoryId: "rectangular-duct-production",
  },
  {
    label: "Round Duct Production Series",
    href: getCategoryHref("round-duct-production"),
    categoryId: "round-duct-production",
  },
  {
    label: "Shredder Series",
    href: getCategoryHref("shredders"),
    categoryId: "shredders",
  },
];

const aboutLinks = [
  { label: "About ZYRON", href: "/factory" },
  { label: "Factory Showroom", href: "/factory" },
  { label: "Certificates", href: "/#certificates" },
  { label: "Customer Cases", href: "/cases" },
];

const newsLinks = [
  { label: "Company News", href: "/news" },
  { label: "Buying Guides", href: "/news" },
  { label: "Customer Cases", href: "/cases" },
];

const languageLinks = [
  { label: "English", href: "/" },
  { label: "العربية", href: "/" },
  { label: "Français", href: "/" },
  { label: "Deutsch", href: "/" },
  { label: "Português", href: "/" },
  { label: "Русский", href: "/" },
  { label: "Español", href: "/" },
];

const mobileMachineLinks = [
  { label: "All Machines", href: "/products" },
  ...productCategories.map((category) => ({
    label: category.navLabel,
    href: getCategoryHref(category.id),
  })),
];

const mobileLinks = [
  { label: "Home", href: "/" },
  { label: "Company", href: "/factory" },
  { label: "Products", href: "/products" },
  { label: "Support", href: "/contact" },
  { label: "Showcase", href: "/cases" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0D10]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="ZYRON Heavy Industry homepage">
          <Image
            src="/brand/zyron-logo.png"
            alt="ZYRON Heavy Industry"
            width={178}
            height={48}
            priority
            className="h-12 w-auto object-contain"
          />
        </Link>

        <nav className="hidden h-full items-center gap-9 xl:flex" aria-label="Primary navigation">
          <NavItem href="/" label="HOME" />

          <SimpleDropdown label="COMPANY" href="/factory" links={aboutLinks} />

          <div className="group flex h-full items-center">
            <Link href="/products" className="inline-flex h-full items-center gap-1 text-xs font-semibold tracking-[0.08em] text-white transition hover:text-ignition">
              PRODUCTS
              <ChevronDown size={15} />
            </Link>
            <MachineMegaMenu />
          </div>

          <SimpleDropdown label="SUPPORT" href="/contact" links={newsLinks} />
          <NavItem href="/cases" label="SHOWCASE" />
          <NavItem href="/contact" label="CONTACT" />
        </nav>

        <div className="hidden items-center gap-5 xl:flex">
          <Link
            href="/contact"
            className="inline-flex h-10 items-center justify-center rounded-sm border border-white/40 px-5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:border-ignition hover:bg-ignition hover:text-white"
          >
            Quote Now
          </Link>
          <div className="group relative flex h-full items-center">
            <button
              className="grid h-10 w-10 place-items-center text-white transition hover:text-ignition"
              type="button"
              aria-label="Language and global support"
            >
              <Globe2 size={25} />
            </button>
            <div className="pointer-events-none absolute right-0 top-full w-[180px] pt-4 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
              <div className="overflow-hidden rounded-b-sm border border-black/10 bg-white py-2 shadow-[0_22px_60px_rgba(15,23,42,0.22)]">
                {languageLinks.map((item) => (
                  <Link key={item.label} href={item.href} className="block px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-ignition">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <details className="mobile-nav relative xl:hidden">
          <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center text-white transition hover:text-ignition" aria-label="Open navigation">
            <Menu size={21} />
          </summary>
          <div className="absolute right-0 top-12 max-h-[78vh] w-[min(88vw,380px)] overflow-auto rounded-md border border-black/10 bg-white p-5 shadow-[0_28px_70px_rgba(15,23,42,0.2)]">
            <div className="grid gap-3">
              {mobileLinks.map((item) => (
                <Link key={item.label} href={item.href} className="border-b border-neutral-100 pb-3 text-sm font-semibold text-neutral-950">
                  {item.label}
                </Link>
              ))}
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-ignition">Machine</p>
            <div className="mt-3 grid gap-2">
              {mobileMachineLinks.map((item) => (
                <Link key={item.label} href={item.href} className="text-sm text-neutral-600">
                  {item.label}
                </Link>
              ))}
            </div>

            <Link
              href="/contact"
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-sm bg-ignition text-sm font-semibold text-white"
            >
              Quote Now
            </Link>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-ignition">Language</p>
            <div className="mt-3 grid gap-2">
              {languageLinks.map((item) => (
                <Link key={item.label} href={item.href} className="text-sm text-neutral-600">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex h-full items-center text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:text-ignition">
      {label}
    </Link>
  );
}

function SimpleDropdown({ label, href, links }: { label: string; href: string; links: { label: string; href: string }[] }) {
  return (
    <div className="group relative flex h-full items-center">
      <Link href={href} className="inline-flex h-full items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:text-ignition">
        {label}
        <ChevronDown size={15} />
      </Link>
      <div className="pointer-events-none absolute left-1/2 top-full w-[220px] -translate-x-1/2 pt-0 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
        <div className="overflow-hidden rounded-b-sm border border-black/10 bg-white py-2 shadow-[0_22px_60px_rgba(15,23,42,0.22)]">
          {links.map((item) => (
            <Link key={item.label} href={item.href} className="block px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 hover:text-ignition">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function MachineMegaMenu() {
  return (
    <div className="pointer-events-none fixed left-0 top-[72px] z-50 w-screen opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
      <div className="border-y border-white/10 bg-[#0B0D10] shadow-[0_35px_90px_rgba(0,0,0,0.58)]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[0.72fr_1.28fr] gap-8 px-8 py-9">
          <div className="border-r border-white/10 pr-9 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ignition">Solutions by Process</p>
            <h3 className="mt-4 max-w-sm text-4xl font-semibold leading-tight">Find the right machine for your production line.</h3>
            <p className="mt-4 max-w-sm text-sm leading-7 text-zinc-400">
              Start from cutting, bending, rolling, duct production, pressing, or recycling. Then select the matched
              model, control system, tooling, and optional automation.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/products" className="inline-flex h-11 items-center justify-center rounded-sm bg-ignition px-5 text-sm font-semibold text-white transition hover:bg-neon">
                All Products
              </Link>
              <Link href="/contact" className="inline-flex h-11 items-center justify-center rounded-sm border border-white/25 px-5 text-sm font-semibold text-white transition hover:border-ignition hover:text-ignition">
                Ask an Engineer
              </Link>
            </div>
            <div className="mt-9 border-t border-white/10 pt-5 text-xs leading-6 text-zinc-500">
              Quote support: material, thickness, working length, output, voltage, and destination country.
            </div>
          </div>
          <div className="grid grid-cols-4 gap-x-7 gap-y-7">
            {machineGroups.map((group) => (
              <div key={group.label} className="min-w-0">
                <Link href={group.href} className="group/category flex min-h-12 items-start justify-between gap-3 border-b border-white/10 pb-3 text-sm font-semibold leading-5 text-white transition hover:text-ignition">
                  {group.label}
                  <ArrowRight size={14} className="mt-1 shrink-0 opacity-60 transition group-hover/category:translate-x-1" />
                </Link>
                <CategoryColumn categoryId={group.categoryId} compact hideHeading />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryColumn({ categoryId, compact = false, hideHeading = false }: { categoryId: string; compact?: boolean; hideHeading?: boolean }) {
  const category = productCategories.find((item) => item.id === categoryId);

  if (!category) {
    return null;
  }

  const categoryProducts = products.filter((product) => product.categoryId === category.id);
  const shownProducts = compact ? categoryProducts : categoryProducts.slice(0, 4);

  return (
    <div className="mt-3">
      {hideHeading ? null : (
        <Link href={getCategoryHref(category.id)} className="text-sm font-semibold text-white hover:text-ignition">
          {category.navLabel}
        </Link>
      )}
      <p className="mt-2 text-xs leading-5 text-zinc-500">{category.summary}</p>
      <div className="mt-3 grid gap-2">
        {shownProducts.map((product) => (
          <Link key={product.id} href={`/products/${product.id}`} className="text-xs leading-5 text-zinc-400 transition hover:text-ignition">
            {product.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
