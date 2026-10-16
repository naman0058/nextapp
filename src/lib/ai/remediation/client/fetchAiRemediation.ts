import type {
  RemediationApiRequestBody,
  RemediationApiSuccessResponse,
} from "@/lib/ai/remediation/types";

export type FetchAiRemediationResult =
  | { ok: true; data: RemediationApiSuccessResponse }
  | { ok: false; error: string; code?: string; retryAfterMs?: number };

export async function fetchAiRemediation(
  body: RemediationApiRequestBody,
): Promise<FetchAiRemediationResult> {
  const res = await fetch("/api/accessibility/ai-remediation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as RemediationApiSuccessResponse & {
    error?: string;
    code?: string;
    retryAfterMs?: number;
  };
  if (!res.ok) {
    return {
      ok: false,
      error: json.error ?? "AI remediation could not be generated.",
      code: json.code,
      retryAfterMs: json.retryAfterMs,
    };
  }
  return { ok: true, data: json };
}
