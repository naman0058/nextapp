import Papa from "papaparse";
import type { BatchAccessibilityItem } from "@/features/batch/types/batchItem";
import { sanitizeCsvCellForSpreadsheet } from "@/features/batch/utils/export/sanitizeCsvCellForSpreadsheet";

export function downloadReviewQueueCsv(
  items: BatchAccessibilityItem[],
  filename = "batch-review-queue.csv",
): void {
  const rows: Record<string, string>[] = [];
  for (const item of items) {
    if (
      item.overallStatus !== "Needs Review" &&
      item.overallStatus !== "Attention Required"
    ) {
      continue;
    }
    for (const hr of item.humanReviewItems) {
      rows.push({
        id: item.id,
        platform: item.platform ?? "",
        issue: sanitizeCsvCellForSpreadsheet(hr.title),
        priority: hr.priority,
        recommendation: sanitizeCsvCellForSpreadsheet(hr.detail),
        content_name: item.contentName ?? "",
      });
    }
    if (item.humanReviewItems.length === 0) {
      rows.push({
        id: item.id,
        platform: item.platform ?? "",
        issue: item.overallStatus,
        priority: "medium",
        recommendation: "",
        content_name: item.contentName ?? "",
      });
    }
  }
  const csv = Papa.unparse(rows);
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
