import type { AccessibilityPreflightReport } from "@/features/reports/types/reportModel";
import type { ReportAiRemediationCandidate } from "@/features/reports/types/reportAiRemediation";
import {
  aiRemediationIncludedSummaryLine,
  buildReportAiRemediationAppendix,
  type AiRemediationSelectionInput,
} from "@/lib/ai/remediation/report";

export function attachAiRemediationAppendix(
  report: AccessibilityPreflightReport,
  candidates: ReportAiRemediationCandidate[],
  selection: AiRemediationSelectionInput,
): AccessibilityPreflightReport {
  const appendix = buildReportAiRemediationAppendix(candidates, selection);
  if (!appendix) {
    const { aiRemediationAppendix: _, aiRemediationIncludedSummary: __, ...rest } =
      report;
    void _;
    void __;
    return rest;
  }
  const summaryLine = aiRemediationIncludedSummaryLine(appendix.includedCount);
  return {
    ...report,
    aiRemediationAppendix: appendix,
    aiRemediationIncludedSummary: summaryLine,
    limitations: summaryLine
      ? [...report.limitations, summaryLine]
      : report.limitations,
  };
}
