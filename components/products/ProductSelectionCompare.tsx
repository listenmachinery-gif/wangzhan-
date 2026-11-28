"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

import styles from "@/components/products/ProductSelectionCenter.module.css";
import { cardSpecifications, productDisplay, type ProductSelectionContent, type ProductSelectionItem } from "@/lib/product-selection/config";

export function ProductSelectionCompare({ content, items, onRemove, onClear, open, onOpen, onClose }: {
  content: ProductSelectionContent; items: ProductSelectionItem[]; onRemove(id: string): void; onClear(): void; open: boolean; onOpen(): void; onClose(): void;
}) {
  if (!items.length) return null;
  return <>
    <aside className={styles.compareBar} data-testid="selection-compare-bar" aria-label="Selected machines for comparison">
      <div className={styles.compareBarInner}>
        <strong>{content.compare.title} <span>{items.length} / {content.compare.maxItems}</span></strong>
        <div className={styles.compareSelections}>{items.map((raw) => { const item = productDisplay(raw, content); return <div key={item.id}><Image src={item.image} alt="" width={56} height={40} /><span>{item.name}</span><button aria-label={`Remove ${item.name}`} onClick={() => onRemove(item.id)}><X size={15} /></button></div>; })}</div>
        <button className={styles.clearButton} onClick={onClear}>{content.compare.clearLabel}</button>
        <button className={styles.primaryButton} disabled={items.length < content.compare.minItems} onClick={onOpen}>{content.compare.buttonLabel}</button>
      </div>
    </aside>
    {open ? <div className={styles.dialogBackdrop} role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-label={content.compare.title} className={styles.compareDialog}>
        <header><div><p>TECHNICAL COMPARISON</p><h2>{content.compare.title}</h2></div><button aria-label={content.compare.closeLabel} onClick={onClose}><X /></button></header>
        <div className={styles.compareTable} style={{ "--compare-columns": items.length } as React.CSSProperties}>
          <div className={styles.compareLabel}>Machine Series</div>{items.map((raw) => { const item = productDisplay(raw, content); return <article key={item.id}><Image src={item.image} alt={item.imageAlt} width={240} height={160} /><h3>{item.name}</h3><p>{item.categoryName}</p></article>; })}
          {content.filters.filter((filter) => filter.enabled && filter.showInCompare).sort((a,b) => a.position-b.position).map((filter) => <div key={filter.id} className={styles.compareRow}><div className={styles.compareLabel}>{filter.label}</div>{items.map((item) => { const spec = cardSpecifications(item, { ...content, cards: { ...content.cards, parameterCount: 6 }, filters: [filter] })[0]; return <div key={item.id}>{spec?.value ?? content.cards.missingValueLabel}</div>; })}</div>)}
        </div>
        <footer>{items.map((item) => <Link key={item.id} href={`/products/${item.slug}`}>{content.cards.viewLabel}</Link>)}<Link className={styles.primaryButton} href={content.consultation.href}>{content.compare.quoteLabel}</Link></footer>
      </section>
    </div> : null}
  </>;
}
