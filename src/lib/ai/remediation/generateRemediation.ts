import "server-only";

import type OpenAI from "openai";
import {
  AI_REMEDIATION_PROMPT_VERSION,
  AI_REMEDIATION_SCHEMA_VERSION,
  AI_REMEDIATION_SCHEMA_NAME,
} from "@/lib/ai/remediation/constants";
import {
  aiRemediationJsonSchema,
} from "@/lib/ai/remediation/aiRemediationJsonSchema";
import { buildRemediationUserPayload } from "@/lib/ai/remediation/buildRemediationUserPayload";
import { detectResponseRefusal } from "@/lib/ai/remediation/detectResponseRefusal";
import { AiRemediationError } from "@/lib/ai/remediation/errors";
import { recordRemediationUsage } from "@/lib/ai/remediation/recordRemediationUsage";
import { AI_REMEDIATION_DEVELOPER_INSTRUCTIONS } from "@/lib/ai/remediation/systemInstructions";
import type { GenerateRemediationInput, GenerateRemediationResult } from "@/lib/ai/remediation/types";
import { validateAiRemediationReport } from "@/lib/ai/remediation/validateAiRemediationReport";
import { isRequestTimeout } from "@/features/accessibility/server/openAiErrorUtils";
import {
  getRemediationModel,
  getRemediationTimeoutMs,
  isAiRemediationEnabled,
  isOpenAiConfigured,
  isRemediationModelConfigured,
} from "@/lib/openai/config";
import { getOpenAiClient } from "@/lib/openai/client";

export async function generateRemediation(
  input: GenerateRemediationInput,
  clientOverride?: OpenAI,
): Promise<GenerateRemediationResult> {
  if (
    !isOpenAiConfigured() ||
    !isAiRemediationEnabled() ||
    !isRemediationModelConfigured()
  ) {
    throw new AiRemediationError(
      "AI_REMEDIATION_UNAVAILABLE",
      "AI remediation is not configured.",
    );
  }

  const model = getRemediationModel();
  const client = clientOverride ?? getOpenAiClient();
  const userPayload = buildRemediationUserPayload(input);

  let response: OpenAI.Responses.Response;
  try {
    response = await client.responses.create(
      {
        model,
        input: [
          {
            role: "developer",
            content: [{ type: "input_text", text: AI_REMEDIATION_DEVELOPER_INSTRUCTIONS }],
          },
          {
            role: "user",
            content: [{ type: "input_text", text: userPayload }],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: AI_REMEDIATION_SCHEMA_NAME,
            strict: true,
            schema: aiRemediationJsonSchema,
          },
        },
      },
      { signal: AbortSignal.timeout(getRemediationTimeoutMs()) },
    );
  } catch (error) {
    if (isRequestTimeout(error)) {
      recordRemediationUsage({
        model,
        source: input.source,
        success: false,
        code: "AI_REMEDIATION_TIMEOUT",
      });
      throw new AiRemediationError("AI_REMEDIATION_TIMEOUT", "Remediation request timed out.", {
        cause: error,
      });
    }
    recordRemediationUsage({
      model,
      source: input.source,
      success: false,
      code: "AI_REMEDIATION_FAILED",
    });
    throw new AiRemediationError("AI_REMEDIATION_FAILED", "Remediation generation failed.", {
      cause: error,
    });
  }

  if (response.status !== "completed") {
    const code =
      response.status === "failed" || response.status === "cancelled"
        ? "AI_REMEDIATION_FAILED"
        : "AI_REMEDIATION_INVALID_OUTPUT";
    recordRemediationUsage({
      model,
      source: input.source,
      success: false,
      code,
    });
    throw new AiRemediationError(
      code,
      code === "AI_REMEDIATION_FAILED"
        ? "Remediation generation failed."
        : "Incomplete remediation response.",
    );
  }

  if (detectResponseRefusal(response)) {
    recordRemediationUsage({
      model,
      source: input.source,
      success: false,
      code: "AI_REMEDIATION_REFUSED",
    });
    throw new AiRemediationError("AI_REMEDIATION_REFUSED", "Model refused remediation request.");
  }

  const raw = response.output_text?.trim();
  if (!raw) {
    recordRemediationUsage({
      model,
      source: input.source,
      success: false,
      code: "AI_REMEDIATION_INVALID_OUTPUT",
    });
    throw new AiRemediationError("AI_REMEDIATION_INVALID_OUTPUT", "Empty remediation response.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    recordRemediationUsage({
      model,
      source: input.source,
      success: false,
      code: "AI_REMEDIATION_INVALID_OUTPUT",
    });
    throw new AiRemediationError("AI_REMEDIATION_INVALID_OUTPUT", "Malformed remediation JSON.");
  }

  const validated = validateAiRemediationReport(parsed, input.source);
  if (!validated.ok) {
    recordRemediationUsage({
      model,
      source: input.source,
      success: false,
      code: "AI_REMEDIATION_INVALID_OUTPUT",
    });
    throw new AiRemediationError("AI_REMEDIATION_INVALID_OUTPUT", "Remediation failed validation.");
  }

  const usage = response.usage;
  recordRemediationUsage({
    model,
    source: input.source,
    success: true,
    inputTokens: usage?.input_tokens,
    outputTokens: usage?.output_tokens,
  });

  return {
    report: validated.data,
    promptVersion: AI_REMEDIATION_PROMPT_VERSION,
    schemaVersion: AI_REMEDIATION_SCHEMA_VERSION,
    model,
    generatedAt: new Date().toISOString(),
    cached: false,
  };
}
