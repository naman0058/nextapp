import type { BatchRemediationState } from "@/features/batch/types/batchItem";

export function defaultBatchRemediationState(
  target: BatchRemediationState["target"] = "caption",
): BatchRemediationState {
  return {
    status: "not_run",
    target,
    report: null,
    error: null,
    fingerprint: null,
  };
}
