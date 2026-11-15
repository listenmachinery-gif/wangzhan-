import { describe, expect, it } from "vitest";

import {
  escapeSpreadsheetFormula,
  productModelBatchSchema,
  specificationTemplateSchema,
} from "@/lib/validation/specifications";

describe("specification validation", () => {
  it("accepts ordered template fields with explicit units and value types", () => {
    const result = specificationTemplateSchema.parse({
      name: "Shearing machine specifications",
      categoryId: "category-1",
      fields: [
        { name: "Model", unit: null, valueType: "TEXT", position: 0 },
        { name: "Cutting width", unit: "mm", valueType: "NUMBER", position: 1 },
      ],
    });
    expect(result.fields).toHaveLength(2);
    expect(result.fields[1]).toMatchObject({ unit: "mm", valueType: "NUMBER", position: 1 });
  });

  it("rejects duplicate field names, duplicate positions, and oversized templates", () => {
    const field = { name: "Model", unit: null, valueType: "TEXT" as const, position: 0 };
    expect(() => specificationTemplateSchema.parse({ name: "Template", fields: [field, { ...field, position: 1 }] })).toThrow(/name/i);
    expect(() => specificationTemplateSchema.parse({ name: "Template", fields: [field, { ...field, name: "Width" }] })).toThrow(/position/i);
    expect(() => specificationTemplateSchema.parse({ name: "Template", fields: Array.from({ length: 101 }, (_, position) => ({ ...field, name: `Field ${position}`, position })) })).toThrow();
  });

  it("validates ordered models and field-keyed values", () => {
    const result = productModelBatchSchema.parse({
      version: 3,
      templateId: "template-1",
      models: [
        { name: "Q11G-2x600", sku: "Q11G-2X600", position: 0, active: true, values: { "field-model": "Q11G-2x600", "field-width": "600" } },
        { name: "Q11G-2x800", sku: null, position: 1, active: false, values: { "field-model": "Q11G-2x800", "field-width": "800" } },
      ],
    });
    expect(result.models[1]).toMatchObject({ active: false, position: 1 });
  });

  it("rejects duplicate model names, duplicate order, empty values, and oversized imports", () => {
    const model = { name: "Q11G-2x600", position: 0, active: true, values: { "field-model": "Q11G-2x600" } };
    expect(() => productModelBatchSchema.parse({ version: 1, templateId: "template-1", models: [model, { ...model, position: 1 }] })).toThrow(/name/i);
    expect(() => productModelBatchSchema.parse({ version: 1, templateId: "template-1", models: [model, { ...model, name: "Q11G-2x800" }] })).toThrow(/position/i);
    expect(() => productModelBatchSchema.parse({ version: 1, templateId: "template-1", models: [{ ...model, values: { "field-model": "" } }] })).toThrow();
    expect(() => productModelBatchSchema.parse({ version: 1, templateId: "template-1", models: Array.from({ length: 1001 }, (_, position) => ({ ...model, name: `Model ${position}`, position })) })).toThrow();
  });

  it("escapes spreadsheet formula prefixes without changing safe values", () => {
    expect(escapeSpreadsheetFormula("=HYPERLINK(\"https://attacker.test\")")).toBe("'=HYPERLINK(\"https://attacker.test\")");
    expect(escapeSpreadsheetFormula("+1+1")).toBe("'+1+1");
    expect(escapeSpreadsheetFormula("-2+3")).toBe("'-2+3");
    expect(escapeSpreadsheetFormula("@SUM(A1:A2)")).toBe("'@SUM(A1:A2)");
    expect(escapeSpreadsheetFormula("  =SUM(A1:A2)")).toBe("'  =SUM(A1:A2)");
    expect(escapeSpreadsheetFormula("Q11G-2x600")).toBe("Q11G-2x600");
  });
});
