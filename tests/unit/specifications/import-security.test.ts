import { describe, expect, it } from "vitest";
import { deflateRawSync } from "node:zlib";

import {
  inspectXlsxArchive,
  MAX_SPECIFICATION_REQUEST_BYTES,
  validateImportContentLength,
} from "@/lib/services/specification-import-service";
import { SpecificationValidationError } from "@/lib/services/specification-service";

function centralDirectoryZip(content: Buffer, declaredSize = content.length) {
  const name = Buffer.from("xl/worksheets/sheet1.xml");
  const compressed = deflateRawSync(content);
  const local = Buffer.alloc(30 + name.length);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(8, 8);
  local.writeUInt32LE(compressed.length, 18);
  local.writeUInt32LE(declaredSize, 22);
  local.writeUInt16LE(name.length, 26);
  name.copy(local, 30);
  const central = Buffer.alloc(46 + name.length);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(8, 10);
  central.writeUInt32LE(compressed.length, 20);
  central.writeUInt32LE(declaredSize, 24);
  central.writeUInt16LE(name.length, 28);
  name.copy(central, 46);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(1, 8);
  end.writeUInt16LE(1, 10);
  end.writeUInt32LE(central.length, 12);
  end.writeUInt32LE(local.length + compressed.length, 16);
  return Buffer.concat([local, compressed, central, end]);
}

describe("specification import resource limits", () => {
  it("requires a bounded multipart content length before parsing", () => {
    expect(() => validateImportContentLength(null)).toThrow(SpecificationValidationError);
    expect(() => validateImportContentLength(String(MAX_SPECIFICATION_REQUEST_BYTES + 1))).toThrow(/large/i);
    expect(validateImportContentLength("1024")).toBe(1024);
  });

  it("rejects XLSX archives whose declared expansion or structure is unsafe", async () => {
    const expansionBomb = centralDirectoryZip(Buffer.alloc(21 * 1024 * 1024), 1);
    await expect(inspectXlsxArchive(expansionBomb)).rejects.toThrow(/expand/i);
    await expect(inspectXlsxArchive(Buffer.from("not-a-zip"))).rejects.toThrow(/XLSX/i);
  });
});
