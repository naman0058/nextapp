import type { ReportContribution } from "@/features/accessibility-workspace/types";
import type { HumanReviewCheckDefinition } from "@/features/human-review-workspace/types";

const TOOL_TO_EVIDENCE: Record<
  string,
  import("@/features/human-review-workspace/types").HumanReviewEvidenceRef["type"]
> = {
  contrast_checker: "contrast_measurement",
  image_alt_checker: "image_alt_review",
  screen_reader_preview: "screen_reader_preview_observation",
  video_accessibility: "video_review_observation",
  visual_issue_locator: "visual_locator_evidence",
};

export function relatedContributionIdsForCheck(
  def: HumanReviewCheckDefinition,
  contributions: ReportContribution[],
  relatedFindingIds: string[],
): ReportContribution[] {
  const toolSet = new Set(def.relatedToolIds);
  return contributions.filter((c) => {
    if (!toolSet.has(c.toolId)) return false;
    if (relatedFindingIds.length === 0) return true;
    return c.relatedWebsiteFindingIds.some((id) => relatedFindingIds.includes(id));
  });
}

export function evidenceRefsFromContributions(
  contributions: ReportContribution[],
): import("@/features/human-review-workspace/types").HumanReviewEvidenceRef[] {
  return contributions.map((c) => ({
    type: TOOL_TO_EVIDENCE[c.toolId] ?? "report_contribution",
    refId: c.contributionId,
    label: `${c.title} (${c.includedInReport ? "in report" : "session only"})`,
  }));
}
