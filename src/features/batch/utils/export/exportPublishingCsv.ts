import Papa from "papaparse";
import type { BatchAccessibilityItem } from "@/features/batch/types/batchItem";
import { sanitizeCsvCellForSpreadsheet } from "@/features/batch/utils/export/sanitizeCsvCellForSpreadsheet";

export function downloadPublishingCsv(
  items: BatchAccessibilityItem[],
  filename = "batch-publishing.csv",
): void {
  const rows = items.map((item) => ({
    id: item.id,
    platform: item.platform ?? "",
    caption: sanitizeCsvCellForSpreadsheet(item.caption),
    alt_text: sanitizeCsvCellForSpreadsheet(item.altText),
    image_filename: item.imageFilename ?? item.image?.fileName ?? "",
    content_name: item.contentName ?? "",
    campaign: item.campaign ?? "",
  }));
  const csv = Papa.unparse(rows);
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
