import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, Globe2, Menu } from "lucide-react";
import { getCategoryDirectory, getCategoryHref, productCategories } from "@/data/products";

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

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-ignition">Product Directory</p>
            <div className="mt-3 grid gap-2">
              {productCategories.map((category) => (
                <details key={category.id} className="group/category border-b border-neutral-100 pb-2">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-2 text-sm font-semibold text-neutral-950">
                    {category.navLabel}
                    <ChevronDown size={15} className="shrink-0 transition group-open/category:rotate-180" />
                  </summary>
                  <div className="grid gap-3 pb-3 pl-3">
                    <Link href={getCategoryHref(category.id)} className="text-xs font-semibold uppercase tracking-[0.12em] text-ignition">
                      View complete series
                    </Link>
                    {getCategoryDirectory(category.id).map((group) =>
                      group.isDirectProduct ? (
                        <Link key={group.id} href={`/products/${group.products[0].id}`} className="text-sm leading-5 text-neutral-600">
                          {group.name}
                        </Link>
                      ) : (
                        <div key={group.id}>
                          <p className="text-xs font-semibold text-neutral-900">{group.name}</p>
                          <div className="mt-2 grid gap-2 border-l border-neutral-200 pl-3">
                            {group.products.map((product) => (
                              <Link key={product.id} href={`/products/${product.id}`} className="text-xs leading-5 text-neutral-600">
                                {product.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </details>
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
      <div className="max-h-[calc(100vh-72px)] overflow-y-auto border-y border-white/10 bg-[#0B0D10] shadow-[0_35px_90px_rgba(0,0,0,0.58)]">
        <div className="mx-auto max-w-[1440px] px-8 py-8">
          <div className="flex items-end justify-between gap-10 border-b border-white/10 pb-6 text-white">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ignition">Complete Product Directory</p>
              <h3 className="mt-3 text-3xl font-semibold leading-tight">Eight machine series. Fifty-three production solutions.</h3>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link href="/products" className="inline-flex h-10 items-center justify-center rounded-sm bg-ignition px-5 text-sm font-semibold text-white transition hover:bg-neon">
                All Products
              </Link>
              <Link href="/contact" className="inline-flex h-10 items-center justify-center rounded-sm border border-white/25 px-5 text-sm font-semibold text-white transition hover:border-ignition hover:text-ignition">
                Ask an Engineer
              </Link>
            </div>
          </div>

          <div className="grid gap-x-8 gap-y-9 py-8 md:grid-cols-2 xl:grid-cols-4">
            {productCategories.map((category) => (
              <CategoryColumn key={category.id} categoryId={category.id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryColumn({ categoryId }: { categoryId: string }) {
  const category = productCategories.find((item) => item.id === categoryId);

  if (!category) {
    return null;
  }

  const directory = getCategoryDirectory(category.id);

  return (
    <div className="min-w-0">
      <Link
        href={getCategoryHref(category.id)}
        className="group/category flex items-start justify-between gap-3 border-b border-white/15 pb-3 text-sm font-semibold leading-5 text-white transition hover:text-ignition"
      >
        {category.name}
        <ArrowRight size={14} className="mt-1 shrink-0 opacity-60 transition group-hover/category:translate-x-1" />
      </Link>
      <div className="mt-4 grid gap-3">
        {directory.map((group) =>
          group.isDirectProduct ? (
            <Link key={group.id} href={`/products/${group.products[0].id}`} className="text-xs leading-5 text-zinc-400 transition hover:text-ignition">
              {group.name}
            </Link>
          ) : (
            <div key={group.id}>
              <Link
                href={`${getCategoryHref(category.id)}#${group.id}`}
                className="text-xs font-semibold leading-5 text-zinc-200 transition hover:text-ignition"
              >
                {group.name}
              </Link>
              <div className="mt-2 grid gap-1.5 border-l border-white/10 pl-3">
                {group.products.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`} className="text-[11px] leading-5 text-zinc-500 transition hover:text-ignition">
                    {product.name}
                  </Link>
                ))}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
