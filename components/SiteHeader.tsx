import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Globe2, Menu } from "lucide-react";
import { productCategories, products } from "@/data/products";

const machineGroups = [
  {
    label: "Shearing Machine Series",
    href: "/products#shearing-machines",
    categoryId: "shearing-machines",
  },
  {
    label: "Bending Machine Series",
    href: "/products#bending-machines",
    categoryId: "bending-machines",
  },
  {
    label: "Laser Cutting Machine Series",
    href: "/products#laser-cutting-machines",
    categoryId: "laser-cutting-machines",
  },
  {
    label: "Plate Rolling Machine Series",
    href: "/products#plate-rolling-machines",
    categoryId: "plate-rolling-machines",
  },
  {
    label: "Press Machine Series",
    href: "/products#press-machines",
    categoryId: "press-machines",
  },
  {
    label: "Rectangular Duct Production Series",
    href: "/products#rectangular-duct-production",
    categoryId: "rectangular-duct-production",
  },
  {
    label: "Round Duct Production Series",
    href: "/products#round-duct-production",
    categoryId: "round-duct-production",
  },
  {
    label: "Shredder Series",
    href: "/products#shredders",
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
    href: `/products#${category.id}`,
  })),
];

const mobileLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/factory" },
  { label: "Machine", href: "/products" },
  { label: "News", href: "/news" },
  { label: "Shop", href: "/products" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0D10]">
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

        <nav className="hidden h-full items-center gap-7 xl:flex" aria-label="Primary navigation">
          <NavItem href="/" label="Home" />

          <SimpleDropdown label="About" href="/factory" links={aboutLinks} />

          <div className="group flex h-full items-center">
            <Link href="/products" className="inline-flex h-full items-center gap-1 text-sm font-semibold text-white transition hover:text-ignition">
              Machine
              <ChevronDown size={15} />
            </Link>
            <MachineMegaMenu />
          </div>

          <SimpleDropdown label="News" href="/news" links={newsLinks} />
          <NavItem href="/products" label="Shop" />
          <NavItem href="/contact" label="Contact" />

          <div className="group relative flex h-full items-center">
            <button className="inline-flex h-full items-center gap-1 text-sm font-semibold text-white transition hover:text-ignition" type="button">
              <Globe2 size={15} />
              English
              <ChevronDown size={15} />
            </button>
            <div className="pointer-events-none absolute left-1/2 top-full w-[180px] -translate-x-1/2 pt-0 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
              <div className="overflow-hidden rounded-b-sm border border-black/10 bg-white py-2 shadow-[0_22px_60px_rgba(15,23,42,0.22)]">
                {languageLinks.map((item) => (
                  <Link key={item.label} href={item.href} className="block px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-ignition">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

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
    <Link href={href} className="inline-flex h-full items-center text-sm font-semibold text-white transition hover:text-ignition">
      {label}
    </Link>
  );
}

function SimpleDropdown({ label, href, links }: { label: string; href: string; links: { label: string; href: string }[] }) {
  return (
    <div className="group relative flex h-full items-center">
      <Link href={href} className="inline-flex h-full items-center gap-1 text-sm font-semibold text-white transition hover:text-ignition">
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
    <div className="pointer-events-none absolute left-1/2 top-full w-[1120px] -translate-x-1/2 pt-0 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
      <div className="grid grid-cols-[0.7fr_1.3fr] overflow-hidden rounded-b-sm border border-black/10 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
        <div className="bg-neutral-950 p-7 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ignition">Machine</p>
          <h3 className="mt-4 text-3xl font-semibold leading-tight">Sheet metal machinery solutions.</h3>
          <p className="mt-4 text-sm leading-6 text-zinc-300">
            Explore cutting, forming, duct production, and recycling equipment by production workflow.
          </p>
          <Link href="/products" className="mt-7 inline-flex items-center text-sm font-semibold text-ignition transition hover:text-neon">
            All Machines
            <ChevronDown size={15} className="-rotate-90" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-x-7 gap-y-8 p-7">
          {machineGroups.map((group) => (
            <div key={group.label}>
              <Link href={group.href} className="text-sm font-semibold text-neutral-950 transition hover:text-ignition">
                {group.label}
              </Link>
              <CategoryColumn categoryId={group.categoryId} compact hideHeading />
            </div>
          ))}
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
        <Link href={`/products#${category.id}`} className="text-sm font-semibold text-neutral-950 hover:text-ignition">
          {category.navLabel}
        </Link>
      )}
      <p className="mt-2 text-xs leading-5 text-neutral-500">{category.summary}</p>
      <div className="mt-3 grid gap-2">
        {shownProducts.map((product) => (
          <Link key={product.id} href={`/products/${product.id}`} className="text-xs leading-5 text-neutral-500 transition hover:text-neutral-950">
            {product.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
