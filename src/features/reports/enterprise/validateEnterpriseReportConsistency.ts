import type { AccessibilityPreflightReport } from "@/features/reports/types/reportModel";
import { BANNED_REPORT_PHRASES } from "@/features/reports/enterprise/constants";
import type { EnterprisePreflightReport } from "@/features/reports/enterprise/types";

export type EnterpriseValidationResult =
  | { ok: true }
  | { ok: false; errors: string[] };

function containsBannedPhrase(text: string): string | null {
  const lower = text.toLowerCase();
  for (const phrase of BANNED_REPORT_PHRASES) {
    if (lower.includes(phrase.replace(/ %$/, ""))) return phrase;
  }
  if (/\b\d{1,3}\s*%\s*(accessible|compliant)/i.test(text)) return "compliance percentage";
  return null;
}

export function validateEnterpriseReportConsistency(
  report: AccessibilityPreflightReport,
  enterprise: EnterprisePreflightReport | null | undefined,
): EnterpriseValidationResult {
  const errors: string[] = [];
  if (!enterprise) {
    if (report.contentType === "website_scan") {
      errors.push("Missing enterpriseView for website scan report");
    }
    return errors.length ? { ok: false, errors } : { ok: true };
  }

  const tax = report.websiteScanTaxonomy;
  if (tax) {
    if (enterprise.counters.failedAutomatedRules !== tax.failedAutomatedRules) {
      errors.push("failedAutomatedRules mismatch between enterprise and taxonomy");
    }
    if (enterprise.counters.affectedOccurrences !== tax.affectedOccurrences) {
      errors.push("affectedOccurrences mismatch between enterprise and taxonomy");
    }
    if (enterprise.counters.needsManualConfirmation !== tax.needsManualConfirmation) {
      errors.push("needsManualConfirmation mismatch");
    }
  }

  if (enterprise.reportMeta.reportId !== report.reportId) {
    errors.push("reportId mismatch across adapters");
  }

  const hr = report.humanReviewWorkspace;
  if (hr) {
    if (enterprise.counters.humanReviewRelevant !== hr.progress.relevant) {
      errors.push("human review relevant count mismatch");
    }
    if (enterprise.counters.humanReviewRemainingOpen !== hr.progress.remainingOpen) {
      errors.push("human review remaining open mismatch");
    }
  }

  const findingIds = new Set<string>();
  for (const finding of enterprise.automatedFindings) {
    if (finding.pdfShownCount > finding.retainedEvidenceCount) {
      errors.push(`pdfShownCount exceeds retained for ${finding.findingId}`);
    }
    if (finding.retainedEvidenceCount > finding.totalOccurrences && finding.totalOccurrences > 0) {
      errors.push(`retained evidence exceeds total occurrences for ${finding.findingId}`);
    }
    if (findingIds.has(finding.findingId)) {
      errors.push(`duplicate finding ${finding.findingId}`);
    }
    findingIds.add(finding.findingId);
  }

  const included = enterprise.additionalEvidence.filter((c) => c.includedInReport);
  if (included.length !== enterprise.exportSelection.contributionsIncludedCount) {
    errors.push("contribution inclusion count mismatch");
  }

  const publicCopy = [
    enterprise.executiveSummary.statusPhrase,
    report.summary.overallStatus,
    ...enterprise.priorities.map((p) => p.title),
  ].join(" ");
  const banned = containsBannedPhrase(publicCopy);
  if (banned) errors.push(`Banned report phrase detected: ${banned}`);

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}
