import type { ReportContribution } from "@/features/accessibility-workspace/types";
import { videoWorkspaceContributionId } from "@/features/accessibility-workspace/contributionIds";

export function buildVideoAccessibilityContribution(input: {
  handoff: import("@/features/accessibility-workspace/types").ToolHandoffContext;
  captionsReviewed: boolean;
  transcriptReviewed: boolean;
  userConfirmationNote?: string;
  includedInReport: boolean;
}): ReportContribution {
  const { handoff } = input;
  const now = new Date().toISOString();

  return {
    contributionId: videoWorkspaceContributionId(handoff.returnTo.findingId),
    toolId: "video_accessibility",
    toolVersion: "1",
    createdAt: now,
    updatedAt: now,
    sourceType: "human_review",
    scope: {
      type: "page",
      pageUrl: handoff.pageOrigin,
      occurrenceLabel:
        "Video tool review for media you uploaded in this session — not full site media verification.",
    },
    title: "Video accessibility review (session media)",
    summary:
      "Caption/transcript review state from Video Accessibility Checker for uploaded media related to a scanner finding.",
    findings: [],
    measurements: [
      { name: "captions_reviewed", value: input.captionsReviewed ? "yes" : "no" },
      { name: "transcript_reviewed", value: input.transcriptReviewed ? "yes" : "no" },
    ],
    evidence: [],
    remediationActions: [],
    humanReviewTasks: input.userConfirmationNote ? [input.userConfirmationNote] : [],
    verificationResults: [],
    relatedWebsiteFindingIds: [handoff.returnTo.findingId],
    relatedRuleIds: [handoff.ruleId],
    relatedRemediationGroupIds: handoff.returnTo.remediationGroupId
      ? [handoff.returnTo.remediationGroupId]
      : [],
    includedInReport: input.includedInReport,
    exportEligibility: "allowed",
    privacyClassification: "local_session",
  };
}
