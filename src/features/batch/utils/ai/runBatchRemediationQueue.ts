import { BATCH_AI_CONCURRENCY } from "@/features/batch/constants/batchLimits";
import type { BatchAccessibilityItem } from "@/features/batch/types/batchItem";
import { buildBatchRemediationContext } from "@/lib/ai/remediation/adapters/buildBatchRemediationContext";
import type { BatchRemediationTarget } from "@/lib/ai/remediation/adapters/buildBatchRemediationContext";
import { fetchAiRemediation } from "@/lib/ai/remediation/client/fetchAiRemediation";

export type BatchRemediationQueueCallbacks = {
  onProgress: (stats: {
    total: number;
    completed: number;
    succeeded: number;
    failed: number;
  }) => void;
  onItemUpdate: (item: BatchAccessibilityItem) => void;
  isCancelled: () => boolean;
};

export async function runBatchRemediationQueue(
  items: BatchAccessibilityItem[],
  itemIds: string[],
  sessionId: string,
  target: BatchRemediationTarget,
  callbacks: BatchRemediationQueueCallbacks,
): Promise<{ sessionRemediationDelta: number }> {
  const byId = new Map(items.map((i) => [i.id, i]));
  const queue = [...itemIds];
  let completed = 0;
  let succeeded = 0;
  let failed = 0;
  let sessionRemediationDelta = 0;
  let active = 0;
  let index = 0;

  return new Promise((resolve) => {
    const pump = () => {
      if (callbacks.isCancelled()) {
        if (active === 0) resolve({ sessionRemediationDelta });
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
        resolve({ sessionRemediationDelta });
      }
    };

    async function processOne(id: string) {
      let item = byId.get(id);
      if (!item?.platform || !item.localAnalysis) {
        completed++;
        callbacks.onProgress({ total: queue.length, completed, succeeded, failed });
        return;
      }

      item = {
        ...item,
        remediation: {
          ...item.remediation,
          status: "processing",
          target,
        },
      };
      callbacks.onItemUpdate(item);

      try {
        const platform = item.platform!;
        const localAnalysis = item.localAnalysis!;
        const { facts, deterministicGuidance } = buildBatchRemediationContext({
          batchItemId: item.id,
          platform,
          originalCaption: item.caption,
          altText: item.altText,
          localAnalysis,
          aiAnalysis: item.ai.analysis,
          remediationTarget: target,
        });
        const scanId = `${item.id}:${facts.issueFingerprint ?? target}`;
        const result = await fetchAiRemediation({
          source: "batch",
          sessionId,
          scanId,
          facts,
          deterministicGuidance,
        });

        if (!result.ok) {
          throw new Error(result.error);
        }

        const next: BatchAccessibilityItem = {
          ...item,
          remediation: {
            status: "success",
            target,
            report: result.data.report,
            error: null,
            fingerprint: String(facts.issueFingerprint ?? ""),
            completedAt: result.data.generatedAt,
          },
        };
        callbacks.onItemUpdate(next);
        succeeded++;
        sessionRemediationDelta++;
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "AI remediation failed for this item.";
        const next: BatchAccessibilityItem = {
          ...item,
          remediation: {
            ...item.remediation,
            status: "error",
            target,
            report: null,
            error: message,
          },
        };
        callbacks.onItemUpdate(next);
        failed++;
      }

      completed++;
      callbacks.onProgress({ total: queue.length, completed, succeeded, failed });
    }

    if (queue.length === 0) {
      resolve({ sessionRemediationDelta: 0 });
      return;
    }
    pump();
  });
}
