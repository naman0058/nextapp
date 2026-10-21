import type { AccessibilityPreflightReport } from "@/features/reports/types/reportModel";
import type { SiteScanIntelligence } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { ScanResultSummaryCounters } from "@/features/website-scanner/taxonomy/types";
import { scanResultCounters } from "@/features/website-scanner/taxonomy/buildScanResultModel";

export function countersFromIntelligence(
  intel: SiteScanIntelligence | null | undefined,
): ScanResultSummaryCounters {
  return scanResultCounters(intel?.scanResultModel);
}

export function countersFromReport(
  report: AccessibilityPreflightReport,
): ScanResultSummaryCounters | null {
  return report.websiteScanTaxonomy ?? null;
}

export function assertScanResultConsistency(input: {
  intel: SiteScanIntelligence | null | undefined;
  report: AccessibilityPreflightReport;
}): void {
  const ui = countersFromIntelligence(input.intel);
  const report = countersFromReport(input.report);
  if (!report) {
    throw new Error("Report missing websiteScanTaxonomy counters.");
  }
  const keys: (keyof ScanResultSummaryCounters)[] = [
    "automatedRulesEvaluated",
    "failedAutomatedRules",
    "affectedOccurrences",
    "passedAutomatedRules",
    "needsManualConfirmation",
    "notApplicableRules",
    "bestPracticeObservations",
    "humanReviewTasks",
  ];
  for (const key of keys) {
    if (ui[key] !== report[key]) {
      throw new Error(
        `Scan result counter mismatch for ${key}: UI ${ui[key]} vs report ${report[key]}`,
      );
    }
  }
}
