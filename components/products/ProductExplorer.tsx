"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  type CSSProperties,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import styles from "@/components/products/ProductExplorer.module.css";
import { trackAnalyticsEvent } from "@/lib/analytics/client-events";
import type {
  ProductExplorerContent,
  ProductExplorerCategoryKey,
} from "@/lib/product-explorer/config";

export type ProductExplorerViewProduct = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  image: string;
};

export type ProductExplorerViewCategory = ProductExplorerContent["categories"][number] & {
  categoryName: string;
  categoryHref: string;
  products: ProductExplorerViewProduct[];
};

type ProductExplorerProps = {
  content: ProductExplorerContent;
  categories: ProductExplorerViewCategory[];
  nodeId: string;
};

type ExplorerCss = CSSProperties & Record<`--${string}`, string | number>;

function mediaNeedsUnoptimized(src: string) {
  return src.startsWith("/api/media/");
}

export function ProductExplorer({ content, categories, nodeId }: ProductExplorerProps) {
  const initialKey = categories.some((category) => category.key === content.defaultCategoryKey)
    ? content.defaultCategoryKey
    : categories[0]?.key;
  const [activeKey, setActiveKey] = useState<ProductExplorerCategoryKey | undefined>(initialKey);
  const [progress, setProgress] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activeCategory = useMemo(
    () => categories.find((category) => category.key === activeKey) ?? categories[0],
    [activeKey, categories],
  );

  useEffect(() => {
    scrollerRef.current?.scrollTo({ left: 0, behavior: "auto" });
    setProgress(0);
  }, [activeKey]);

  if (!activeCategory) return null;

  const css: ExplorerCss = {
    "--explorer-max-width": `${content.maxWidth}px`,
    "--explorer-height": `${content.heroHeight}px`,
    "--explorer-background": content.backgroundColor,
    "--explorer-panel": content.panelColor,
    "--explorer-accent": content.accentColor,
    "--explorer-text": content.textColor,
    "--explorer-muted": content.mutedTextColor,
    "--explorer-product-bg": content.productSectionBackground,
    "--explorer-card-bg": content.cardBackground,
    "--explorer-card-border": content.cardBorderColor,
    "--explorer-card-radius": `${content.cardRadius}px`,
    "--explorer-card-gap": `${content.cardGap}px`,
    "--desktop-cards": content.desktopCards,
    "--tablet-cards": content.tabletCards,
    "--mobile-cards": content.mobileCards,
    "--hero-duration": `${content.animationMs}ms`,
    "--machine-scale": activeCategory.desktopScale,
    "--machine-x": `${activeCategory.desktopX}px`,
    "--machine-y": `${activeCategory.desktopY}px`,
    "--machine-tablet-scale": activeCategory.tabletScale,
    "--machine-tablet-x": `${activeCategory.tabletX}px`,
    "--machine-tablet-y": `${activeCategory.tabletY}px`,
    "--machine-mobile-scale": activeCategory.mobileScale,
    "--machine-mobile-x": `${activeCategory.mobileX}px`,
    "--machine-mobile-y": `${activeCategory.mobileY}px`,
  };

  function selectCategory(category: ProductExplorerViewCategory, index: number, focus = false) {
    setActiveKey(category.key);
    trackAnalyticsEvent("product_category_select", {
      category_id: category.key,
      category_name: category.categoryName,
    });
    if (focus) requestAnimationFrame(() => tabRefs.current[index]?.focus());
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % categories.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + categories.length) % categories.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = categories.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    selectCategory(categories[nextIndex], nextIndex, true);
  }

  function scrollProducts(direction: -1 | 1) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.querySelector<HTMLElement>("[data-product-card]");
    const distance = (card?.offsetWidth ?? scroller.clientWidth * 0.8) + content.cardGap;
    scroller.scrollBy({ left: direction * distance, behavior: "smooth" });
  }

  function updateProgress() {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const max = scroller.scrollWidth - scroller.clientWidth;
    setProgress(max <= 0 ? 1 : scroller.scrollLeft / max);
  }

  return (
    <section
      className={styles.explorer}
      data-product-explorer
      data-page-node={nodeId}
      style={css}
    >
      <div className={styles.hero}>
        <div className={styles.heroBackground} data-explorer-background aria-hidden="true">
          <Image
            src={content.backgroundImage}
            alt=""
            fill
            priority
            sizes="100vw"
            unoptimized={mediaNeedsUnoptimized(content.backgroundImage)}
          />
        </div>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.copy} data-explorer-copy>
            <p className={styles.eyebrow} data-page-text="eyebrow"><span aria-hidden="true">/</span>{content.eyebrow}</p>
            <h1 className={styles.title} data-page-text="title">{content.title}</h1>
            <p className={styles.subtitle} data-page-text="subtitle">{content.subtitle}</p>
            <p className={styles.description} data-page-text="description">{content.description}</p>
            <div className={styles.actions}>
              <Link className={styles.primaryAction} href={content.primaryHref} data-page-text="primaryLabel">
                {content.primaryLabel}<ArrowRight aria-hidden="true" size={19} />
              </Link>
              <Link
                className={styles.secondaryAction}
                href={content.secondaryHref}
                data-page-text="secondaryLabel"
                onClick={() => trackAnalyticsEvent("find_my_machine_click", { link_path: content.secondaryHref, placement: "products_explorer_hero" })}
              >
                {content.secondaryLabel}<ArrowRight aria-hidden="true" size={19} />
              </Link>
            </div>
          </div>

          <div className={styles.machineStage} aria-live="polite">
            <span className={styles.watermark} data-explorer-number aria-hidden="true">{activeCategory.number}</span>
            <div className={styles.machineImage} data-explorer-machine>
              <Image
                key={activeCategory.heroImage}
                src={activeCategory.heroImage}
                alt={activeCategory.heroAlt}
                fill
                priority={activeCategory.key === content.defaultCategoryKey}
                sizes="(min-width: 1024px) 58vw, 100vw"
                unoptimized={mediaNeedsUnoptimized(activeCategory.heroImage)}
              />
            </div>
            <div className={styles.seriesMeta} data-explorer-series>
              <strong data-page-text="seriesName"><span aria-hidden="true">/</span>{activeCategory.fullSeriesName}</strong>
              <Link
                href={activeCategory.categoryHref}
                onClick={() => trackAnalyticsEvent("product_series_view", { category_id: activeCategory.key, series_href: activeCategory.categoryHref })}
              >
                {activeCategory.seriesCtaLabel}<ArrowRight aria-hidden="true" size={18} />
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.tabsViewport}>
          <div className={styles.tabs} role="tablist" aria-label="Machine categories">
            {categories.map((category, index) => {
              const active = category.key === activeCategory.key;
              return (
                <button
                  key={category.key}
                  ref={(element) => { tabRefs.current[index] = element; }}
                  type="button"
                  role="tab"
                  id={`product-tab-${category.key}`}
                  aria-label={`${category.number} ${category.navLabel}`}
                  aria-selected={active}
                  aria-controls="product-explorer-panel"
                  tabIndex={active ? 0 : -1}
                  className={active ? styles.activeTab : styles.tab}
                  onClick={() => selectCategory(category, index)}
                  onKeyDown={(event) => onTabKeyDown(event, index)}
                >
                  <span>{category.number}</span><span>{category.navLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.products} id="machine-series">
        <div className={styles.productsInner}>
          <div className={styles.productsHeader}>
            <h2 id="product-explorer-heading" data-page-text="productSectionTitle">
              <span aria-hidden="true">/</span>{activeCategory.productSectionTitle}
            </h2>
            {content.showArrows && activeCategory.products.length > content.desktopCards ? (
              <div className={styles.arrows}>
                <button type="button" aria-label="Previous products" onClick={() => scrollProducts(-1)}><ArrowLeft size={20} /></button>
                <button type="button" aria-label="Next products" onClick={() => scrollProducts(1)}><ArrowRight size={20} /></button>
              </div>
            ) : null}
          </div>
          <div
            id="product-explorer-panel"
            role="tabpanel"
            aria-labelledby={`product-tab-${activeCategory.key}`}
          >
            {activeCategory.products.length ? (
              <div ref={scrollerRef} className={styles.scroller} data-product-scroller onScroll={updateProgress}>
                {activeCategory.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className={styles.productCard}
                    data-product-card
                    onClick={() => trackAnalyticsEvent("product_card_click", {
                      product_id: product.id,
                      product_slug: product.slug,
                      category_id: activeCategory.key,
                    })}
                  >
                    <span className={styles.productImage}>
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1200px) 25vw, (min-width: 640px) 40vw, 84vw"
                        unoptimized={mediaNeedsUnoptimized(product.image)}
                      />
                    </span>
                    <span className={styles.productMeta}>
                      <span className={styles.productName}>{product.name}</span>
                      <ArrowRight aria-hidden="true" size={22} />
                    </span>
                    {product.summary ? <span className={styles.srOnly}>{product.summary}</span> : null}
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No published machines are available in this category yet.</p>
                <Link href={activeCategory.categoryHref}>View Series<ArrowRight aria-hidden="true" size={18} /></Link>
              </div>
            )}
          </div>
          {content.showProgress && activeCategory.products.length > 0 ? (
            <div className={styles.progress} aria-hidden="true"><span style={{ transform: `scaleX(${Math.max(0.08, progress)})` }} /></div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
