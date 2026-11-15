import { describe, expect, it } from "vitest";

import {
  inspectXlsxArchive,
  MAX_SPECIFICATION_REQUEST_BYTES,
  validateImportContentLength,
} from "@/lib/services/specification-import-service";
import { SpecificationValidationError } from "@/lib/services/specification-service";

function centralDirectoryZip(uncompressedSize: number) {
  const name = Buffer.from("xl/worksheets/sheet1.xml");
  const central = Buffer.alloc(46 + name.length);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt32LE(100, 20);
  central.writeUInt32LE(uncompressedSize, 24);
  central.writeUInt16LE(name.length, 28);
  name.copy(central, 46);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(1, 8);
  end.writeUInt16LE(1, 10);
  end.writeUInt32LE(central.length, 12);
  end.writeUInt32LE(0, 16);
  return Buffer.concat([central, end]);
}

describe("specification import resource limits", () => {
  it("requires a bounded multipart content length before parsing", () => {
    expect(() => validateImportContentLength(null)).toThrow(SpecificationValidationError);
    expect(() => validateImportContentLength(String(MAX_SPECIFICATION_REQUEST_BYTES + 1))).toThrow(/large/i);
    expect(validateImportContentLength("1024")).toBe(1024);
  });

  it("rejects XLSX archives whose declared expansion exceeds the safe limit", () => {
    expect(() => inspectXlsxArchive(centralDirectoryZip(30 * 1024 * 1024))).toThrow(/expand/i);
    expect(() => inspectXlsxArchive(Buffer.from("not-a-zip"))).toThrow(/XLSX/i);
  });
});
