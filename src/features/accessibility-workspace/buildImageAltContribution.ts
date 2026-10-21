import type { ReportContribution, ContributionProvenance } from "@/features/accessibility-workspace/types";
import { imageAltContributionId } from "@/features/accessibility-workspace/contributionIds";
import { getDeterministicRemediation } from "@/features/website-scanner/remediation/registry";
import { sanitizeHandoffAltText } from "@/features/accessibility-workspace/sanitizeHandoffContext";

export function buildImageAltContribution(input: {
  handoff: import("@/features/accessibility-workspace/types").ToolHandoffContext;
  originalAlt?: string;
  proposedAlt: string;
  decorativeDecision?: "decorative" | "meaningful" | null;
  humanReviewed: boolean;
  aiSuggested: boolean;
  includedInReport: boolean;
}): ReportContribution {
  const { handoff } = input;
  const now = new Date().toISOString();
  const def = getDeterministicRemediation(handoff.ruleId);
  let sourceType: ContributionProvenance = "human_review";
  if (input.aiSuggested && !input.humanReviewed) sourceType = "ai_assisted";
  else if (input.aiSuggested && input.humanReviewed) sourceType = "human_review";

  const scopeLabel =
    handoff.scannerTotalOccurrences && handoff.scannerTotalOccurrences > 1
      ? `Alt review for one referenced element — not all ${handoff.scannerTotalOccurrences} scanner occurrences.`
      : "Single image/alt review from checker workflow.";

  return {
    contributionId: imageAltContributionId(handoff.returnTo.findingId),
    toolId: "image_alt_checker",
    toolVersion: "1",
    createdAt: now,
    updatedAt: now,
    sourceType,
    scope: {
      type: "single_occurrence",
      pageUrl: handoff.pageOrigin,
      viewportId: handoff.viewportId,
      selector: handoff.sanitizedSelector,
      occurrenceLabel: scopeLabel,
    },
    title: input.aiSuggested
      ? "Image / alt review (AI-assisted suggestion)"
      : "Image / alt review",
    summary: input.humanReviewed
      ? "User reviewed proposed alternative text."
      : input.aiSuggested
        ? "AI-assisted alt suggestion — review before publishing."
        : "Alt text review recorded.",
    findings: [
      {
        id: "alt-review",
        title: "Alt text review",
        summary: sanitizeHandoffAltText(input.proposedAlt) ?? "",
        provenance: sourceType,
      },
    ],
    measurements: [
      ...(input.decorativeDecision
        ? [{ name: "decorative_decision", value: input.decorativeDecision }]
        : []),
      { name: "human_reviewed", value: input.humanReviewed ? "yes" : "no" },
    ],
    evidence: input.originalAlt
      ? [
          {
            evidenceId: "prior-alt",
            label: "Prior alt (from scanner context)",
            failureSummary: sanitizeHandoffAltText(input.originalAlt),
          },
        ]
      : [],
    remediationActions: [],
    humanReviewTasks: input.humanReviewed ? ["Alt text reviewed by user"] : [],
    verificationResults: input.humanReviewed
      ? [
          {
            kind: "human_review",
            label: "User reviewed proposed alt text",
            detail: "Does not certify semantic quality for all similar images.",
          },
        ]
      : [],
    relatedWebsiteFindingIds: [handoff.returnTo.findingId],
    relatedRuleIds: [handoff.ruleId],
    relatedRemediationGroupIds: handoff.returnTo.remediationGroupId
      ? [handoff.returnTo.remediationGroupId]
      : [],
    includedInReport: input.includedInReport,
    exportEligibility: "allowed",
    privacyClassification: "sanitized_export",
    remediationDefinitionId: def?.ruleId,
    remediationDefinitionVersion: def?.definitionVersion,
  };
}
