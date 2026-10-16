import Papa from "papaparse";
import type { BatchImportError } from "@/features/batch/types/batchImport";

export function downloadImportErrorsCsv(errors: BatchImportError[]): void {
  const csv = Papa.unparse({
    fields: ["row", "field", "error", "original_id"],
    data: errors.map((e) => [
      e.row,
      e.field,
      e.error,
      e.originalId ?? "",
    ]),
  });
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "batch-import-errors.csv";
  a.click();
  URL.revokeObjectURL(url);
}
