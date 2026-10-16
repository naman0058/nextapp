import { prepareImageForAnalysis } from "@/features/accessibility/utils/client/prepareImageForAnalysis";
import {
  AiRequestError,
  requestAiImageAnalysis,
} from "@/features/accessibility/utils/client/requestAiImageAnalysis";
import {
  BATCH_AI_CONCURRENCY,
  MAX_AI_BATCH_ITEMS_PER_RUN,
  MAX_AI_BATCH_ITEMS_PER_SESSION,
} from "@/features/batch/constants/batchLimits";
import type { BatchAccessibilityItem } from "@/features/batch/types/batchItem";
import { computeBatchAiFingerprint } from "@/features/batch/utils/ai/batchAiStale";
import { analyzeBatchItemLocal } from "@/features/batch/utils/analysis/analyzeBatchItemLocal";

export type BatchAiQueueCallbacks = {
  onProgress: (stats: {
    total: number;
    completed: number;
    succeeded: number;
    failed: number;
  }) => void;
  onItemUpdate: (item: BatchAccessibilityItem) => void;
  isCancelled: () => boolean;
};

export type BatchAiQueuePlan = {
  eligibleIds: string[];
  skippedNoImage: number;
  skippedAlreadyAnalyzed: number;
  cappedCount: number;
  error?: string;
};

export function planBatchAiRun(
  items: BatchAccessibilityItem[],
  selectedIds: string[],
  sessionAiCount: number,
): BatchAiQueuePlan {
  const selected = new Set(selectedIds);
  let skippedNoImage = 0;
  let skippedAlreadyAnalyzed = 0;
  const eligibleIds: string[] = [];

  for (const item of items) {
    if (!selected.has(item.id)) continue;
    if (!item.image?.file?.size || !item.platform) {
      skippedNoImage++;
      continue;
    }
    if (item.ai.status === "success" && item.ai.analysis) {
      skippedAlreadyAnalyzed++;
      continue;
    }
    eligibleIds.push(item.id);
  }

  const remainingSession = MAX_AI_BATCH_ITEMS_PER_SESSION - sessionAiCount;
  if (remainingSession <= 0) {
    return {
      eligibleIds: [],
      skippedNoImage,
      skippedAlreadyAnalyzed,
      cappedCount: 0,
      error: `This session has reached the limit of ${MAX_AI_BATCH_ITEMS_PER_SESSION} AI image reviews.`,
    };
  }

  const capped = eligibleIds.slice(
    0,
    Math.min(MAX_AI_BATCH_ITEMS_PER_RUN, remainingSession),
  );

  return {
    eligibleIds: capped,
    skippedNoImage,
    skippedAlreadyAnalyzed,
    cappedCount: capped.length,
    error:
      eligibleIds.length > capped.length
        ? `AI image analysis can be run on up to ${MAX_AI_BATCH_ITEMS_PER_RUN} items at a time.`
        : undefined,
  };
}

export async function runBatchAiQueue(
  items: BatchAccessibilityItem[],
  itemIds: string[],
  callbacks: BatchAiQueueCallbacks,
): Promise<{ sessionAiDelta: number }> {
  const byId = new Map(items.map((i) => [i.id, i]));
  const queue = [...itemIds];
  let completed = 0;
  let succeeded = 0;
  let failed = 0;
  let sessionAiDelta = 0;
  let active = 0;
  let index = 0;

  return new Promise((resolve) => {
    const pump = () => {
      if (callbacks.isCancelled()) {
        if (active === 0) resolve({ sessionAiDelta });
        return;
      }
      while (
        active < BATCH_AI_CONCURRENCY &&
        index < queue.length &&
        !callbacks.isCancelled()
      ) {
        const id = queue[index++];
        active++;
        void processOne(id).finally(() => {
          active--;
          pump();
        });
      }
      if (active === 0 && index >= queue.length) {
        resolve({ sessionAiDelta });
      }
    };

    async function processOne(id: string) {
      let item = byId.get(id);
      if (!item || !item.platform || !item.image?.file?.size) {
        completed++;
        callbacks.onProgress({
          total: queue.length,
          completed,
          succeeded,
          failed,
        });
        return;
      }

      item = {
        ...item,
        processingState: "ai_processing",
        ai: { ...item.ai, status: "processing" },
      };
      callbacks.onItemUpdate(item);

      try {
        const prepared = await prepareImageForAnalysis(item.image!.file);
        const analysis = await requestAiImageAnalysis({
          imageBlob: prepared.blob,
          fileName: prepared.fileName,
          platform: item.platform!,
          caption: item.caption,
          altText: item.altText,
        });
        const fingerprint = computeBatchAiFingerprint(item);
        let next: BatchAccessibilityItem = {
          ...item,
          ai: {
            status: "success",
            analysis,
            fingerprint,
            error: null,
            completedAt: new Date().toISOString(),
          },
          processingState: "complete",
        };
        next = analyzeBatchItemLocal(next);
        callbacks.onItemUpdate(next);
        succeeded++;
        sessionAiDelta++;
      } catch (e) {
        const message =
          e instanceof AiRequestError
            ? e.message
            : "AI image review failed for this item.";
        const next: BatchAccessibilityItem = {
          ...item,
          ai: {
            ...item.ai,
            status: "error",
            error: message,
            analysis: null,
          },
          processingState: "failed",
          overallStatus: "Needs Review",
        };
        callbacks.onItemUpdate(next);
        failed++;
      }

      completed++;
      callbacks.onProgress({
        total: queue.length,
        completed,
        succeeded,
        failed,
      });
    }

    if (queue.length === 0) {
      resolve({ sessionAiDelta: 0 });
      return;
    }
    pump();
  });
}
