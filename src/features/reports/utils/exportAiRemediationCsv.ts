import type { ReportAiRemediationEntry } from "@/features/reports/types/reportAiRemediation";
import {
  AI_REMEDIATION_CSV_HEADERS,
  formatAiRemediationForCsvRow,
} from "@/lib/ai/remediation/report";
import { sanitizeCsvCellForSpreadsheet } from "@/features/batch/utils/export/sanitizeCsvCellForSpreadsheet";

function escapeCsvField(value: string): string {
  const safe = sanitizeCsvCellForSpreadsheet(value);
  if (/[",\n\r]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export function buildAiRemediationCsv(entries: ReportAiRemediationEntry[]): string {
  const rows = [
    [...AI_REMEDIATION_CSV_HEADERS].map(escapeCsvField).join(","),
    ...entries.map((e) =>
      formatAiRemediationForCsvRow(e).map(escapeCsvField).join(","),
    ),
  ];
  return rows.join("\r\n");
}

export function downloadAiRemediationCsv(
  entries: ReportAiRemediationEntry[],
  filename: string,
): void {
  const blob = new Blob([buildAiRemediationCsv(entries)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
