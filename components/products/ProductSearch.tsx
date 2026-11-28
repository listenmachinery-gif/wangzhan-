"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

import styles from "@/components/products/ProductSearch.module.css";
import { trackAnalyticsEvent } from "@/lib/analytics/client-events";
import {
  rankProductSearchResults,
  type ProductSearchContent,
  type ProductSearchIndexItem,
} from "@/lib/product-search/config";

type Props = {
  content: ProductSearchContent;
  index: ProductSearchIndexItem[];
  nodeId: string;
};

type SearchStyle = React.CSSProperties & Record<`--${string}`, string | number>;

function IconMask({ src, size, color, hoverColor }: { src: string; size: number; color: string; hoverColor?: string }) {
  return (
    <span
      aria-hidden="true"
      className={styles.iconMask}
      data-icon-src={src}
      style={{
        "--icon-url": `url("${src}")`,
        "--icon-size": `${size}px`,
        "--icon-color": color,
        "--icon-hover-color": hoverColor ?? color,
      } as SearchStyle}
    />
  );
}

function safeSearchHref(query: string) {
  const params = new URLSearchParams({ q: query.trim() });
  return `/products/search?${params.toString()}`;
}

export function ProductSearch({ content, index, nodeId }: Props) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), content.debounceMs);
    return () => window.clearTimeout(timer);
  }, [content.debounceMs, query]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const results = useMemo(
    () => rankProductSearchResults(debouncedQuery, index, content.suggestionLimit),
    [content.suggestionLimit, debouncedQuery, index],
  );
  const isLoading = query.trim().length >= 2 && query !== debouncedQuery;
  const hasQuery = debouncedQuery.trim().length >= 2;
  const showSuggestions = open && query.trim().length >= 2;
  const viewAllHref = safeSearchHref(query);

  useEffect(() => {
    if (!hasQuery || isLoading) return;
    trackAnalyticsEvent("product_search", { query_length: debouncedQuery.trim().length, result_count: results.length });
    if (results.length === 0) trackAnalyticsEvent("product_search_no_results", { query_length: debouncedQuery.trim().length });
  }, [debouncedQuery, hasQuery, isLoading, results.length]);

  if (!content.enabled) return null;

  const gradientDirection = {
    "to-right": "90deg",
    "to-bottom": "180deg",
    "to-bottom-right": "135deg",
  }[content.background.gradientDirection];
  const sectionStyle = {
    "--search-bg-desktop": `url("${content.background.desktopImage}")`,
    "--search-bg-tablet": `url("${content.background.tabletImage}")`,
    "--search-bg-mobile": `url("${content.background.mobileImage}")`,
    "--search-bg-position-desktop": content.background.desktopPosition,
    "--search-bg-position-tablet": content.background.tabletPosition,
    "--search-bg-position-mobile": content.background.mobilePosition,
    "--search-bg-size": content.background.fit,
    "--search-bg-color": content.background.color,
    "--search-overlay-color": content.background.overlayColor,
    "--search-overlay-opacity": content.background.overlayOpacity / 100,
    "--search-gradient-direction": gradientDirection,
    "--search-gradient-stop": `${content.background.gradientStop}%`,
    "--search-max-width": `${content.appearance.maxWidth}px`,
    "--search-section-height": `${content.appearance.sectionHeight}px`,
    "--search-padding-y": `${content.appearance.paddingY}px`,
    "--search-title-size": `${content.typography.titleSize}px`,
    "--search-title-weight": content.typography.titleWeight,
    "--search-title-leading": content.typography.titleLineHeight,
    "--search-title-color": content.typography.titleColor,
    "--search-accent-color": content.typography.accentColor,
    "--search-copy-size": `${content.typography.descriptionSize}px`,
    "--search-copy-color": content.typography.descriptionColor,
    "--search-eyebrow-size": `${content.typography.eyebrowSize}px`,
    "--search-eyebrow-spacing": `${content.typography.eyebrowSpacing}px`,
    "--search-height": `${content.appearance.searchHeight}px`,
    "--search-width": `${content.appearance.searchWidth}%`,
    "--search-button-width": `${content.appearance.buttonWidth}px`,
    "--search-cut": `${content.appearance.cutSize}px`,
    "--search-border": content.appearance.borderColor,
    "--search-field-bg": content.appearance.searchBackground,
    "--search-field-opacity": content.appearance.searchOpacity / 100,
    "--search-button-bg": content.appearance.buttonColor,
    "--search-button-hover": content.appearance.buttonHoverColor,
    "--search-button-text": content.appearance.buttonTextColor,
    "--search-divider": content.appearance.dividerColor,
    "--search-tablet-title-size": `${content.responsive.tabletTitleSize}px`,
    "--search-tablet-height": `${content.responsive.tabletSearchHeight}px`,
    "--search-mobile-title-size": `${content.responsive.mobileTitleSize}px`,
    "--search-mobile-height": `${content.responsive.mobileSearchHeight}px`,
    "--search-mobile-padding-y": `${content.responsive.mobilePaddingY}px`,
  } as SearchStyle;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (query.trim().length < 2) return;
    trackAnalyticsEvent("product_search", { query_length: query.trim().length, result_count: results.length });
    router.push(viewAllHref);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
      event.preventDefault();
      const product = results[activeIndex];
      trackAnalyticsEvent("product_search_suggestion_click", { product_slug: product.slug, result_position: activeIndex + 1 });
      router.push(`/products/${product.slug}`);
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <section id={nodeId} data-product-search className={styles.section} style={sectionStyle} aria-labelledby={`${nodeId}-title`}>
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.eyebrow}><span aria-hidden="true" />{content.eyebrow}<i aria-hidden="true" /></div>
          <h2 id={`${nodeId}-title`} className={styles.title}>
            <span>{content.titleLineOne}{" "}</span>
            <span><em className={content.typography.accentItalic ? styles.italic : undefined}>{content.titleAccent}</em>{" "}<i className={content.typography.suffixItalic ? styles.italic : undefined}>{content.titleSuffix}</i></span>
          </h2>
          <p className={styles.description}>{content.description}</p>
          <span className={styles.shortRule} aria-hidden="true" />
        </header>

        <div className={styles.searchArea} ref={rootRef}>
          <form className={styles.searchForm} role="search" onSubmit={submit}>
            <div className={styles.searchInputWrap}>
              <IconMask src="/icons/product-search/search.svg" size={46} color="#FFFFFF" />
              <span className={styles.inputDivider} aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                role="combobox"
                aria-label="Search ZYRON products"
                aria-autocomplete="list"
                aria-expanded={showSuggestions}
                aria-controls={`${nodeId}-suggestions`}
                aria-activedescendant={activeIndex >= 0 ? `${nodeId}-suggestion-${activeIndex}` : undefined}
                value={query}
                placeholder={content.placeholder}
                onFocus={() => setOpen(true)}
                onChange={(event) => { setQuery(event.target.value); setOpen(true); setActiveIndex(-1); }}
                onKeyDown={onKeyDown}
              />
            </div>
            <button type="submit" className={styles.searchButton}>
              <span>{content.buttonLabel}</span>
              <IconMask src="/icons/product-search/arrow-right.svg" size={42} color={content.appearance.buttonTextColor} />
            </button>
          </form>

          {showSuggestions ? (
            <div className={styles.suggestions} id={`${nodeId}-suggestions`} role="listbox" aria-label="Product suggestions">
              {isLoading ? <p className={styles.status}>{content.loadingLabel}</p> : null}
              {!isLoading && results.length === 0 ? <p className={styles.status}>{content.noResultsLabel}</p> : null}
              {!isLoading ? results.map((product, resultIndex) => (
                <div
                  key={product.id}
                  id={`${nodeId}-suggestion-${resultIndex}`}
                  role="option"
                  aria-selected={activeIndex === resultIndex}
                  className={`${styles.suggestion} ${activeIndex === resultIndex ? styles.activeSuggestion : ""}`}
                >
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={() => trackAnalyticsEvent("product_search_suggestion_click", { product_slug: product.slug, result_position: resultIndex + 1 })}
                  >
                    <Image src={product.image} alt={product.imageAlt} width={84} height={62} sizes="84px" />
                    <span className={styles.suggestionCopy}>
                      <strong>{product.name}</strong>
                      <small>{product.categoryName}{product.models[0] ? ` · ${product.models[0]}` : ""}</small>
                    </span>
                    <IconMask src="/icons/product-search/arrow-right.svg" size={28} color="#315000" />
                  </Link>
                </div>
              )) : null}
              {!isLoading && results.length > 0 ? (
                <Link className={styles.viewAll} href={viewAllHref}>{content.viewAllLabel}<IconMask src="/icons/product-search/arrow-right.svg" size={24} color="#315000" /></Link>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className={styles.popular} aria-label={content.popularTitle}>
          <div className={styles.popularHeading}><span aria-hidden="true" />{content.popularTitle}</div>
          <div className={styles.popularItems}>
            {content.popularItems.filter((item) => item.visible).map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Search for ${item.label}`}
                onClick={() => {
                  setQuery(item.keyword);
                  setDebouncedQuery(item.keyword);
                  setOpen(true);
                  setActiveIndex(-1);
                  inputRef.current?.focus();
                  trackAnalyticsEvent("popular_search_click", { popular_label: item.label, linked_product_id: item.productId || undefined });
                }}
                style={{ "--popular-color": item.iconColor, "--popular-hover": item.iconHoverColor } as SearchStyle}
              >
                <IconMask src={item.icon} size={item.iconSize} color={item.iconColor} hoverColor={item.iconHoverColor} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.benefitBand}>
        <div className={styles.benefits}>
          {content.features.filter((feature) => feature.visible).map((feature) => (
            <article key={feature.id}>
              <IconMask src={feature.icon} size={feature.iconSize} color={feature.iconColor} />
              <div><h3>{feature.title}</h3><p>{feature.description}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
