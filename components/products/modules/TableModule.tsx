import { SectionShell } from "@/components/products/modules/SectionShell";
import type { ComparisonData, TableData } from "@/components/products/modules/types";
import type { ProductModuleType } from "@/lib/product-modules/types";

export function TechnicalTableModule({ type, data }: { type: ProductModuleType; data: TableData }) {
  return <SectionShell type={type} eyebrow={data.eyebrow} title={data.title} paragraphs={data.paragraphs}><div data-technical-table-scroll className="mt-10 overflow-x-auto"><table aria-label={data.title} className="min-w-full border-collapse text-left"><thead><tr>{data.columns.map((column) => <th key={column.key} scope="col" className="border-b border-neutral-300 p-4">{column.label}{column.unit ? ` (${column.unit})` : ""}</th>)}</tr></thead><tbody>{data.rows.map((row, index) => <tr key={index}>{data.columns.map((column) => <td key={column.key} className="border-b border-neutral-200 p-4">{row[column.key]}</td>)}</tr>)}</tbody></table></div></SectionShell>;
}

export function ComparisonTableModule({ type, data }: { type: ProductModuleType; data: ComparisonData }) {
  return <SectionShell type={type} eyebrow={data.eyebrow} title={data.title} paragraphs={data.paragraphs}><div data-technical-table-scroll className="mt-10 overflow-x-auto"><table aria-label={data.title} className="min-w-full border-collapse text-left"><thead><tr>{data.columns.map((column) => <th key={column} scope="col" className="border-b border-neutral-300 p-4">{column}</th>)}</tr></thead><tbody>{data.rows.map((row) => <tr key={row.label}><th scope="row" className="border-b border-neutral-200 p-4">{row.label}</th>{row.values.map((value, index) => <td key={`${row.label}:${index}`} className="border-b border-neutral-200 p-4">{value}</td>)}</tr>)}</tbody></table></div></SectionShell>;
}
