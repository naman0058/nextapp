import Papa from "papaparse";
import { sanitizeCsvCellForSpreadsheet } from "@/features/batch/utils/export/sanitizeCsvCellForSpreadsheet";
import type { IssueComparisonRow } from "@/features/website-scanner/utils/compareScanSnapshots";

export function exportComparisonCsv(rows: IssueComparisonRow[]): void {
  const data = rows.map((r) => ({
    page_url: sanitizeCsvCellForSpreadsheet(r.pageUrl),
    rule_id: sanitizeCsvCellForSpreadsheet(r.ruleId),
    selector: sanitizeCsvCellForSpreadsheet(r.selector),
    status: sanitizeCsvCellForSpreadsheet(r.status),
  }));
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "website-scan-comparison.csv";
  a.click();
  URL.revokeObjectURL(url);
}
