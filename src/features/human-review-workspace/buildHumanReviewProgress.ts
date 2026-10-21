import type { HumanReviewProgress, HumanReviewRecord } from "@/features/human-review-workspace/types";
import { isCheckInRelevantQueue } from "@/features/human-review-workspace/applicability";

export function buildHumanReviewProgress(
  records: HumanReviewRecord[],
  options?: { relevantOnly?: boolean },
): HumanReviewProgress {
  const relevantOnly = options?.relevantOnly ?? true;
  const pool = relevantOnly
    ? records.filter((r) => isCheckInRelevantQueue(r.applicability))
    : records;

  let passes = 0;
  let needsReview = 0;
  let notApplicable = 0;
  let notReviewed = 0;
  let reviewed = 0;
  let unknownApplicability = 0;
  let possiblyRelevant = 0;

  for (const r of records) {
    if (r.applicability === "unknown") unknownApplicability += 1;
    if (r.applicability === "possibly_relevant") possiblyRelevant += 1;
  }

  for (const r of pool) {
    switch (r.status) {
      case "passes":
        passes += 1;
        reviewed += 1;
        break;
      case "needs_review":
        needsReview += 1;
        reviewed += 1;
        break;
      case "not_applicable":
        notApplicable += 1;
        reviewed += 1;
        break;
      default:
        notReviewed += 1;
    }
  }

  return {
    relevant: pool.length,
    reviewed,
    passes,
    needsReview,
    notApplicable,
    notReviewed,
    unknownApplicability,
    possiblyRelevant,
    remainingOpen: notReviewed + needsReview,
  };
}
