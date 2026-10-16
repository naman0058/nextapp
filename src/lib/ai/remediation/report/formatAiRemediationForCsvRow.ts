import type { ReportAiRemediationEntry } from "@/features/reports/types/reportAiRemediation";

export const AI_REMEDIATION_CSV_HEADERS = [
  "Source",
  "Reference",
  "Issue",
  "Suggested Approach",
  "Suggested Content",
  "Suggested Code",
  "Acceptance Criteria",
  "Verification",
  "Human Review",
  "Stale",
] as const;

export function formatAiRemediationForCsvRow(
  entry: ReportAiRemediationEntry,
): string[] {
  const r = entry.remediation;
  return [
    entry.source,
    entry.sourceReference,
    entry.title,
    r.recommendedApproach.join(" | "),
    r.suggestedContent ?? "",
    r.suggestedCode?.code ?? "",
    r.acceptanceCriteria.join(" | "),
    r.verificationSteps.join(" | "),
    r.humanReview.join(" | "),
    entry.stale ? "yes" : "no",
  ];
}
