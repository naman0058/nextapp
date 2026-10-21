import type { ReportContribution } from "@/features/accessibility-workspace/types";
import { visualLocatorContributionId } from "@/features/accessibility-workspace/contributionIds";
import {
  sanitizeHandoffPageUrl,
  sanitizeHandoffSelector,
} from "@/features/accessibility-workspace/sanitizeHandoffContext";

export function buildVisualLocatorContribution(input: {
  findingId: string;
  ruleId: string;
  remediationGroupId?: string;
  evidenceId: string;
  occurrenceIndex: number;
  occurrenceTotal: number;
  pageUrl: string;
  viewportId: "desktop" | "mobile";
  selectorLabel?: string;
  locatorMatch?: "exact" | "strong";
  includedInReport: boolean;
}): ReportContribution {
  const now = new Date().toISOString();
  const page = sanitizeHandoffPageUrl(input.pageUrl);
  const scopeLabel = `Visual evidence for occurrence ${input.occurrenceIndex} of ${input.occurrenceTotal} on this page only.`;

  return {
    contributionId: visualLocatorContributionId(
      input.findingId,
      input.evidenceId,
      input.occurrenceIndex,
    ),
    toolId: "visual_issue_locator",
    toolVersion: "1",
    createdAt: now,
    updatedAt: now,
    sourceType: "visual_evidence",
    scope: {
      type: "single_occurrence",
      pageUrl: page,
      viewportId: input.viewportId,
      selector: sanitizeHandoffSelector(input.selectorLabel),
      occurrenceLabel: scopeLabel,
    },
    title: "Visual evidence linked to finding",
    summary: `Visual evidence linked to this finding (${input.locatorMatch ?? "located"} match). Screenshot remains session-only; not stored in report JSON.`,
    findings: [],
    measurements: [
      { name: "occurrence_index", value: input.occurrenceIndex },
      { name: "occurrence_total_on_page", value: input.occurrenceTotal },
      ...(input.locatorMatch
        ? [{ name: "locator_match", value: input.locatorMatch }]
        : []),
    ],
    evidence: [
      {
        evidenceId: input.evidenceId,
        label: "Visual locator reference",
        selector: sanitizeHandoffSelector(input.selectorLabel),
        failureSummary: scopeLabel,
      },
    ],
    remediationActions: [],
    humanReviewTasks: [],
    verificationResults: [],
    relatedWebsiteFindingIds: [input.findingId],
    relatedRuleIds: [input.ruleId],
    relatedRemediationGroupIds: input.remediationGroupId
      ? [input.remediationGroupId]
      : [],
    includedInReport: input.includedInReport,
    exportEligibility: "allowed",
    privacyClassification: "local_session",
  };
}
