import { buildPlatformChecklist } from "@/features/accessibility/utils/platform/buildPlatformChecklist";
import { runPreflightAnalysis } from "@/features/accessibility/utils/runPreflightAnalysis";
import { buildScreenReaderPreview } from "@/features/accessibility/utils/screenReaderPreview";
import type { BatchAccessibilityItem, BatchOverallStatus } from "@/features/batch/types/batchItem";
import type { SocialPlatform } from "@/types";

const DEFAULT_PLATFORM: SocialPlatform = "instagram";

export function deriveItemOverallStatus(
  item: Pick<
    BatchAccessibilityItem,
    "validation" | "localAnalysis" | "ai" | "processingState"
  >,
): BatchOverallStatus {
  if (item.validation.severity === "invalid") return "Failed";
  if (item.processingState === "failed") return "Failed";
  if (!item.localAnalysis) return "Incomplete";

  const phase1 = item.localAnalysis.phase1;
  if (phase1.counts.fail > 0) return "Attention Required";
  if (phase1.counts.review > 0 || item.localAnalysis.humanReviewCount > 0) {
    return "Needs Review";
  }
  if (item.ai.status === "error") return "Needs Review";
  return "Ready for Review";
}

export function analyzeBatchItemLocal(
  item: BatchAccessibilityItem,
): BatchAccessibilityItem {
  if (!item.validation.canAnalyze) {
    return {
      ...item,
      processingState: "failed",
      overallStatus: "Failed",
    };
  }

  const platform = item.platform ?? DEFAULT_PLATFORM;
  const hasImage = Boolean(item.image?.file && item.image.file.size > 0);
  const altText = item.altText;

  const phase1 = runPreflightAnalysis({
    platform,
    caption: item.caption,
    hasImage,
    altText,
  });

  const sr = buildScreenReaderPreview({
    caption: item.caption,
    altText,
    hasImage,
    platform,
    altTextSource: altText.trim()
      ? item.altTextSource === "none"
        ? "user"
        : item.altTextSource
      : "none",
    imagePurpose: item.ai.analysis?.imagePurpose ?? null,
  });

  const aiStatus =
    item.ai.status === "success"
      ? ("success" as const)
      : item.ai.status === "error"
        ? ("error" as const)
        : item.ai.status === "stale"
          ? ("stale" as const)
          : ("idle" as const);

  const platformChecklist = buildPlatformChecklist({
    platform,
    caption: item.caption,
    altText,
    hasImage,
    phase1,
    phase2: {
      aiStatus,
      hasAnalysis: Boolean(item.ai.analysis),
    },
    phase3: { measured: false },
    phase4: { experienceLevel: sr.experienceSummary.level },
    userPublishingConfirmations: {},
  });

  const captionIssueCount = phase1.checks.filter(
    (c) =>
      c.category === "caption" ||
      c.category === "hashtags" ||
      c.category === "emoji",
  ).filter((c) => c.status === "review" || c.status === "fail").length;

  const humanReviewItems = buildHumanReviewFromChecks(phase1, platformChecklist, item);

  const localAnalysis = {
    phase1,
    screenReaderSummary: sr.experienceSummary,
    noiseCount: sr.noiseFindings.length,
    platformChecklist,
    issueCount: phase1.counts.review + phase1.counts.fail,
    captionIssueCount,
    humanReviewCount: humanReviewItems.length,
  };

  const next: BatchAccessibilityItem = {
    ...item,
    localAnalysis,
    humanReviewItems,
    processingState: "local_complete",
    visualStatus: { contrast: "not_checked" },
  };

  return {
    ...next,
    overallStatus: deriveItemOverallStatus(next),
  };
}

function buildHumanReviewFromChecks(
  phase1: ReturnType<typeof runPreflightAnalysis>,
  checklist: ReturnType<typeof buildPlatformChecklist>,
  item: BatchAccessibilityItem,
) {
  const items: BatchAccessibilityItem["humanReviewItems"] = [];
  for (const c of phase1.checks) {
    if (c.status === "review" || c.status === "fail") {
      items.push({
        id: `p1-${c.id}`,
        category: c.category,
        title: c.title,
        detail: c.summary,
        priority: c.status === "fail" ? "high" : "medium",
      });
    }
  }
  for (const row of checklist) {
    if (row.status === "review") {
      items.push({
        id: `plat-${row.id}`,
        category: "platform",
        title: row.label,
        detail: row.detail ?? row.label,
        priority: "medium",
      });
    }
  }
  if (item.ai.analysis?.humanReview.required) {
    for (const [i, reason] of item.ai.analysis.humanReview.reasons.entries()) {
      items.push({
        id: `ai-hr-${i}`,
        category: "ai",
        title: "AI human review",
        detail: reason,
        priority: "high",
      });
    }
  }
  return items;
}
