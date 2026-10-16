import type { AccessibilityPreflightReport } from "@/features/reports/types/reportModel";

export type ReportValidationResult =
  | { ok: true }
  | { ok: false; errors: string[] };

export function validatePreflightReport(
  report: AccessibilityPreflightReport,
): ReportValidationResult {
  const errors: string[] = [];
  if (!report.reportId?.trim()) errors.push("Missing reportId");
  if (!report.generatedAt?.trim()) errors.push("Missing generatedAt");
  if (!report.reportVersion?.trim()) errors.push("Missing reportVersion");
  if (!report.summary?.overallStatus) errors.push("Missing overall status");
  if (!report.disclaimer?.trim()) errors.push("Missing disclaimer");
  if (!Array.isArray(report.limitations)) errors.push("Invalid limitations");
  if (!report.humanReview || !Array.isArray(report.humanReview.items)) {
    errors.push("Invalid humanReview");
  }
  const sections = [
    report.textAccessibility,
    report.imageAccessibility,
    report.visualAccessibility,
    report.screenReaderPreview,
    report.platformPublishing,
  ];
  for (const section of sections) {
    if (section && !Array.isArray(section.findings)) {
      errors.push(`Section ${section.id} has invalid findings`);
    }
  }
  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}
