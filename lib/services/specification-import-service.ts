import path from "node:path";

import ExcelJS from "exceljs";
import type { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { can, type Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import {
  SpecificationNotFoundError,
  SpecificationPermissionError,
  SpecificationService,
  SpecificationValidationError,
} from "@/lib/services/specification-service";
import { escapeSpreadsheetFormula, isReservedSpecificationFieldName, productModelBatchSchema } from "@/lib/validation/specifications";

type Revalidate = (path: string) => void | Promise<void>;
type ImportCell = { value: string; formula: boolean };
type ImportError = { row: number; column: string; message: string };

const MAX_IMPORT_BYTES = 10 * 1024 * 1024;
const MAX_IMPORT_ROWS = 1_000;
const MAX_XLSX_ENTRIES = 200;
const MAX_XLSX_UNCOMPRESSED_BYTES = 20 * 1024 * 1024;
const MAX_XLSX_COLUMNS = 200;
export const MAX_SPECIFICATION_REQUEST_BYTES = 11 * 1024 * 1024;

export function validateImportContentLength(value: string | null) {
  const length = value === null ? Number.NaN : Number(value);
  if (!Number.isSafeInteger(length) || length <= 0) throw new SpecificationValidationError("Specification import requires a valid Content-Length header.");
  if (length > MAX_SPECIFICATION_REQUEST_BYTES) throw new SpecificationValidationError("Specification import request is too large.");
  return length;
}

export function inspectXlsxArchive(bytes: Uint8Array) {
  const archive = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const searchStart = Math.max(0, archive.length - 65_557);
  let endOffset = -1;
  for (let offset = archive.length - 22; offset >= searchStart; offset -= 1) {
    if (archive.readUInt32LE(offset) === 0x06054b50) { endOffset = offset; break; }
  }
  if (endOffset < 0) throw new SpecificationValidationError("Invalid XLSX archive.");
  const entries = archive.readUInt16LE(endOffset + 10);
  const centralSize = archive.readUInt32LE(endOffset + 12);
  const centralOffset = archive.readUInt32LE(endOffset + 16);
  if (entries === 0xffff || centralOffset === 0xffffffff || centralSize === 0xffffffff) throw new SpecificationValidationError("ZIP64 XLSX archives are not supported.");
  if (entries < 1 || entries > MAX_XLSX_ENTRIES) throw new SpecificationValidationError("XLSX archive contains too many entries.");
  if (centralOffset + centralSize > endOffset) throw new SpecificationValidationError("Invalid XLSX central directory.");
  let offset = centralOffset;
  let expandedBytes = 0;
  for (let index = 0; index < entries; index += 1) {
    if (offset + 46 > endOffset || archive.readUInt32LE(offset) !== 0x02014b50) throw new SpecificationValidationError("Invalid XLSX central directory entry.");
    const uncompressedSize = archive.readUInt32LE(offset + 24);
    if (uncompressedSize === 0xffffffff) throw new SpecificationValidationError("ZIP64 XLSX entries are not supported.");
    expandedBytes += uncompressedSize;
    if (expandedBytes > MAX_XLSX_UNCOMPRESSED_BYTES) throw new SpecificationValidationError("XLSX archive would expand beyond the safe limit.");
    const nameLength = archive.readUInt16LE(offset + 28);
    const extraLength = archive.readUInt16LE(offset + 30);
    const commentLength = archive.readUInt16LE(offset + 32);
    offset += 46 + nameLength + extraLength + commentLength;
  }
  if (offset !== centralOffset + centralSize) throw new SpecificationValidationError("Invalid XLSX central directory size.");
}

function csvCell(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function parseCsv(source: string): ImportCell[][] {
  const rows: ImportCell[][] = [];
  let row: ImportCell[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') { cell += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else cell += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") { row.push({ value: cell, formula: false }); cell = ""; }
    else if (character === "\n") { row.push({ value: cell.replace(/\r$/, ""), formula: false }); rows.push(row); row = []; cell = ""; }
    else cell += character;
  }
  if (cell.length || row.length) { row.push({ value: cell.replace(/\r$/, ""), formula: false }); rows.push(row); }
  if (rows[0]?.[0]) rows[0][0].value = rows[0][0].value.replace(/^\uFEFF/, "");
  return rows;
}

function cellText(value: ExcelJS.CellValue): ImportCell {
  if (value === null || value === undefined) return { value: "", formula: false };
  if (typeof value === "object" && "formula" in value) return { value: "", formula: true };
  if (typeof value === "object" && "richText" in value) return { value: value.richText.map((item) => item.text).join(""), formula: false };
  if (value instanceof Date) return { value: value.toISOString(), formula: false };
  return { value: String(value), formula: false };
}

function unescapeSpreadsheetText(value: string) {
  return /^'\s*[=+\-@]/.test(value) ? value.slice(1) : value;
}

export class SpecificationImportService {
  constructor(
    private readonly database: PrismaClient = db,
    private readonly revalidate: Revalidate = revalidatePath,
  ) {}

  async exportProduct(principal: Principal, productId: string, templateId: string, format: "csv" | "xlsx") {
    if (!can(principal, "specification.read")) throw new SpecificationPermissionError("specification.read");
    const [product, template] = await Promise.all([
      this.database.product.findUnique({
        where: { id: productId },
        include: { category: { select: { id: true } }, models: { orderBy: { position: "asc" }, include: { values: true } } },
      }),
      this.database.specificationTemplate.findUnique({
        where: { id: templateId },
        include: { fields: { orderBy: { position: "asc" } } },
      }),
    ]);
    if (!product) throw new SpecificationNotFoundError("product");
    if (!template) throw new SpecificationNotFoundError("template");
    if (template.categoryId && template.categoryId !== product.category.id) throw new SpecificationValidationError("Template category does not match the product category.");
    if (template.fields.some(({ name }) => isReservedSpecificationFieldName(name))) throw new SpecificationValidationError("Template contains a reserved system field name.");
    const fieldIds = new Set(template.fields.map(({ id }) => id));
    if (product.models.some((model) => model.values.length !== fieldIds.size || model.values.some(({ fieldId }) => !fieldIds.has(fieldId)))) {
      throw new SpecificationValidationError("Template does not match the product's saved model fields.");
    }
    const headers = ["Model", "SKU", "Active", ...template.fields.map((field) => field.unit ? `${field.name} [${field.unit}]` : field.name)];
    const safeHeaders = headers.map(escapeSpreadsheetFormula);
    const rows = product.models.map((model) => {
      const values = new Map(model.values.map((value) => [value.fieldId, value.value]));
      return [model.name, model.sku ?? "", model.active ? "true" : "false", ...template.fields.map((field) => values.get(field.id) ?? "")]
        .map(escapeSpreadsheetFormula);
    });
    const filename = `${product.slug}-specifications.${format}`;
    if (format === "csv") {
      const text = `\uFEFF${[safeHeaders, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
      return { filename, mimeType: "text/csv; charset=utf-8", buffer: Buffer.from(text, "utf8") };
    }
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Specifications", { views: [{ state: "frozen", ySplit: 1 }] });
    worksheet.addRow(safeHeaders);
    rows.forEach((row) => worksheet.addRow(row));
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0B0D10" } };
    worksheet.columns.forEach((column) => { column.width = 20; });
    const output = await workbook.xlsx.writeBuffer();
    return {
      filename,
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: Buffer.from(output),
    };
  }

  async importProduct(principal: Principal, productId: string, input: {
    version: number;
    templateId: string;
    filename: string;
    bytes: Uint8Array;
  }) {
    if (!can(principal, "specification.write")) throw new SpecificationPermissionError("specification.write");
    if (input.bytes.byteLength > MAX_IMPORT_BYTES) throw new SpecificationValidationError("Specification import exceeds 10 MB.");
    const extension = path.extname(input.filename).toLowerCase();
    let rows: ImportCell[][];
    if (extension === ".csv") rows = parseCsv(Buffer.from(input.bytes).toString("utf8"));
    else if (extension === ".xlsx") {
      inspectXlsxArchive(input.bytes);
      const workbook = new ExcelJS.Workbook();
      const workbookBytes = input.bytes.buffer.slice(
        input.bytes.byteOffset,
        input.bytes.byteOffset + input.bytes.byteLength,
      ) as ArrayBuffer;
      try {
        await workbook.xlsx.load(workbookBytes);
      } catch {
        throw new SpecificationValidationError("Invalid or damaged XLSX workbook.");
      }
      const worksheet = workbook.worksheets[0];
      if (!worksheet) return { applied: false, importedRows: 0, errors: [{ row: 1, column: "File", message: "Workbook has no worksheet." }] };
      if (worksheet.rowCount > MAX_IMPORT_ROWS + 1 || worksheet.columnCount > MAX_XLSX_COLUMNS) {
        throw new SpecificationValidationError("XLSX worksheet dimensions exceed the safe import limit.");
      }
      rows = [];
      worksheet.eachRow({ includeEmpty: true }, (worksheetRow) => {
        const parsed: ImportCell[] = [];
        for (let column = 1; column <= worksheet.columnCount; column += 1) parsed.push(cellText(worksheetRow.getCell(column).value));
        rows.push(parsed);
      });
    } else throw new SpecificationValidationError("Only .csv and .xlsx specification files are supported.");

    const template = await this.database.specificationTemplate.findUnique({
      where: { id: input.templateId },
      include: { fields: { orderBy: { position: "asc" } } },
    });
    if (!template) throw new SpecificationNotFoundError("template");
    const expectedHeaders = ["Model", "SKU", "Active", ...template.fields.map((field) => field.unit ? `${field.name} [${field.unit}]` : field.name)];
    const errors: ImportError[] = [];
    if (!rows.length) errors.push({ row: 1, column: "File", message: "File is empty." });
    const headers = rows[0]?.map(({ value }) => unescapeSpreadsheetText(value.trim())) ?? [];
    expectedHeaders.forEach((header, index) => {
      if (headers[index] !== header) errors.push({ row: 1, column: header, message: `Expected header '${header}'.` });
    });
    if (headers.length !== expectedHeaders.length) errors.push({ row: 1, column: "Headers", message: "Unexpected column count." });
    const dataRows = rows.slice(1).filter((row) => row.some(({ value }) => value.trim() !== ""));
    if (dataRows.length > MAX_IMPORT_ROWS) errors.push({ row: 1, column: "File", message: "Import is limited to 1,000 rows." });
    const models = dataRows.slice(0, MAX_IMPORT_ROWS).map((row, index) => {
      const rowNumber = index + 2;
      row.forEach((cell, column) => { if (cell.formula) errors.push({ row: rowNumber, column: expectedHeaders[column] ?? `Column ${column + 1}`, message: "Formula cells are not allowed." }); });
      const values = row.map((cell) => unescapeSpreadsheetText(cell.value.trim()));
      const [name = "", sku = "", activeValue = "", ...fieldValues] = values;
      if (!name) errors.push({ row: rowNumber, column: "Model", message: "Model is required." });
      const normalizedActive = activeValue.toLowerCase();
      if (!["true", "false", "1", "0"].includes(normalizedActive)) errors.push({ row: rowNumber, column: "Active", message: "Use true, false, 1, or 0." });
      template.fields.forEach((field, fieldIndex) => {
        const value = fieldValues[fieldIndex] ?? "";
        const column = expectedHeaders[fieldIndex + 3];
        if (!value) errors.push({ row: rowNumber, column, message: "Value is required." });
        else if (field.valueType === "NUMBER" && !Number.isFinite(Number(value))) errors.push({ row: rowNumber, column, message: "Numeric value required." });
      });
      return {
        name,
        sku: sku || null,
        active: ["true", "1"].includes(normalizedActive),
        position: index,
        values: Object.fromEntries(template.fields.map((field, fieldIndex) => [field.id, fieldValues[fieldIndex] ?? ""])),
      };
    });
    const batch = productModelBatchSchema.safeParse({ version: input.version, templateId: input.templateId, models });
    if (!batch.success) for (const issue of batch.error.issues) {
      const modelIndex = issue.path[0] === "models" && typeof issue.path[1] === "number" ? issue.path[1] : -1;
      errors.push({ row: modelIndex >= 0 ? modelIndex + 2 : 1, column: String(issue.path.at(-1) ?? "File"), message: issue.message });
    }
    if (errors.length || !batch.success) return { applied: false, importedRows: 0, errors };
    const product = await new SpecificationService(this.database, this.revalidate).saveModels(principal, productId, batch.data);
    return { applied: true, importedRows: models.length, errors: [] as ImportError[], version: product.version };
  }
}
