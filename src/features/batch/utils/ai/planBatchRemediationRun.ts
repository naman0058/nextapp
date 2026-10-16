import {
  MAX_AI_BATCH_REMEDIATION_PER_RUN,
  MAX_AI_BATCH_REMEDIATION_PER_SESSION,
} from "@/features/batch/constants/batchLimits";
import type { BatchAccessibilityItem } from "@/features/batch/types/batchItem";
import type { BatchRemediationTarget } from "@/lib/ai/remediation/adapters/buildBatchRemediationContext";

export type BatchRemediationQueuePlan = {
  eligibleIds: string[];
  skippedNoAnalysis: number;
  skippedInvalid: number;
  cappedCount: number;
  error?: string;
};

export function planBatchRemediationRun(
  items: BatchAccessibilityItem[],
  selectedIds: string[],
  sessionRemediationCount: number,
  target: BatchRemediationTarget,
): BatchRemediationQueuePlan {
  const selected = new Set(selectedIds);
  let skippedNoAnalysis = 0;
  let skippedInvalid = 0;
  const eligibleIds: string[] = [];

  for (const item of items) {
    if (!selected.has(item.id)) continue;
    if (!item.platform || !item.validation.canAnalyze) {
      skippedInvalid++;
      continue;
    }
    if (!item.localAnalysis) {
      skippedNoAnalysis++;
      continue;
    }
    if (target === "alt" && !item.image?.file?.size) {
      skippedInvalid++;
      continue;
    }
    eligibleIds.push(item.id);
  }

  const remainingSession =
    MAX_AI_BATCH_REMEDIATION_PER_SESSION - sessionRemediationCount;
  if (remainingSession <= 0) {
    return {
      eligibleIds: [],
      skippedNoAnalysis,
      skippedInvalid,
      cappedCount: 0,
      error: `This session has reached the limit of ${MAX_AI_BATCH_REMEDIATION_PER_SESSION} AI remediations.`,
    };
  }

  const capped = eligibleIds.slice(
    0,
    Math.min(MAX_AI_BATCH_REMEDIATION_PER_RUN, remainingSession),
  );

  return {
    eligibleIds: capped,
    skippedNoAnalysis,
    skippedInvalid,
    cappedCount: capped.length,
    error:
      eligibleIds.length > capped.length
        ? `AI remediation can be run on up to ${MAX_AI_BATCH_REMEDIATION_PER_RUN} selected items at a time.`
        : capped.length === 0
          ? "No selected items are eligible. Run local preflight first."
          : undefined,
  };
}
