import type { ReportContribution } from "@/features/accessibility-workspace/types";
import { screenReaderContributionId } from "@/features/accessibility-workspace/contributionIds";
import {
  sanitizeHandoffUserNote,
} from "@/features/accessibility-workspace/sanitizeHandoffContext";

export function buildScreenReaderPreviewContribution(input: {
  handoff: import("@/features/accessibility-workspace/types").ToolHandoffContext;
  observationSummary: string;
  userNote?: string;
  includedInReport: boolean;
}): ReportContribution {
  const { handoff } = input;
  const now = new Date().toISOString();

  return {
    contributionId: screenReaderContributionId(handoff.returnTo.findingId),
    toolId: "screen_reader_preview",
    toolVersion: "1",
    createdAt: now,
    updatedAt: now,
    sourceType: "screen_reader_preview",
    scope: {
      type: "finding",
      pageUrl: handoff.pageOrigin,
      viewportId: handoff.viewportId,
      occurrenceLabel: "Screen Reader Preview observation — not assistive technology testing.",
    },
    title: "Screen Reader Preview observation",
    summary: input.observationSummary,
    findings: [
      {
        id: "sr-observation",
        title: "Preview observation",
        summary: sanitizeHandoffUserNote(input.userNote) ?? input.observationSummary,
        provenance: "screen_reader_preview",
      },
    ],
    measurements: [],
    evidence: [],
    remediationActions: [],
    humanReviewTasks: input.userNote ? ["User note attached"] : [],
    verificationResults: [],
    relatedWebsiteFindingIds: [handoff.returnTo.findingId],
    relatedRuleIds: [handoff.ruleId],
    relatedRemediationGroupIds: handoff.returnTo.remediationGroupId
      ? [handoff.returnTo.remediationGroupId]
      : [],
    includedInReport: input.includedInReport,
    exportEligibility: "allowed",
    privacyClassification: "sanitized_export",
  };
}
