import type { HumanReviewReportBlock } from "@/features/human-review-workspace/types";
import { buildHumanReviewProgress } from "@/features/human-review-workspace/buildHumanReviewProgress";
import { isCheckInRelevantQueue } from "@/features/human-review-workspace/applicability";
import type { HumanReviewRecord } from "@/features/human-review-workspace/types";

export function buildHumanReviewReportBlock(
  records: HumanReviewRecord[],
): HumanReviewReportBlock {
  const relevantRecords = records.filter((r) =>
    isCheckInRelevantQueue(r.applicability),
  );
  return {
    progress: buildHumanReviewProgress(records),
    records: relevantRecords,
    disclaimer:
      "Human review results describe reviewer judgments for listed procedures. They do not constitute accessibility certification or universal WCAG compliance.",
  };
}
