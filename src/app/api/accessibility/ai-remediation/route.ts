import { NextResponse } from "next/server";
import { AiRemediationError, userMessageForCode } from "@/lib/ai/remediation/errors";
import { runRemediationRequest } from "@/lib/ai/remediation/runRemediationRequest";
import { validateRemediationRequest } from "@/lib/ai/remediation/validateRemediationRequest";
import { MAX_REMEDIATION_REQUEST_BYTES } from "@/lib/ai/remediation/constants";
import {
  isAiRemediationEnabled,
  isOpenAiConfigured,
  isRemediationModelConfigured,
} from "@/lib/openai/config";
import { checkAiRemediationRateLimit } from "@/lib/rateLimit/checkAiRemediationRateLimit";

function noStoreJson(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  if (
    !isOpenAiConfigured() ||
    !isAiRemediationEnabled() ||
    !isRemediationModelConfigured()
  ) {
    return noStoreJson(
      {
        error: userMessageForCode("AI_REMEDIATION_UNAVAILABLE"),
        code: "AI_REMEDIATION_UNAVAILABLE",
      },
      503,
    );
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const len = Number.parseInt(contentLength, 10);
    if (Number.isFinite(len) && len > MAX_REMEDIATION_REQUEST_BYTES) {
      return noStoreJson(
        {
          error: userMessageForCode("AI_REMEDIATION_PAYLOAD_TOO_LARGE"),
          code: "AI_REMEDIATION_PAYLOAD_TOO_LARGE",
        },
        413,
      );
    }
  }

  const clientKey = getClientKey(request);
  const limit = checkAiRemediationRateLimit(clientKey);
  if (!limit.allowed) {
    return noStoreJson(
      {
        error: userMessageForCode("AI_REMEDIATION_RATE_LIMITED"),
        code: "AI_REMEDIATION_RATE_LIMITED",
        retryAfterMs: limit.retryAfterMs,
      },
      429,
    );
  }

  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_REMEDIATION_REQUEST_BYTES) {
      return noStoreJson(
        {
          error: userMessageForCode("AI_REMEDIATION_PAYLOAD_TOO_LARGE"),
          code: "AI_REMEDIATION_PAYLOAD_TOO_LARGE",
        },
        413,
      );
    }
    raw = JSON.parse(text);
  } catch {
    return noStoreJson(
      { error: userMessageForCode("AI_REMEDIATION_FAILED"), code: "AI_REMEDIATION_FAILED" },
      400,
    );
  }

  try {
    const validated = validateRemediationRequest(raw);
    const result = await runRemediationRequest(clientKey, validated);
    return noStoreJson(result, 200);
  } catch (err) {
    if (err instanceof AiRemediationError) {
      const status =
        err.code === "AI_REMEDIATION_RATE_LIMITED"
          ? 429
          : err.code === "AI_REMEDIATION_PAYLOAD_TOO_LARGE"
            ? 413
            : err.code === "AI_REMEDIATION_UNAVAILABLE"
              ? 503
              : err.code === "AI_REMEDIATION_SESSION_CAP"
                ? 429
                : 502;
      return noStoreJson(
        { error: userMessageForCode(err.code), code: err.code },
        status,
      );
    }
    return noStoreJson(
      { error: userMessageForCode("AI_REMEDIATION_FAILED"), code: "AI_REMEDIATION_FAILED" },
      502,
    );
  }
}
