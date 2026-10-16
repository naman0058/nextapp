import "server-only";

import type { AiRemediationErrorCode } from "@/lib/ai/remediation/errors";

export type RemediationUsageLog = {
  model: string;
  source: string;
  success: boolean;
  code?: AiRemediationErrorCode;
  inputTokens?: number;
  outputTokens?: number;
  cached?: boolean;
};

/** Privacy-safe aggregate logging — never log evidence or response body. */
export function recordRemediationUsage(entry: RemediationUsageLog): void {
  const payload = {
    feature: "ai_remediation",
    model: entry.model,
    source: entry.source,
    success: entry.success,
    ...(entry.code ? { code: entry.code } : {}),
    ...(entry.inputTokens != null ? { inputTokens: entry.inputTokens } : {}),
    ...(entry.outputTokens != null ? { outputTokens: entry.outputTokens } : {}),
    ...(entry.cached ? { cached: true } : {}),
  };
  console.info("[ai_remediation]", JSON.stringify(payload));
}
