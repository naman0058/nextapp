import type { PreflightReportSourceSnapshot } from "@/features/reports/types/reportSource";
import type { BatchAccessibilityItem } from "@/features/batch/types/batchItem";
import { collectBatchRemediationCandidate } from "@/lib/ai/remediation/report";
import { buildScreenReaderPreview } from "@/features/accessibility/utils/screenReaderPreview";
import type { AiStatus } from "@/features/accessibility/components/checker/checkerReducer";

export function batchItemToReportSource(
  item: BatchAccessibilityItem,
): PreflightReportSourceSnapshot {
  const hasImage = Boolean(item.image?.file?.size);
  const platform = item.platform;
  const aiStatus: AiStatus =
    item.ai.status === "success"
      ? "success"
      : item.ai.status === "error"
        ? "error"
        : item.ai.status === "stale"
          ? "stale"
          : item.ai.status === "processing"
            ? "loading"
            : "idle";

  const screenReaderPreview =
    item.localAnalysis && platform
      ? buildScreenReaderPreview({
          caption: item.caption,
          altText: item.altText,
          hasImage,
          platform,
          altTextSource: item.altText.trim() ? "user" : "none",
          imagePurpose: item.ai.analysis?.imagePurpose ?? null,
        })
      : null;

  return {
    platform: platform ?? null,
    hasImage,
    workingCaption: item.caption,
    altText: item.altText,
    altTextSource: item.altTextSource,
    imageFileName: item.image?.fileName ?? item.imageFilename ?? null,
    phase1: item.localAnalysis?.phase1 ?? null,
    aiAnalysis: item.ai.analysis,
    aiStatus,
    aiError: item.ai.error,
    contrastSnapshot: { measured: false },
    visualSession: null,
    screenReaderEngaged: Boolean(item.localAnalysis),
    screenReaderPreview,
    publishingConfirmations: {},
    video: null,
    aiRemediationCandidates: (() => {
      const c = collectBatchRemediationCandidate(item);
      return c ? [c] : undefined;
    })(),
  };
}
