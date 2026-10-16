import type { WebsitePageMetadata } from "@/features/website-scanner/types/scanTypes";
import {
  MANUAL_REVIEW_LIBRARY,
  type ManualReviewDefinition,
} from "@/features/accessibility-intelligence/manual/manualReviewLibrary";

export type ManualReviewRelevance = ManualReviewDefinition & {
  relevance: "high" | "medium" | "low" | "not_applicable";
};

export function scoreManualReviewRelevance(
  def: ManualReviewDefinition,
  metadata: WebsitePageMetadata,
): ManualReviewRelevance["relevance"] {
  if (def.relevanceTags.includes("always")) return "high";
  if (def.relevanceTags.includes("video")) {
    return metadata.videoCount > 0 ? "high" : "not_applicable";
  }
  if (def.relevanceTags.includes("forms")) {
    return metadata.formCount > 0 ? "high" : "not_applicable";
  }
  if (def.relevanceTags.includes("images")) {
    return metadata.imageCount > 0 ? "high" : "low";
  }
  if (def.relevanceTags.includes("dialogs")) {
    return metadata.dialogHintCount > 0 ? "high" : "low";
  }
  if (def.relevanceTags.includes("interactive")) {
    return metadata.interactiveControlCount > 0 ? "medium" : "low";
  }
  return "medium";
}

export function buildRelevantManualReviews(
  metadata: WebsitePageMetadata,
): ManualReviewRelevance[] {
  return MANUAL_REVIEW_LIBRARY.map((def) => ({
    ...def,
    relevance: scoreManualReviewRelevance(def, metadata),
  })).sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2, not_applicable: 3 };
    return order[a.relevance] - order[b.relevance];
  });
}
