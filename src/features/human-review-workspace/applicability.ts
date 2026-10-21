import type {
  ApplicabilityLevel,
  HumanReviewCheckDefinition,
} from "@/features/human-review-workspace/types";
import type { WebsitePageMetadata } from "@/features/website-scanner/types/scanTypes";

export function scoreApplicability(
  def: HumanReviewCheckDefinition,
  metadata: WebsitePageMetadata,
  options?: { mobileViewportScanned?: boolean },
): ApplicabilityLevel {
  const tags = def.relevanceTags;
  if (tags.includes("always")) return "relevant";
  if (tags.includes("video")) {
    return metadata.videoCount > 0 ? "relevant" : "not_applicable";
  }
  if (tags.includes("forms")) {
    return metadata.formCount > 0 ? "relevant" : "not_applicable";
  }
  if (tags.includes("images")) {
    return metadata.imageCount > 0 ? "relevant" : "possibly_relevant";
  }
  if (tags.includes("dialogs")) {
    return metadata.dialogHintCount > 0 ? "relevant" : "possibly_relevant";
  }
  if (tags.includes("mobile") || tags.includes("touch")) {
    return options?.mobileViewportScanned ? "relevant" : "possibly_relevant";
  }
  if (tags.includes("headings")) {
    return metadata.headingCount > 0 ? "relevant" : "possibly_relevant";
  }
  if (tags.includes("interactive")) {
    return metadata.interactiveControlCount > 0 ? "relevant" : "possibly_relevant";
  }
  return "unknown";
}

export function isCheckInRelevantQueue(level: ApplicabilityLevel): boolean {
  return level === "relevant" || level === "possibly_relevant";
}
