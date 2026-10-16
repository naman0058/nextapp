import type {
  AccessibilityPreflightReport,
  ReportSummary,
} from "@/features/reports/types/reportModel";
import type { OverallReportStatus } from "@/features/reports/types/reportStatus";
import { hasMeaningfulChecks } from "@/features/reports/utils/hasMeaningfulChecks";
import type { PreflightReportSourceSnapshot } from "@/features/reports/types/reportSource";

function allFindings(report: AccessibilityPreflightReport) {
  const sections = [
    report.textAccessibility,
    report.imageAccessibility,
    report.visualAccessibility,
    report.screenReaderPreview,
    report.videoAccessibility,
    report.platformPublishing,
  ];
  return sections.flatMap((s) => s?.findings ?? []);
}

export function deriveOverallStatus(
  report: AccessibilityPreflightReport,
  source: PreflightReportSourceSnapshot,
): OverallReportStatus {
  if (!hasMeaningfulChecks(source)) {
    return "Incomplete Preflight";
  }
  const findings = allFindings(report);
  const hasAttention = findings.some(
    (f) => f.status === "attention" || f.status === "error",
  );
  if (hasAttention) return "Important Issues Identified";

  const hasReview =
    findings.some(
      (f) => f.status === "review" || f.status === "human_review",
    ) || report.humanReview.remainingCount > 0;
  if (hasReview) return "Review Recommended";

  const meaningful = findings.filter(
    (f) => f.status !== "not_applicable" && f.status !== "not_checked",
  );
  if (meaningful.length > 0) return "Ready for Final Review";
  return "Incomplete Preflight";
}

export function buildReportSummaryCounts(
  report: AccessibilityPreflightReport,
): Pick<
  ReportSummary,
  | "checksCompleted"
  | "itemsReady"
  | "itemsRequiringReview"
  | "importantIssues"
  | "humanReviewRemaining"
> {
  const findings = allFindings(report);
  let itemsReady = 0;
  let itemsRequiringReview = 0;
  let importantIssues = 0;
  let checksCompleted = 0;
  for (const f of findings) {
    if (f.status === "not_applicable") continue;
    if (f.status !== "not_checked") checksCompleted++;
    if (f.status === "ready") itemsReady++;
    if (
      f.status === "review" ||
      f.status === "human_review" ||
      f.status === "not_checked"
    ) {
      itemsRequiringReview++;
    }
    if (f.status === "attention" || f.status === "error") importantIssues++;
  }
  return {
    checksCompleted,
    itemsReady,
    itemsRequiringReview,
    importantIssues,
    humanReviewRemaining: report.humanReview.remainingCount,
  };
}
