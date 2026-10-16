import "server-only";

import type OpenAI from "openai";
import {
  checkRemediationSessionCaps,
  recordRemediationSessionCapHit,
} from "@/lib/ai/remediation/checkRemediationSessionCaps";
import { AiRemediationError } from "@/lib/ai/remediation/errors";
import { fingerprintRemediationRequest } from "@/lib/ai/remediation/fingerprintRemediationRequest";
import { generateRemediation } from "@/lib/ai/remediation/generateRemediation";
import {
  getCachedRemediation,
  remediationCacheKey,
  setCachedRemediation,
} from "@/lib/ai/remediation/remediationSessionCache";
import type {
  RemediationApiRequestBody,
  RemediationApiSuccessResponse,
} from "@/lib/ai/remediation/types";
import { getRemediationModel, isRemediationModelConfigured } from "@/lib/openai/config";

export async function runRemediationRequest(
  clientKey: string,
  request: RemediationApiRequestBody,
  clientOverride?: OpenAI,
): Promise<RemediationApiSuccessResponse> {
  const framework = request.frameworkPreference ?? "generic_html";
  const model = isRemediationModelConfigured() ? getRemediationModel() : "";

  const input = {
    source: request.source,
    facts: request.facts,
    deterministicGuidance: request.deterministicGuidance,
    preferences: { framework },
  };

  const fingerprint = fingerprintRemediationRequest(input, framework, model);
  const cacheKey = remediationCacheKey(clientKey, request.sessionId, fingerprint);
  const cached = getCachedRemediation(cacheKey);
  if (cached) {
    return {
      report: cached.report,
      facts: request.facts,
      promptVersion: cached.promptVersion,
      schemaVersion: cached.schemaVersion,
      generatedAt: cached.generatedAt,
      cached: true,
    };
  }

  const cap = checkRemediationSessionCaps(request.sessionId, request.scanId);
  if (!cap.allowed) {
    throw new AiRemediationError(
      "AI_REMEDIATION_SESSION_CAP",
      "Session remediation cap reached.",
    );
  }

  const result = await generateRemediation(input, clientOverride);
  setCachedRemediation(cacheKey, result);
  recordRemediationSessionCapHit(request.sessionId, request.scanId);

  return {
    report: result.report,
    facts: request.facts,
    promptVersion: result.promptVersion,
    schemaVersion: result.schemaVersion,
    generatedAt: result.generatedAt,
    cached: false,
  };
}
