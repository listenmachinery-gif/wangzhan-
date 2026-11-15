import { Prisma } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import {
  SpecificationConflictError,
  SpecificationPermissionError,
  SpecificationService,
  SpecificationValidationError,
} from "@/lib/services/specification-service";
import { SpecificationImportService } from "@/lib/services/specification-import-service";
import { validProductModuleData } from "@/tests/fixtures/product-modules";

describe("SpecificationService", () => {
  let editor: Principal;
  let sales: Principal;
  let productId: string;
  let productVersion: number;
  let categoryId: string;
  let revalidated: string[];
  let service: SpecificationService;

  beforeEach(async () => {
    await resetTestDatabase();
    const [editorUser, salesUser] = await Promise.all([
      db.user.create({ data: { email: "spec-editor@zyron.test", name: "Spec Editor", passwordHash: "test" } }),
      db.user.create({ data: { email: "spec-sales@zyron.test", name: "Sales", passwordHash: "test" } }),
    ]);
    editor = { id: editorUser.id, email: editorUser.email, name: editorUser.name, roles: ["PRODUCT_EDITOR"] };
    sales = { id: salesUser.id, email: salesUser.email, name: salesUser.name, roles: ["SALES"] };
    const category = await db.productCategory.create({
      data: { name: "Shearing Machines", slug: "shearing-machines", status: "PUBLISHED", publishedAt: new Date() },
    });
    categoryId = category.id;
    const product = await db.product.create({
      data: {
        categoryId,
        name: "Specification Product",
        slug: "specification-product",
        summary: "Specification product",
        status: "PUBLISHED",
        publishedAt: new Date(),
        sections: {
          create: {
            type: "TECHNICAL",
            position: 0,
            visible: true,
            content: validProductModuleData.TECHNICAL as Prisma.InputJsonValue,
          },
        },
      },
    });
    productId = product.id;
    productVersion = product.version;
    revalidated = [];
    service = new SpecificationService(db, (path) => { revalidated.push(path); });
  });

  afterAll(() => db.$disconnect());

  it("creates reusable ordered templates and enforces permissions", async () => {
    await expect(service.createTemplate(sales, {
      name: "Forbidden",
      categoryId,
      fields: [{ name: "Series", unit: null, valueType: "TEXT", position: 0 }],
    })).rejects.toBeInstanceOf(SpecificationPermissionError);

    const template = await service.createTemplate(editor, {
      name: "Shearing machine parameters",
      categoryId,
      fields: [
        { name: "Series", unit: null, valueType: "TEXT", position: 0 },
        { name: "Cutting width", unit: "mm", valueType: "NUMBER", position: 1 },
      ],
    });
    expect(template.fields.map((field) => [field.name, field.position])).toEqual([["Series", 0], ["Cutting width", 1]]);
    await expect(db.auditLog.findFirstOrThrow({ where: { action: "specification.template.create", entityId: template.id } })).resolves.toMatchObject({ actorId: editor.id });
    await service.createTemplate(editor, {
      name: "Global template",
      categoryId: null,
      fields: [{ name: "Width", unit: "mm", valueType: "NUMBER", position: 0 }],
    });
    await expect(service.createTemplate(editor, {
      name: "Global template",
      categoryId: null,
      fields: [{ name: "Length", unit: "mm", valueType: "NUMBER", position: 0 }],
    })).rejects.toBeInstanceOf(SpecificationValidationError);
  });

  it("saves ordered models transactionally and synchronizes the public technical module", async () => {
    const template = await service.createTemplate(editor, {
      name: "Shearing machine parameters",
      categoryId,
      fields: [
        { name: "Series", unit: null, valueType: "TEXT", position: 0 },
        { name: "Cutting width", unit: "mm", valueType: "NUMBER", position: 1 },
      ],
    });
    const [modelField, widthField] = template.fields;

    const saved = await service.saveModels(editor, productId, {
      version: productVersion,
      templateId: template.id,
      models: [
        { name: "Q11G-2x600", sku: "Q11G-2X600", position: 0, active: true, values: { [modelField.id]: "Q11G-2x600", [widthField.id]: "600" } },
        { name: "Q11G-2x800", sku: null, position: 1, active: true, values: { [modelField.id]: "Q11G-2x800", [widthField.id]: "800" } },
      ],
    });

    expect(saved.version).toBe(productVersion + 1);
    await expect(db.productModel.findMany({ where: { productId }, orderBy: { position: "asc" } })).resolves.toHaveLength(2);
    await expect(db.specificationValue.count()).resolves.toBe(4);
    const technical = await db.productSection.findUniqueOrThrow({ where: { productId_type: { productId, type: "TECHNICAL" } } });
    expect(technical.content).toMatchObject({
      columns: [
        { key: "__model", label: "Model" },
        { key: "__sku", label: "SKU" },
        { key: modelField.id, label: "Series" },
        { key: widthField.id, label: "Cutting width", unit: "mm" },
      ],
      rows: [
        { __model: "Q11G-2x600", __sku: "Q11G-2X600", [modelField.id]: "Q11G-2x600", [widthField.id]: "600" },
        { __model: "Q11G-2x800", __sku: "—", [modelField.id]: "Q11G-2x800", [widthField.id]: "800" },
      ],
    });
    expect(revalidated).toEqual(expect.arrayContaining([
      "/products/specification-product",
      "/products/series/shearing-machines",
      "/products",
    ]));
    await expect(service.saveModels(editor, productId, {
      version: productVersion,
      templateId: template.id,
      models: [{ name: "Stale", position: 0, active: true, values: { [modelField.id]: "Stale", [widthField.id]: "1" } }],
    })).rejects.toBeInstanceOf(SpecificationConflictError);
  });

  it("rejects category-mismatched templates and rolls back invalid values", async () => {
    const otherCategory = await db.productCategory.create({ data: { name: "Other", slug: "other" } });
    const template = await service.createTemplate(editor, {
      name: "Other template",
      categoryId: otherCategory.id,
      fields: [{ name: "Width", unit: "mm", valueType: "NUMBER", position: 0 }],
    });
    await expect(service.saveModels(editor, productId, {
      version: productVersion,
      templateId: template.id,
      models: [{ name: "Invalid", position: 0, active: true, values: { [template.fields[0].id]: "not-a-number" } }],
    })).rejects.toBeInstanceOf(SpecificationValidationError);
    await expect(db.productModel.count({ where: { productId } })).resolves.toBe(0);
    await expect(db.product.findUniqueOrThrow({ where: { id: productId } })).resolves.toMatchObject({ version: productVersion });
  });

  it("round-trips CSV/XLSX safely and rolls back imports with row errors", async () => {
    const template = await service.createTemplate(editor, {
      name: "Import template",
      categoryId,
      fields: [
        { name: "=Model value", unit: null, valueType: "TEXT", position: 0 },
        { name: "Width", unit: "mm", valueType: "NUMBER", position: 1 },
      ],
    });
    const [modelField, widthField] = template.fields;
    const saved = await service.saveModels(editor, productId, {
      version: productVersion,
      templateId: template.id,
      models: [{
        name: "=2+2",
        sku: "@DANGEROUS",
        position: 0,
        active: true,
        values: { [modelField.id]: "+SUM(A1:A2)", [widthField.id]: "600" },
      }],
    });
    const imports = new SpecificationImportService(db, (path) => { revalidated.push(path); });

    const csv = await imports.exportProduct(editor, productId, template.id, "csv");
    expect(csv.mimeType).toBe("text/csv; charset=utf-8");
    expect(csv.buffer.toString("utf8")).toContain("'=2+2");
    expect(csv.buffer.toString("utf8")).toContain("'@DANGEROUS");
    expect(csv.buffer.toString("utf8")).toContain("'+SUM(A1:A2)");
    expect(csv.buffer.toString("utf8")).toContain("'=Model value");

    const xlsx = await imports.exportProduct(editor, productId, template.id, "xlsx");
    expect(xlsx.mimeType).toBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    expect(xlsx.buffer.byteLength).toBeGreaterThan(1_000);
    const xlsxRoundTrip = await imports.importProduct(editor, productId, {
      version: saved.version,
      templateId: template.id,
      filename: "round-trip.xlsx",
      bytes: xlsx.buffer,
    });
    expect(xlsxRoundTrip).toMatchObject({ applied: true, importedRows: 1, errors: [] });
    await expect(imports.importProduct(editor, productId, {
      version: xlsxRoundTrip.version!,
      templateId: template.id,
      filename: "models.txt",
      bytes: Buffer.from("not a spreadsheet"),
    })).rejects.toBeInstanceOf(SpecificationValidationError);
    await expect(imports.importProduct(editor, productId, {
      version: xlsxRoundTrip.version!,
      templateId: template.id,
      filename: "broken.xlsx",
      bytes: Buffer.from("not an xlsx archive"),
    })).rejects.toBeInstanceOf(SpecificationValidationError);
    const unrelated = await service.createTemplate(editor, {
      name: "Unrelated export template",
      categoryId,
      fields: [{ name: "Power", unit: "kW", valueType: "NUMBER", position: 0 }],
    });
    await expect(imports.exportProduct(editor, productId, unrelated.id, "csv")).rejects.toBeInstanceOf(SpecificationValidationError);

    const validCsv = Buffer.from([
      "Model,SKU,Active,=Model value,Width [mm]",
      "Q11G-2x650,Q11G-2X650,true,Q11G-2x650,650",
    ].join("\n"));
    const valid = await imports.importProduct(editor, productId, {
      version: xlsxRoundTrip.version!,
      templateId: template.id,
      filename: "models.csv",
      bytes: validCsv,
    });
    expect(valid).toMatchObject({ applied: true, importedRows: 1, errors: [] });
    await expect(db.productModel.findFirstOrThrow({ where: { productId } })).resolves.toMatchObject({ name: "Q11G-2x650" });

    const current = await db.product.findUniqueOrThrow({ where: { id: productId } });
    const invalidCsv = Buffer.from([
      "Model,SKU,Active,=Model value,Width [mm]",
      "Q11G-invalid,,true,Q11G-invalid,not-a-number",
      ",,true,,700",
    ].join("\n"));
    const invalid = await imports.importProduct(editor, productId, {
      version: current.version,
      templateId: template.id,
      filename: "invalid.csv",
      bytes: invalidCsv,
    });
    expect(invalid.applied).toBe(false);
    expect(invalid.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ row: 2, column: "Width [mm]" }),
      expect.objectContaining({ row: 3, column: "Model" }),
    ]));
    await expect(db.productModel.findFirstOrThrow({ where: { productId } })).resolves.toMatchObject({ name: "Q11G-2x650" });
    await expect(db.product.findUniqueOrThrow({ where: { id: productId } })).resolves.toMatchObject({ version: current.version });
  });
});
