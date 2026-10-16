import { describe, expect, it } from "vitest";
import { parseBatchCsv } from "@/features/batch/utils/csv/parseBatchCsv";
import { validateDuplicateIds } from "@/features/batch/utils/items/buildItemsFromCsvRows";
import { normalizeBatchPlatform } from "@/features/batch/utils/platform/normalizeBatchPlatform";
import { sanitizeCsvCellForSpreadsheet } from "@/features/batch/utils/export/sanitizeCsvCellForSpreadsheet";

describe("parseBatchCsv", () => {
  it("parses quoted commas in caption", () => {
    const csv = `id,platform,caption,alt_text,image_filename,content_name,client,campaign,notes
post-001,instagram,"Join us Friday, October 20, for our workshop.",,,,,,`;
    const result = parseBatchCsv(csv);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.rows[0].caption).toContain("October 20");
    }
  });

  it("rejects over max rows", () => {
    const header =
      "id,platform,caption,alt_text,image_filename,content_name,client,campaign,notes\n";
    const row = "x,instagram,c,,,,,,,\n";
    const csv = header + row.repeat(101);
    const result = parseBatchCsv(csv);
    expect(result.ok).toBe(false);
  });
});

describe("normalizeBatchPlatform", () => {
  it("normalizes twitter to x with warning", () => {
    const r = normalizeBatchPlatform("twitter");
    expect(r?.ok).toBe(true);
    if (r?.ok) {
      expect(r.platform).toBe("x");
      expect(r.warning).toBeTruthy();
    }
  });

  it("returns invalid for unknown platform", () => {
    const r = normalizeBatchPlatform("threads");
    expect(r?.ok).toBe(false);
  });
});

describe("validateDuplicateIds", () => {
  it("detects duplicate ids", () => {
    const errors = validateDuplicateIds([
      { sourceRow: 2, id: "a", caption: "1" },
      { sourceRow: 3, id: "a", caption: "2" },
    ]);
    expect(errors.length).toBe(1);
  });
});

describe("sanitizeCsvCellForSpreadsheet", () => {
  it("prefixes formula-like cells", () => {
    expect(sanitizeCsvCellForSpreadsheet("=HYPERLINK()")).toMatch(/^\t=/);
    expect(sanitizeCsvCellForSpreadsheet("hello")).toBe("hello");
    expect(sanitizeCsvCellForSpreadsheet(" =SUM(1,1)")).toMatch(/^\t=/);
    expect(sanitizeCsvCellForSpreadsheet("\t=SUM(1)")).toMatch(/^\t/);
  });
});
