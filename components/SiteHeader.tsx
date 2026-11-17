import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronRight, Globe2, Menu } from "lucide-react";

import type { Product, ProductCategory } from "@/data/products";
import { getCategoryHref } from "@/data/products";
import type { NavigationNode, NavigationSnapshot } from "@/lib/navigation/schema";
import { buildProductDirectory } from "@/lib/repositories/public-catalogue-view";

type SiteHeaderProps = {
  navigation: NavigationSnapshot;
  categories: ProductCategory[];
  products: Product[];
};

export function SiteHeader({ navigation, categories, products }: SiteHeaderProps) {
  const primary = navigation.primary.filter((item) => item.visible);
  const languages = navigation.languages.filter((item) => item.visible);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0D10]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="ZYRON Heavy Industry homepage">
          <span className="relative block h-12 w-[190px] overflow-hidden" aria-hidden="true">
            <Image src="/brand/zyron-header-logo-2026.png" alt="" fill priority sizes="190px" className="object-cover object-center" />
          </span>
        </Link>

        <nav className="hidden h-full items-center gap-9 xl:flex" aria-label="Primary navigation">
          {primary.map((item) => (
            <DesktopNavigationItem key={item.id} item={item} categories={categories} products={products} />
          ))}
        </nav>

        <div className="hidden items-center gap-5 xl:flex">
          {navigation.quote.visible && navigation.quote.href ? (
            <Link href={navigation.quote.href} className="inline-flex h-10 items-center justify-center rounded-sm border border-white/40 px-5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:border-ignition hover:bg-ignition hover:text-white">
              {navigation.quote.label}
            </Link>
          ) : null}
          {languages.length > 0 ? <LanguageMenu languages={languages} /> : null}
        </div>

        <details className="mobile-nav relative xl:hidden">
          <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center text-white transition hover:text-ignition" aria-label="Open navigation">
            <Menu size={21} />
          </summary>
          <div className="absolute right-0 top-12 max-h-[78vh] w-[min(88vw,380px)] overflow-auto rounded-md border border-black/10 bg-white p-5 shadow-[0_28px_70px_rgba(15,23,42,0.2)]">
            <div className="grid gap-3">
              {primary.map((item) => <MobileNavigationItem key={item.id} item={item} />)}
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-ignition">Product Directory</p>
            <div className="mt-3 grid gap-2">
              {categories.map((category) => (
                <details key={category.id} className="group/category border-b border-neutral-100 pb-2">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-2 text-sm font-semibold text-neutral-950">
                    {category.navLabel}
                    <ChevronDown size={15} className="shrink-0 transition group-open/category:rotate-180" />
                  </summary>
                  <div className="grid gap-3 pb-3 pl-3">
                    <Link href={getCategoryHref(category.id)} className="text-xs font-semibold uppercase tracking-[0.12em] text-ignition">View complete series</Link>
                    {getDirectory(category.id, products).map((group) => group.isDirectProduct ? (
                      <Link key={group.id} href={`/products/${group.products[0].id}`} className="text-sm leading-5 text-neutral-600">{group.name}</Link>
                    ) : (
                      <div key={group.id}>
                        <p className="text-xs font-semibold text-neutral-900">{group.name}</p>
                        <div className="mt-2 grid gap-2 border-l border-neutral-200 pl-3">
                          {group.products.map((product) => (
                            <Link key={product.id} href={`/products/${product.id}`} className="text-xs leading-5 text-neutral-600">{product.name}</Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>

            {navigation.quote.visible && navigation.quote.href ? (
              <Link href={navigation.quote.href} className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-sm bg-ignition text-sm font-semibold text-white">
                {navigation.quote.label}
              </Link>
            ) : null}

            {languages.length > 0 ? (
              <>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-ignition">Language</p>
                <div className="mt-3 grid gap-2">
                  {languages.map((item) => <Link key={item.id} href={item.href} className="text-sm text-neutral-600">{item.label}</Link>)}
                </div>
              </>
            ) : null}
          </div>
        </details>
      </div>
    </header>
  );
}

function LanguageMenu({ languages }: { languages: NavigationSnapshot["languages"] }) {
  return (
    <div className="group relative flex h-full items-center">
      <button className="grid h-10 w-10 place-items-center text-white transition hover:text-ignition" type="button" aria-label="Language and global support">
        <Globe2 size={25} />
      </button>
      <div className="pointer-events-none absolute right-0 top-full w-[180px] pt-4 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
        <div className="overflow-hidden rounded-b-sm border border-black/10 bg-white py-2 shadow-[0_22px_60px_rgba(15,23,42,0.22)]">
          {languages.map((item) => (
            <Link key={item.id} href={item.href} className="block px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-ignition">{item.label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function DesktopNavigationItem({ item, categories, products }: { item: NavigationNode; categories: ProductCategory[]; products: Product[] }) {
  if (item.kind === "PRODUCT_DIRECTORY" && item.href) {
    return (
      <div className="group relative flex h-full items-center">
        <Link href={item.href} className="inline-flex h-full items-center gap-1 text-xs font-semibold tracking-[0.08em] text-white transition hover:text-ignition">
          {item.label}<ChevronDown size={15} />
        </Link>
        <MachineMegaMenu categories={categories} products={products} />
      </div>
    );
  }
  if (item.kind === "GROUP") return <SimpleDropdown item={item} />;
  return item.href ? <NavItem href={item.href} label={item.label} /> : null;
}

function MobileNavigationItem({ item }: { item: NavigationNode }) {
  const children = item.children?.filter((child) => child.visible && child.href) ?? [];
  if (item.kind === "GROUP" && children.length > 0) {
    return (
      <details className="group/mobile border-b border-neutral-100 pb-3">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-neutral-950">
          {item.label}<ChevronDown size={15} className="transition group-open/mobile:rotate-180" />
        </summary>
        <div className="mt-3 grid gap-3 border-l border-neutral-200 pl-3">
          {children.map((child) => <Link key={child.id} href={child.href!} className="text-sm text-neutral-600">{child.label}</Link>)}
        </div>
      </details>
    );
  }
  return item.href ? <Link href={item.href} className="border-b border-neutral-100 pb-3 text-sm font-semibold text-neutral-950">{item.label}</Link> : null;
}

function NavItem({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="inline-flex h-full items-center text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:text-ignition">{label}</Link>;
}

function SimpleDropdown({ item }: { item: NavigationNode }) {
  const links = item.children?.filter((child) => child.visible && child.href) ?? [];
  return (
    <div className="group relative flex h-full items-center">
      {item.href ? (
        <Link href={item.href} className="inline-flex h-full items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:text-ignition">{item.label}<ChevronDown size={15} /></Link>
      ) : (
        <span className="inline-flex h-full items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-white">{item.label}<ChevronDown size={15} /></span>
      )}
      <div className="pointer-events-none absolute left-1/2 top-full w-[220px] -translate-x-1/2 pt-0 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
        <div className="overflow-hidden rounded-b-sm border border-black/10 bg-white py-2 shadow-[0_22px_60px_rgba(15,23,42,0.22)]">
          {links.map((link) => <Link key={link.id} href={link.href!} className="block px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 hover:text-ignition">{link.label}</Link>)}
        </div>
      </div>
    </div>
  );
}

function MachineMegaMenu({ categories, products }: { categories: ProductCategory[]; products: Product[] }) {
  return (
    <div data-product-cascade-menu className="pointer-events-none absolute left-1/2 top-full z-50 w-[310px] -translate-x-1/2 opacity-0 transition duration-150 group-hover:pointer-events-auto group-hover:opacity-100">
      <div className="border border-neutral-200 bg-white p-2 shadow-[0_28px_75px_rgba(15,23,42,0.22)]">
        <div data-product-menu-level="1" className="grid">
          {categories.map((category) => <CategoryCascadeItem key={category.id} category={category} products={products} />)}
        </div>
      </div>
    </div>
  );
}

function CategoryCascadeItem({ category, products }: { category: ProductCategory; products: Product[] }) {
  const directory = getDirectory(category.id, products);
  return (
    <div className="group/series relative">
      <Link href={getCategoryHref(category.id)} data-product-series-item className="flex min-h-12 items-center justify-between gap-4 px-4 py-3 text-sm font-semibold leading-5 text-neutral-900 transition hover:bg-neutral-100 hover:text-ignition">
        {category.name}<ChevronRight size={16} className="shrink-0 text-neutral-400" />
      </Link>
      <div className="invisible absolute left-full top-[-9px] w-[320px] opacity-0 transition duration-150 group-hover/series:visible group-hover/series:opacity-100">
        <div data-product-menu-level="2" className="border border-neutral-200 bg-white p-2 shadow-[0_28px_75px_rgba(15,23,42,0.2)]">
          {directory.map((group) => group.isDirectProduct ? (
            <Link key={group.id} href={`/products/${group.products[0].id}`} data-product-second-level className="flex min-h-11 items-center px-4 py-2.5 text-sm font-medium leading-5 text-neutral-700 transition hover:bg-neutral-100 hover:text-ignition">{group.name}</Link>
          ) : (
            <div key={group.id} className="group/subcategory relative">
              <Link href={`${getCategoryHref(category.id)}#${group.id}`} data-product-second-level className="flex min-h-11 items-center justify-between gap-4 px-4 py-2.5 text-sm font-semibold leading-5 text-neutral-900 transition hover:bg-neutral-100 hover:text-ignition">
                {group.name}<ChevronRight size={16} className="shrink-0 text-neutral-400" />
              </Link>
              <div className="invisible absolute left-full top-[-9px] w-[310px] opacity-0 transition duration-150 group-hover/subcategory:visible group-hover/subcategory:opacity-100">
                <div data-product-menu-level="3" className="border border-neutral-200 bg-white p-2 shadow-[0_28px_75px_rgba(15,23,42,0.2)]">
                  {group.products.map((product) => <Link key={product.id} href={`/products/${product.id}`} className="flex min-h-11 items-center px-4 py-2.5 text-sm leading-5 text-neutral-700 transition hover:bg-neutral-100 hover:text-ignition">{product.name}</Link>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getDirectory(categoryId: string, products: Product[]) {
  return buildProductDirectory(products.filter((product) => product.categoryId === categoryId));
}
