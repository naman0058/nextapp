import type { HumanReviewStatus } from "@/features/human-review-workspace/types";

export function humanReviewResultWording(status: HumanReviewStatus): string {
  switch (status) {
    case "passes":
      return "Reviewer marked this procedure as passes (human review result).";
    case "needs_review":
      return "Needs further review.";
    case "not_applicable":
      return "Not applicable to the reviewed scope.";
    default:
      return "Not reviewed.";
  }
}
