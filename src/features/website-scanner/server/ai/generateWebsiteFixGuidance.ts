/** @deprecated AI-R2 — website Fix Lab uses POST /api/accessibility/ai-remediation. */
import "server-only";

import {
  WEBSITE_AI_GUIDANCE_SCHEMA_NAME,
  websiteAiGuidanceJsonSchema,
} from "@/features/website-scanner/constants/websiteAiJsonSchema";
import { MAX_WEBSITE_AI_RULES_PER_REQUEST } from "@/features/website-scanner/constants/scanLimits";
import {
  buildWebsiteAiUserPayload,
  WEBSITE_AI_DEVELOPER_INSTRUCTIONS,
  type AiRuleInput,
} from "@/features/website-scanner/server/ai/websiteFixGuidancePrompt";
import type { WebsiteFixGuidanceResponse } from "@/features/website-scanner/types/aiFixGuidance";
import { OpenAiAnalysisError } from "@/features/accessibility/server/openAiAnalysisError";
import { mapOpenAiCallError } from "@/features/accessibility/server/openAiErrorUtils";
import { getAiRequestTimeoutMs, getTextModel } from "@/lib/openai/config";
import { getOpenAiClient } from "@/lib/openai/client";

export async function generateWebsiteFixGuidance(
  rules: AiRuleInput[],
): Promise<WebsiteFixGuidanceResponse> {
  if (rules.length === 0) {
    return { guidance: [] };
  }
  if (rules.length > MAX_WEBSITE_AI_RULES_PER_REQUEST) {
    throw new OpenAiAnalysisError(
      `Select at most ${MAX_WEBSITE_AI_RULES_PER_REQUEST} rules per request.`,
      "malformed",
    );
  }

  const client = getOpenAiClient();
  const model = getTextModel();

  try {
    const response = await client.responses.create(
      {
        model,
        input: [
          {
            role: "developer",
            content: [
              { type: "input_text", text: WEBSITE_AI_DEVELOPER_INSTRUCTIONS },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: buildWebsiteAiUserPayload(rules),
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: WEBSITE_AI_GUIDANCE_SCHEMA_NAME,
            strict: true,
            schema: websiteAiGuidanceJsonSchema,
          },
        },
      },
      { signal: AbortSignal.timeout(getAiRequestTimeoutMs()) },
    );

    const raw = response.output_text?.trim();
    if (!raw) {
      throw new OpenAiAnalysisError("Empty AI response.", "malformed");
    }
    const parsed = JSON.parse(raw) as WebsiteFixGuidanceResponse;
    if (!Array.isArray(parsed.guidance)) {
      throw new OpenAiAnalysisError("Malformed AI response.", "malformed");
    }
    return parsed;
  } catch (error) {
    throw mapOpenAiCallError(error);
  }
}
