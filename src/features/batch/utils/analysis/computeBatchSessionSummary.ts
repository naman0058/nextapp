import type { BatchAccessibilityItem } from "@/features/batch/types/batchItem";
import type { BatchSessionSummary } from "@/features/batch/types/batchSession";

export function computeBatchSessionSummary(
  items: BatchAccessibilityItem[],
): BatchSessionSummary {
  let ready = 0;
  let needsReview = 0;
  let attention = 0;
  let failed = 0;
  let aiCompleted = 0;
  let aiNotRun = 0;
  let imagesMissing = 0;
  let missingAltText = 0;
  let scoreSum = 0;
  let scoreCount = 0;
  const platformCounts: Record<string, number> = {};
  const categoryCounts = new Map<string, number>();

  for (const item of items) {
    const platform = item.platform ?? "unspecified";
    platformCounts[platform] = (platformCounts[platform] ?? 0) + 1;

    switch (item.overallStatus) {
      case "Ready for Review":
        ready++;
        break;
      case "Attention Required":
        attention++;
        break;
      case "Failed":
        failed++;
        break;
      default:
        needsReview++;
    }

    if (item.ai.status === "success") aiCompleted++;
    else if (item.ai.status === "not_run" || item.ai.status === "stale")
      aiNotRun++;

    if (item.imageFilename && !item.image?.file?.size) imagesMissing++;
    if (item.image?.file?.size && !item.altText.trim()) missingAltText++;

    if (item.localAnalysis) {
      scoreSum += item.localAnalysis.phase1.score;
      scoreCount++;
    }

    for (const hr of item.humanReviewItems) {
      categoryCounts.set(hr.category, (categoryCounts.get(hr.category) ?? 0) + 1);
    }
  }

  const topIssueCategories = [...categoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));

  let batchOverallLabel: BatchSessionSummary["batchOverallLabel"] =
    "Incomplete Analysis";
  if (scoreCount === items.length && items.length > 0) {
    if (attention > 0) batchOverallLabel = "Important Items Remaining";
    else if (needsReview > 0) batchOverallLabel = "Review In Progress";
    else batchOverallLabel = "Ready for Final Review";
  }

  return {
    totalItems: items.length,
    ready,
    needsReview,
    attention,
    failed,
    aiCompleted,
    aiNotRun,
    imagesMissing,
    missingAltText,
    averageLocalScore: scoreCount ? Math.round(scoreSum / scoreCount) : null,
    batchOverallLabel,
    platformCounts,
    topIssueCategories,
  };
}
