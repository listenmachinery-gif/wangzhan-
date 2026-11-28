"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, ChevronDown, Grid3X3, List, Search, SlidersHorizontal, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { ProductSelectionCompare } from "@/components/products/ProductSelectionCompare";
import styles from "@/components/products/ProductSelectionCenter.module.css";
import {
  applyProductSelection,
  cardSpecifications,
  filterOptions,
  productDisplay,
  type ProductSelectionContent,
  type ProductSelectionItem,
  type ProductSelectionState,
} from "@/lib/product-selection/config";

type CategoryOption = { slug: string; name: string };
type SelectionStyle = React.CSSProperties & Record<`--${string}`, string | number>;
const storageKey = "zyron-product-comparison-v1";

function stateFromLocation(content: ProductSelectionContent): ProductSelectionState {
  if (typeof window === "undefined") return { query: "", category: content.display.defaultCategorySlug, filters: {}, sort: content.display.defaultSort, page: 1 };
  const params = new URLSearchParams(window.location.search);
  const filters: Record<string, string[]> = {};
  for (const filter of content.filters) {
    const values = params.getAll(`filter.${filter.id}`).map((value) => value.slice(0, 120)).filter(Boolean);
    if (values.length) filters[filter.id] = values;
  }
  const sort = params.get("sort");
  return {
    query: (params.get("explorerQuery") ?? "").slice(0, 240), category: (params.get("category") ?? content.display.defaultCategorySlug).slice(0, 120), filters,
    sort: ["RECOMMENDED", "NEWEST", "NAME_AZ", "NAME_ZA"].includes(sort ?? "") ? sort as ProductSelectionState["sort"] : content.display.defaultSort,
    page: Math.max(1, Number(params.get("page")) || 1),
  };
}

export function ProductSelectionCenter({ content, items, categories, nodeId }: { content: ProductSelectionContent; items: ProductSelectionItem[]; categories: CategoryOption[]; nodeId: string }) {
  const [state, setState] = useState<ProductSelectionState>(() => stateFromLocation(content));
  const [input, setInput] = useState(state.query);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [comparisonReady, setComparisonReady] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setState((current) => ({ ...current, query: input, page: 1 })), 300);
    return () => window.clearTimeout(timer);
  }, [input]);
  useEffect(() => {
    try { const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]"); if (Array.isArray(parsed)) setCompareIds(parsed.filter((id): id is string => typeof id === "string" && items.some((item) => item.id === id)).slice(0, content.compare.maxItems)); } catch { window.localStorage.removeItem(storageKey); }
    setComparisonReady(true);
  }, [content.compare.maxItems, items]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    for (const key of [...params.keys()]) if (key === "explorerQuery" || key === "category" || key === "sort" || key === "page" || key.startsWith("filter.")) params.delete(key);
    if (state.query) params.set("explorerQuery", state.query);
    if (state.category) params.set("category", state.category);
    if (state.sort !== content.display.defaultSort) params.set("sort", state.sort);
    if (state.page > 1) params.set("page", String(state.page));
    for (const [id, values] of Object.entries(state.filters)) values.forEach((value) => params.append(`filter.${id}`, value));
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
  }, [content.display.defaultSort, state]);
  useEffect(() => { if (comparisonReady) window.localStorage.setItem(storageKey, JSON.stringify(compareIds)); }, [compareIds, comparisonReady]);

  const result = useMemo(() => applyProductSelection(items, content, state), [content, items, state]);
  const activeFilters = Object.values(state.filters).reduce((count, values) => count + values.length, 0) + (state.category ? 1 : 0);
  const selectedCompare = compareIds.flatMap((id) => items.find((item) => item.id === id) ?? []);
  const visibleFilters = content.filters.filter((filter) => filter.enabled && (!filter.categorySlugs.length || !state.category || filter.categorySlugs.includes(state.category))).filter((filter) => filter.dataType === "NUMBER" || filterOptions(items, filter, state.category).length > 0).sort((a,b) => a.position-b.position);
  const reset = () => { setInput(""); setState({ query: "", category: "", filters: {}, sort: content.display.defaultSort, page: 1 }); };
  const updateFilter = (id: string, value: string, checked = true) => setState((current) => {
    const previous = current.filters[id] ?? [];
    const filter = content.filters.find((candidate) => candidate.id === id);
    const next = filter?.control === "SINGLE_SELECT" || filter?.dataType === "NUMBER" ? (value ? [value] : []) : checked ? Array.from(new Set([...previous, value])) : previous.filter((entry) => entry !== value);
    return { ...current, page: 1, filters: { ...current.filters, [id]: next } };
  });
  const toggleCompare = (id: string) => setCompareIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length >= content.compare.maxItems ? current : [...current, id]);

  if (!content.enabled) return null;
  const style = {
    "--selection-bg": content.design.backgroundColor, "--selection-bg-image": content.design.backgroundImage ? `url("${content.design.backgroundImage}")` : "none",
    "--selection-max": `${content.design.maxWidth}px`, "--selection-py": `${content.design.paddingY}px`, "--selection-px": `${content.design.paddingX}px`,
    "--selection-filter-width": `${content.design.filterWidth}px`, "--selection-gap": `${content.design.gap}px`, "--selection-card": content.design.cardBackground,
    "--selection-border": content.design.cardBorder, "--selection-radius": `${content.design.cardRadius}px`, "--selection-image-bg": content.design.imageBackground,
    "--selection-accent": content.design.accentColor, "--selection-title": content.design.titleColor, "--selection-body": content.design.bodyColor,
    "--selection-title-size": `${content.design.titleSize}px`, "--selection-subtitle-size": `${content.design.subtitleSize}px`, "--selection-body-size": `${content.design.bodySize}px`,
    "--selection-eyebrow-size": `${content.design.eyebrowSize}px`, "--selection-align": content.design.titleAlign,
    "--selection-cols-desktop": content.display.gridColumnsDesktop, "--selection-cols-tablet": content.display.gridColumnsTablet, "--selection-cols-mobile": content.display.gridColumnsMobile,
  } as SelectionStyle;

  const filtersPanel = <div className={styles.filters} data-testid="selection-filters">
    <div className={styles.filtersHeader}><strong>{content.display.filtersLabel}</strong><button onClick={reset}>{content.display.resetAllLabel}</button></div>
    <fieldset className={styles.categoryFilter}><legend>Product Category</legend><label><input type="radio" name={`${nodeId}-category`} checked={!state.category} onChange={() => setState((current) => ({ ...current, category: "", filters: {}, page: 1 }))} />{content.display.allMachinesLabel}<span>{items.length}</span></label>{categories.map((category) => <label key={category.slug}><input type="radio" name={`${nodeId}-category`} checked={state.category === category.slug} onChange={() => setState((current) => ({ ...current, category: category.slug, filters: {}, page: 1 }))} />{category.name}<span>{items.filter((item) => item.categorySlug === category.slug).length}</span></label>)}</fieldset>
    {visibleFilters.map((filter) => <details key={`${filter.id}-${Boolean(state.filters[filter.id]?.length)}`} open={filter.expanded || Boolean(state.filters[filter.id]?.length) || undefined}><summary>{filter.label}<ChevronDown size={16} /></summary><div className={styles.filterOptions}>{filter.dataType === "NUMBER" ? <label><span>{filter.control === "NUMBER_MAX" ? "Maximum" : "Required minimum"}{filter.unit ? ` (${filter.unit})` : ""}</span><input aria-label={filter.label} type="number" min={filter.min ?? undefined} max={filter.max ?? undefined} step={filter.step} value={state.filters[filter.id]?.[0] ?? ""} onChange={(event) => updateFilter(filter.id, event.target.value)} /></label> : filterOptions(items, filter, state.category).map((option) => <label key={option}><input type={filter.control === "SINGLE_SELECT" ? "radio" : "checkbox"} name={filter.control === "SINGLE_SELECT" ? `${nodeId}-${filter.id}` : undefined} checked={state.filters[filter.id]?.includes(option) ?? false} onChange={(event) => updateFilter(filter.id, option, event.target.checked)} />{option}</label>)}</div></details>)}
  </div>;

  return <section id={nodeId} data-product-selection-center style={style} className={styles.section}>
    <div className={styles.container}>
      <header className={styles.intro}><p><span />{content.eyebrow}</p><h2>{content.title}</h2><h3>{content.subtitle}</h3><div>{content.description}</div></header>
      {content.search.enabled ? <form className={styles.searchBar} role="search" onSubmit={(event: FormEvent) => event.preventDefault()}><Search aria-hidden /><input type="search" aria-label="Search machines" value={input} onChange={(event) => setInput(event.target.value)} placeholder={content.search.placeholder} />{input ? <button type="button" aria-label="Clear search" onClick={() => setInput("")}><X size={18} /></button> : null}<button type="submit">{content.search.buttonLabel}</button></form> : null}
      <div className={styles.workspace}>
        <aside className={styles.desktopFilters}>{filtersPanel}</aside>
        <div className={styles.results}>
          <div className={styles.toolbar}><div><button className={styles.mobileFilterButton} onClick={() => setMobileFilters(true)}><SlidersHorizontal size={17} />{content.display.filtersLabel}{activeFilters ? <span>{activeFilters}</span> : null}</button><strong>{state.category ? categories.find((category) => category.slug === state.category)?.name : content.display.allMachinesLabel}</strong><small>{result.total} {content.display.resultsLabel}</small></div><div><label>{content.display.sortLabel}<select value={state.sort} onChange={(event) => setState((current) => ({ ...current, sort: event.target.value as ProductSelectionState["sort"], page: 1 }))}><option value="RECOMMENDED">Recommended</option><option value="NEWEST">Newest</option><option value="NAME_AZ">Name A–Z</option><option value="NAME_ZA">Name Z–A</option></select></label><button aria-label="Grid view" aria-pressed={view === "grid"} onClick={() => setView("grid")}><Grid3X3 size={18} /></button><button aria-label="List view" aria-pressed={view === "list"} onClick={() => setView("list")}><List size={18} /></button></div></div>
          {result.items.length ? <div className={view === "grid" ? styles.grid : styles.list}>{result.items.map((raw) => { const item = productDisplay(raw, content); const selected = compareIds.includes(item.id); return <article key={item.id} className={styles.card}><Link href={`/products/${item.slug}`} className={styles.imageLink}><span>{content.cards.seriesLabel}</span><Image src={item.image} alt={item.imageAlt} fill sizes="(min-width:1280px) 30vw, (min-width:768px) 50vw, 100vw" /></Link><div className={styles.cardBody}><p>{item.categoryName}</p><h3><Link href={`/products/${item.slug}`}>{item.name}</Link></h3><div className={styles.summary}>{item.summary}</div><dl>{cardSpecifications(item, content).map((spec) => <div key={spec.id}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl><div className={styles.cardActions}><Link className={styles.primaryButton} href={`/products/${item.slug}`}>{content.cards.viewLabel}<span aria-hidden>→</span></Link>{content.compare.enabled ? <button aria-pressed={selected} disabled={!selected && compareIds.length >= content.compare.maxItems} onClick={() => toggleCompare(item.id)}>{selected ? <Check size={16} /> : null}{selected ? content.cards.removeCompareLabel : content.cards.compareLabel}</button> : null}</div></div></article>; })}</div> : <div className={styles.emptyState} role="status"><h3>{content.search.noResultsTitle}</h3><p>{content.search.noResultsBody}</p><div><button onClick={reset}>{content.search.resetLabel}</button><Link href={content.consultation.href}>{content.consultation.buttonLabel}</Link></div></div>}
          {result.hasMore ? <button className={styles.loadMore} onClick={() => setState((current) => ({ ...current, page: current.page + 1 }))}>{content.display.loadMoreLabel}</button> : null}
        </div>
      </div>
      {content.consultation.enabled ? <aside className={styles.consultation}><div><p>ENGINEERING SUPPORT</p><h2>{content.consultation.title}</h2><div>{content.consultation.description}</div></div><Link href={`${content.consultation.href}?source=product-explorer${state.category ? `&category=${encodeURIComponent(state.category)}` : ""}${state.query ? `&query=${encodeURIComponent(state.query)}` : ""}`}>{content.consultation.buttonLabel}<span aria-hidden>→</span></Link></aside> : null}
    </div>
    {mobileFilters ? <div className={styles.drawerBackdrop} role="presentation"><aside className={styles.drawer} role="dialog" aria-modal="true" aria-label={content.display.filtersLabel}><header><strong>{content.display.filtersLabel}</strong><button aria-label="Close filters" onClick={() => setMobileFilters(false)}><X /></button></header>{filtersPanel}<footer><button onClick={reset}>{content.display.resetAllLabel}</button><button onClick={() => setMobileFilters(false)}>Apply Filters ({result.total})</button></footer></aside></div> : null}
    <ProductSelectionCompare content={content} items={selectedCompare} onRemove={(id) => setCompareIds((current) => current.filter((item) => item !== id))} onClear={() => setCompareIds([])} open={compareOpen} onOpen={() => setCompareOpen(true)} onClose={() => setCompareOpen(false)} />
  </section>;
}
