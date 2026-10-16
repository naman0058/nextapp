import type { ReportAiRemediationEntry } from "@/features/reports/types/reportAiRemediation";

export const AI_REMEDIATION_EXCEL_HEADERS = [
  "Source",
  "Issue / Item",
  "Rule",
  "WCAG",
  "Page / Item Reference",
  "Framework",
  "Original Content",
  "Suggested Content",
  "Suggested Code",
  "Recommended Approach",
  "Acceptance Criteria",
  "Verification",
  "Human Review",
  "Assumptions",
  "Limitations",
  "Stale",
  "Generated At",
  "Prompt Version",
] as const;

export function formatAiRemediationForExcelRow(
  entry: ReportAiRemediationEntry,
): string[] {
  const r = entry.remediation;
  const f = entry.facts;
  const code = r.suggestedCode?.code ?? "";
  return [
    entry.source,
    entry.title,
    f?.ruleId ?? "",
    f?.wcag ?? "",
    f?.pageReference ?? f?.itemReference ?? entry.sourceReference,
    entry.framework ?? "",
    f?.originalContent ?? "",
    r.suggestedContent ?? "",
    code,
    r.recommendedApproach.join("\n"),
    r.acceptanceCriteria.join("\n"),
    r.verificationSteps.join("\n"),
    r.humanReview.join("\n"),
    r.assumptions.join("\n"),
    r.limitations.join("\n"),
    entry.stale ? "yes" : "no",
    entry.generatedAt ?? "",
    entry.promptVersion ?? "",
  ];
}
