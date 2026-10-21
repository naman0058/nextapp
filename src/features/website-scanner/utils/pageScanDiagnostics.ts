import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

export type PageExecutionStatus = "complete" | "partial" | "failed";
export type EvidenceReportingStatus = "complete" | "limited";

export type PageScanDiagnostic = {
  pageUrl: string;
  pageExecution: PageExecutionStatus;
  evidenceReporting: EvidenceReportingStatus;
  totalAffectedOccurrences: number;
  retainedEvidenceExamples: number;
  executionReasons: string[];
  evidenceReasons: string[];
};

function pageExecutionStatus(page: WebsitePageScanResult): {
  status: PageExecutionStatus;
  reasons: string[];
} {
  const q = page.scanQuality;
  const reasons: string[] = [];
  if (page.scanCompleteness === "failed" || q?.scanTimeout) {
    if (q?.scanTimeout) reasons.push("Scan or navigation timed out");
    if (q?.domTruncated) reasons.push("DOM size limit reached");
    return { status: "failed", reasons };
  }
  if (q?.resourceBudgetExceeded) {
    reasons.push("Network request budget exceeded");
  }
  const executionLimited =
    q?.scanTimeout ||
    q?.domTruncated ||
    q?.resourceBudgetExceeded;
  if (executionLimited) {
    if (reasons.length === 0 && page.scanCompleteness === "partial") {
      reasons.push("Page scan reported partial execution");
    }
    return {
      status: q?.scanTimeout ? "failed" : "partial",
      reasons,
    };
  }
  if (
    page.scanCompleteness === "partial" &&
    !q?.nodeEvidenceTruncated
  ) {
    return {
      status: "partial",
      reasons: ["Page scan reported partial completeness"],
    };
  }
  return { status: "complete", reasons: [] };
}

function evidenceReportingStatus(page: WebsitePageScanResult): {
  status: EvidenceReportingStatus;
  reasons: string[];
} {
  const q = page.scanQuality;
  const reporting = page.nodeReporting;
  const reasons: string[] = [];
  if (q?.nodeEvidenceTruncated || reporting?.truncated) {
    const total = reporting?.totalOccurrences ?? 0;
    const shown = reporting?.examplesShown ?? 0;
    if (total > 0 && shown < total) {
      reasons.push(
        `Detailed evidence retained for ${shown} of ${total} affected occurrence(s)`,
      );
    } else {
      reasons.push("Detailed node evidence was truncated to reporting limits");
    }
    return { status: "limited", reasons };
  }
  if (q?.domTruncated) {
    reasons.push("DOM truncated before full analysis");
    return { status: "limited", reasons };
  }
  return { status: "complete", reasons: [] };
}

export function buildPageScanDiagnostic(
  page: WebsitePageScanResult,
): PageScanDiagnostic {
  const exec = pageExecutionStatus(page);
  const evidence = evidenceReportingStatus(page);
  return {
    pageUrl: page.finalUrl,
    pageExecution: exec.status,
    evidenceReporting: evidence.status,
    totalAffectedOccurrences: page.nodeReporting?.totalOccurrences ?? 0,
    retainedEvidenceExamples: page.nodeReporting?.examplesShown ?? 0,
    executionReasons: exec.reasons,
    evidenceReasons: evidence.reasons,
  };
}

export function buildSiteScanDiagnostics(
  pages: WebsitePageScanResult[],
): PageScanDiagnostic[] {
  return pages.map(buildPageScanDiagnostic);
}

export function formatPageExecutionLabel(status: PageExecutionStatus): string {
  switch (status) {
    case "complete":
      return "Complete";
    case "partial":
      return "Partial";
    case "failed":
      return "Failed";
    default:
      return status;
  }
}

export function formatEvidenceReportingLabel(
  status: EvidenceReportingStatus,
): string {
  return status === "limited" ? "Limited" : "Complete";
}

export function aggregatePageExecution(
  pages: WebsitePageScanResult[],
): PageExecutionStatus {
  const diagnostics = buildSiteScanDiagnostics(pages);
  if (diagnostics.some((d) => d.pageExecution === "failed")) return "failed";
  if (diagnostics.some((d) => d.pageExecution === "partial")) return "partial";
  return "complete";
}

export function aggregateEvidenceReporting(
  pages: WebsitePageScanResult[],
): EvidenceReportingStatus {
  return buildSiteScanDiagnostics(pages).some(
    (d) => d.evidenceReporting === "limited",
  )
    ? "limited"
    : "complete";
}
