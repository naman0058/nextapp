import type { AccessibilityPreflightReport } from "@/features/reports/types/reportModel";
import { toExportableAiRemediationJson } from "@/lib/ai/remediation/report";

export function exportReportJson(report: AccessibilityPreflightReport): string {
  const base = { ...report };
  if (report.aiRemediationAppendix?.entries.length) {
    (base as Record<string, unknown>).aiRemediation = toExportableAiRemediationJson(
      report.aiRemediationAppendix.entries,
    );
  }
  const sanitized = JSON.parse(
    JSON.stringify(base, (_key, value) => {
      if (typeof value === "string" && value.startsWith("data:image")) {
        return "[thumbnail omitted from JSON export]";
      }
      if (typeof value === "string" && value.startsWith("blob:")) {
        return "[blob url omitted]";
      }
      return value;
    }),
  ) as AccessibilityPreflightReport;
  return JSON.stringify(sanitized, null, 2);
}

export function downloadReportJson(
  report: AccessibilityPreflightReport,
  filename: string,
): void {
  const blob = new Blob([exportReportJson(report)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
