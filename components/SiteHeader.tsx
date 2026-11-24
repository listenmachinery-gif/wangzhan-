"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronRight, Globe2, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { MachinesMenuCategory, MachinesMenuView } from "@/lib/navigation/machines-menu";
import type { NavigationNode, NavigationSnapshot } from "@/lib/navigation/schema";

type SiteHeaderProps = { navigation: NavigationSnapshot; machinesMenu: MachinesMenuView };
type MobileLevel = { kind: "root" } | { kind: "machines" } | { kind: "category"; categoryId: string };

export function SiteHeader({ navigation, machinesMenu }: SiteHeaderProps) {
  const primary = navigation.primary.filter((item) => item.visible);
  const languages = navigation.languages.filter((item) => item.visible);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileLevel, setMobileLevel] = useState<MobileLevel>({ kind: "root" });
  const [machinesOpen, setMachinesOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState(() => defaultCategory(machinesMenu)?.id ?? "");
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const machinesButtonRef = useRef<HTMLButtonElement>(null);
  const mobileDialogRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimers() {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  function openMachines(immediate = false) {
    clearTimers();
    openTimer.current = setTimeout(() => setMachinesOpen(true), immediate ? 0 : machinesMenu.settings.openDelayMs);
  }

  function closeMachines(immediate = false) {
    clearTimers();
    closeTimer.current = setTimeout(() => setMachinesOpen(false), immediate ? 0 : machinesMenu.settings.closeDelayMs);
  }

  useEffect(() => () => clearTimers(), []);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      clearTimers();
      if (mobileOpen) {
        setMobileOpen(false);
        setMobileLevel({ kind: "root" });
        menuButtonRef.current?.focus();
      } else if (machinesOpen) {
        setMachinesOpen(false);
        machinesButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [machinesOpen, mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; };
  }, [mobileOpen]);

  useEffect(() => {
    if (!machinesOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        clearTimers();
        setMachinesOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [machinesOpen]);

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileLevel({ kind: "root" });
    menuButtonRef.current?.focus();
  };

  function trapMobileFocus(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const focusable = [...(mobileDialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), summary, input:not([disabled]), select:not([disabled])') ?? [])];
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0D10]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="ZYRON Heavy Industry homepage">
          <span className="relative block h-12 w-[190px] overflow-hidden" aria-hidden="true"><Image src="/brand/zyron-header-logo-2026.png" alt="" fill priority sizes="190px" className="object-cover object-center" /></span>
        </Link>
        <nav className="hidden h-full items-center gap-5 lg:flex xl:gap-9" aria-label="Primary navigation">
          {primary.map((item) => item.kind === "PRODUCT_DIRECTORY" && item.href ? (
            <div key={item.id} className="flex h-full items-center gap-1" onPointerEnter={() => openMachines()} onPointerLeave={() => closeMachines()}>
              <Link href={item.href} onFocus={() => openMachines(true)} className="inline-flex h-full items-center text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:text-ignition">{item.label}</Link>
              <button ref={machinesButtonRef} type="button" aria-label="Open Products menu" aria-expanded={machinesOpen} aria-controls="products-mega-menu" onClick={() => machinesOpen ? closeMachines(true) : openMachines(true)} className="grid size-8 place-items-center text-white transition hover:text-ignition"><ChevronDown size={15} className={machinesOpen ? "rotate-180" : ""} /></button>
            </div>
          ) : <DesktopNavigationItem key={item.id} item={item} />)}
        </nav>
        <div className="hidden items-center gap-5 xl:flex">
          {navigation.quote.visible && navigation.quote.href ? <Link href={navigation.quote.href} className="inline-flex h-10 items-center justify-center rounded-sm border border-white/40 px-5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:border-ignition hover:bg-ignition">{navigation.quote.label}</Link> : null}
          {languages.length > 0 ? <LanguageMenu languages={languages} /> : null}
        </div>
        <button ref={menuButtonRef} type="button" aria-label="Open navigation" aria-expanded={mobileOpen} aria-controls="mobile-site-navigation" onClick={() => { setMobileLevel({ kind: "root" }); setMobileOpen(true); }} className="grid h-11 w-11 place-items-center rounded-sm text-white transition hover:text-ignition focus-visible:outline focus-visible:outline-2 focus-visible:outline-ignition lg:hidden"><Menu size={21} /></button>
      </div>

      {machinesOpen && machinesMenu.enabled ? (
        <>
          {machinesMenu.settings.backdrop ? <button type="button" aria-label="Close Products menu" onClick={() => closeMachines(true)} className="fixed inset-x-0 bottom-0 top-[72px] -z-10 bg-black/55" /> : null}
          <div id="products-mega-menu" role="region" aria-label="Products mega menu" data-layout="accurl-dark" data-columns={machinesMenu.settings.desktopColumns} onPointerEnter={() => openMachines(true)} onPointerLeave={() => closeMachines()} onClickCapture={(event) => { if ((event.target as HTMLElement).closest("a")) closeMachines(true); }} className="fixed inset-x-0 top-[72px] overflow-hidden border-t border-[#2A2D32] bg-[#0B0D10] text-white">
            <MachinesDesktopPanel view={machinesMenu} activeCategoryId={activeCategoryId} onActiveCategory={setActiveCategoryId} />
          </div>
        </>
      ) : null}

      {mobileOpen ? (
        <div ref={mobileDialogRef} onKeyDown={trapMobileFocus} className="fixed inset-0 z-[80] bg-white lg:hidden" role="dialog" aria-modal="true" aria-label="Site navigation">
          <div id="mobile-site-navigation" className="flex h-[100dvh] flex-col overflow-hidden bg-white" onClick={(event) => { if ((event.target as HTMLElement).closest("a")) closeMobile(); }}>
            <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-neutral-200 px-5">
              {mobileLevel.kind === "root" ? <p className="text-sm font-semibold uppercase tracking-[0.12em]">Navigation</p> : <button type="button" onClick={() => setMobileLevel(mobileLevel.kind === "category" ? { kind: "machines" } : { kind: "root" })} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold"><ArrowLeft size={18} />Back</button>}
              <button ref={closeButtonRef} type="button" aria-label="Close navigation" onClick={closeMobile} className="grid size-11 place-items-center border border-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ignition"><X size={21} /></button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
              {mobileLevel.kind === "root" ? <MobileRoot primary={primary} onMachines={() => setMobileLevel({ kind: "machines" })} /> : null}
              {mobileLevel.kind === "machines" ? <MobileMachines view={machinesMenu} onCategory={(categoryId) => setMobileLevel({ kind: "category", categoryId })} /> : null}
              {mobileLevel.kind === "category" ? <MobileProducts category={machinesMenu.categories.find((item) => item.id === mobileLevel.categoryId)} view={machinesMenu} /> : null}
            </div>
            {machinesMenu.settings.mobileStickyCta && navigation.quote.visible && navigation.quote.href ? <div className="shrink-0 border-t border-neutral-200 bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-4"><Link href={navigation.quote.href} className="flex h-12 items-center justify-center bg-ignition text-sm font-semibold text-white">{navigation.quote.label}</Link></div> : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function MachinesDesktopPanel({ view, activeCategoryId, onActiveCategory, compact = false }: { view: MachinesMenuView; activeCategoryId: string; onActiveCategory: (id: string) => void; compact?: boolean }) {
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = view.categories.find((item) => item.id === activeCategoryId) ?? defaultCategory(view);
  useEffect(() => () => { if (hoverTimer.current) clearTimeout(hoverTimer.current); }, []);

  if (!active) return <div className="bg-[#0B0D10] p-8 text-sm text-[#A7A7A7]">No published products are available.</div>;

  function scheduleCategory(categoryId: string) {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => onActiveCategory(categoryId), 110);
  }

  const columns = view.settings.desktopColumns === 4 ? "lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-3";
  return <div className={`mx-auto grid overflow-hidden bg-[#0B0D10] text-white ${compact ? "h-[420px] w-full grid-cols-[220px_minmax(0,1fr)] gap-6 p-5" : "h-[min(792px,calc(100dvh-72px))] w-[calc(100%-64px)] max-w-[1280px] grid-cols-[220px_minmax(0,1fr)] gap-6 py-10 pb-12 xl:w-[calc(100%-128px)] xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-10"}`}>
    <aside className="min-h-0 overflow-y-auto border-r border-[#2A2D32] pr-0 [scrollbar-color:#80C900_#16181C] [scrollbar-width:thin]">
      <div role="tablist" aria-label="Product categories" className="grid content-start" style={{ gap: view.settings.categoryRowGap }}>{view.categories.map((category, index) => {
        const selected = active.id === category.id;
        return <Link key={category.id} href={category.href} role="tab" aria-selected={selected} tabIndex={selected ? 0 : -1} onPointerEnter={() => scheduleCategory(category.id)} onPointerLeave={() => { if (hoverTimer.current) clearTimeout(hoverTimer.current); }} onFocus={() => onActiveCategory(category.id)} onClick={() => onActiveCategory(category.id)} onKeyDown={(event) => { if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return; event.preventDefault(); const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? view.categories.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + view.categories.length) % view.categories.length; onActiveCategory(view.categories[nextIndex].id); event.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="tab"]')[nextIndex]?.focus(); }} className={`grid min-h-11 w-full grid-cols-[minmax(0,1fr)_36px] items-center gap-2 border-r-2 pr-3 text-left font-semibold leading-[1.6] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ignition ${selected ? "border-ignition" : "border-transparent hover:text-white"}`} style={{ fontSize: view.settings.categoryFontSize, color: selected ? view.settings.categoryActiveTextColor : view.settings.categoryTextColor, paddingTop: view.settings.categoryRowPaddingY, paddingBottom: view.settings.categoryRowPaddingY }}><span>{category.name}</span>{view.settings.showCounts ? <span className="text-right text-[13px] font-medium text-[#7F8389]">{category.count}</span> : null}</Link>;
      })}</div>
    </aside>
    <div role="region" aria-label={`${active.name} products`} tabIndex={0} className="min-h-0 overflow-y-auto overscroll-contain pr-1 [scrollbar-color:#80C900_#16181C] [scrollbar-width:thin] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ignition">
      {active.products.length > 0 ? <div className={`grid gap-6 ${columns}`}>{active.products.map((product) => <Link key={product.id} href={product.href} aria-label={product.name} className="group/card min-w-0"><span className="relative block aspect-[3/2] overflow-hidden border border-[#2A2D32] bg-[#101214]">{view.settings.showImages ? <Image src={product.image} alt={product.alt} fill loading="eager" sizes="(min-width:1280px) 227px, (min-width:1024px) 190px, 96px" className="object-contain p-2 transition-opacity duration-150 group-hover/card:opacity-80" /> : null}</span><span className="mt-2.5 line-clamp-2 block font-bold leading-[1.25] tracking-[-.01em]" style={{ fontSize: view.settings.productTitleFontSize, color: view.settings.productTitleColor }}>{product.name}</span>{view.settings.showDescriptions ? <span className="mt-1.5 line-clamp-3 block leading-[1.4]" style={{ fontSize: view.settings.productDescriptionFontSize, color: view.settings.productDescriptionColor }}>{product.description}</span> : null}</Link>)}</div> : <p className="py-8 text-sm text-[#A7A7A7]">No products are currently published in this category.</p>}
      <Link href={active.href} className="mt-10 inline-flex min-h-11 items-center gap-3 font-semibold transition-colors hover:text-ignition" style={{ fontSize: view.settings.rightLinkFontSize, color: view.settings.rightLinkColor }}>View all {active.name} <span aria-hidden>→</span></Link>
    </div>
  </div>;
}

function MobileRoot({ primary, onMachines }: { primary: NavigationNode[]; onMachines: () => void }) { return <div className="grid">{primary.map((item) => item.kind === "PRODUCT_DIRECTORY" ? <button key={item.id} type="button" onClick={onMachines} className="flex min-h-14 items-center justify-between border-b border-neutral-200 text-left text-base font-semibold">{item.label}<ChevronRight size={18} /></button> : <MobileNavigationItem key={item.id} item={item} />)}</div>; }
function MobileMachines({ view, onCategory }: { view: MachinesMenuView; onCategory: (id: string) => void }) { return <div><h2 className="text-2xl font-semibold">Products</h2><Link href="/products" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-ignition">View All Products</Link><div className="mt-6 grid">{view.categories.map((category) => <button key={category.id} type="button" onClick={() => onCategory(category.id)} className="flex min-h-16 items-center justify-between gap-4 border-b border-neutral-200 text-left"><span><span className="block text-sm font-semibold">{category.name}</span>{view.settings.showCounts ? <span className="mt-1 block text-xs text-neutral-500">{category.count} products</span> : null}</span><ChevronRight size={18} /></button>)}</div></div>; }
function MobileProducts({ category, view }: { category?: MachinesMenuCategory; view: MachinesMenuView }) { if (!category) return null; return <div><h2 className="text-2xl font-semibold">{category.name}</h2><Link href={category.href} className="mt-2 inline-flex text-sm font-semibold text-ignition">View complete series</Link><div className="mt-6 grid">{category.products.map((product) => <Link key={product.id} href={product.href} aria-label={product.name} className="flex min-h-24 items-center gap-4 border-b border-neutral-200 py-3">{view.settings.mobileShowImages ? <span className="relative h-[72px] w-24 shrink-0 bg-[#F5F5F7]"><Image src={product.image} alt={product.alt} fill sizes="96px" className="object-contain p-1" /></span> : null}<span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{product.name}</span>{view.settings.mobileShowDescriptions ? <span className="mt-1 line-clamp-2 block text-xs leading-5 text-neutral-500">{product.description}</span> : null}</span><ChevronRight size={18} /></Link>)}</div></div>; }
function defaultCategory(view: MachinesMenuView) { return view.categories.find((item) => item.isDefault) ?? view.categories[0]; }
function DesktopNavigationItem({ item }: { item: NavigationNode }) { return item.kind === "GROUP" ? <SimpleDropdown item={item} /> : item.href ? <Link href={item.href} className="inline-flex h-full items-center text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:text-ignition">{item.label}</Link> : null; }
function MobileNavigationItem({ item }: { item: NavigationNode }) { const children = item.children?.filter((child) => child.visible) ?? []; if (item.kind === "GROUP" && children.length) return <details className="group/mobile border-b border-neutral-200 py-4"><summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold">{item.label}<ChevronDown size={16} className="transition group-open/mobile:rotate-180" /></summary><div className="mt-4 grid gap-4 border-l border-neutral-200 pl-4">{children.map((child) => <MobileNavigationItem key={child.id} item={child} />)}</div></details>; return item.href ? <Link href={item.href} className="flex min-h-14 items-center border-b border-neutral-200 text-base font-semibold">{item.label}</Link> : null; }
function SimpleDropdown({ item }: { item: NavigationNode }) { const links = item.children?.filter((child) => child.visible && child.href) ?? []; return <div className="group relative flex h-full items-center"><Link href={item.href ?? "#"} className="inline-flex h-full items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:text-ignition">{item.label}<ChevronDown size={15} /></Link><div className="pointer-events-none absolute left-1/2 top-full w-[230px] -translate-x-1/2 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"><div className="border border-neutral-200 bg-white py-2 shadow-xl">{links.map((link) => <Link key={link.id} href={link.href!} className="block px-5 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-ignition">{link.label}</Link>)}</div></div></div>; }
function LanguageMenu({ languages }: { languages: NavigationSnapshot["languages"] }) { return <div className="group relative"><button type="button" aria-label="Language and global support" className="grid size-10 place-items-center text-white hover:text-ignition"><Globe2 size={24} /></button><div className="pointer-events-none absolute right-0 top-full w-44 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"><div className="border border-neutral-200 bg-white py-2 shadow-xl">{languages.map((item) => <Link key={item.id} href={item.href} className="block px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100">{item.label}</Link>)}</div></div></div>; }
