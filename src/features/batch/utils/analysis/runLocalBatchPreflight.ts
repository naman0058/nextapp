import { BATCH_LOCAL_CHUNK_SIZE } from "@/features/batch/constants/batchLimits";
import type { BatchAccessibilityItem } from "@/features/batch/types/batchItem";
import { analyzeBatchItemLocal } from "@/features/batch/utils/analysis/analyzeBatchItemLocal";

export async function runLocalBatchPreflight(
  items: BatchAccessibilityItem[],
  onProgress?: (done: number, total: number) => void,
): Promise<BatchAccessibilityItem[]> {
  const total = items.length;
  const result = [...items];

  for (let i = 0; i < result.length; i += BATCH_LOCAL_CHUNK_SIZE) {
    const end = Math.min(i + BATCH_LOCAL_CHUNK_SIZE, result.length);
    for (let j = i; j < end; j++) {
      result[j] = {
        ...result[j],
        processingState: "processing_local",
      };
      result[j] = analyzeBatchItemLocal(result[j]);
    }
    onProgress?.(end, total);
    await yieldToBrowser();
  }

  return result;
}

function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
