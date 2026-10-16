import "server-only";

import type OpenAI from "openai";
import {
  AI_IMAGE_ANALYSIS_SCHEMA_NAME,
  aiImageAnalysisJsonSchema,
} from "@/features/accessibility/constants/aiImageJsonSchema";
import {
  buildUserAnalysisText,
  DEVELOPER_INSTRUCTIONS,
} from "@/features/accessibility/prompts/imageAccessibilityPrompt";
import type { AIImageAccessibilityAnalysis } from "@/features/accessibility/types/aiImageAnalysis";
import { validateAiImageAnalysis } from "@/features/accessibility/utils/ai/validateAiImageAnalysis";
import { OpenAiAnalysisError } from "@/features/accessibility/server/openAiAnalysisError";
import { mapOpenAiCallError } from "@/features/accessibility/server/openAiErrorUtils";
import { getAiRequestTimeoutMs, getImageDetail, getVisionModel } from "@/lib/openai/config";
import { getOpenAiClient } from "@/lib/openai/client";
import type { SocialPlatform } from "@/types";

export { OpenAiAnalysisError } from "@/features/accessibility/server/openAiAnalysisError";

export type AnalyzeImageInput = {
  imageBase64: string;
  mimeType: string;
  platform: SocialPlatform;
  caption: string;
  altText: string;
};

export async function analyzeImageWithOpenAI(
  input: AnalyzeImageInput,
  clientOverride?: OpenAI,
): Promise<AIImageAccessibilityAnalysis> {
  const client = clientOverride ?? getOpenAiClient();
  const model = getVisionModel();
  const detail = getImageDetail();

  const userText = buildUserAnalysisText({
    platform: input.platform,
    caption: input.caption,
    altText: input.altText,
  });

  const dataUrl = `data:${input.mimeType};base64,${input.imageBase64}`;

  let response: OpenAI.Responses.Response;
  try {
    response = await client.responses.create(
      {
        model,
        input: [
          {
            role: "developer",
            content: [{ type: "input_text", text: DEVELOPER_INSTRUCTIONS }],
          },
          {
            role: "user",
            content: [
              { type: "input_text", text: userText },
              {
                type: "input_image",
                image_url: dataUrl,
                detail,
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: AI_IMAGE_ANALYSIS_SCHEMA_NAME,
            strict: true,
            schema: aiImageAnalysisJsonSchema,
          },
        },
      },
      { signal: AbortSignal.timeout(getAiRequestTimeoutMs()) },
    );
  } catch (error) {
    throw mapOpenAiCallError(error);
  }

  const rawText = response.output_text?.trim();
  if (!rawText) {
    throw new OpenAiAnalysisError("Empty AI response.", "malformed");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new OpenAiAnalysisError("Malformed AI response.", "malformed");
  }

  const validated = validateAiImageAnalysis(parsed);
  if (!validated.ok) {
    throw new OpenAiAnalysisError("Malformed AI response.", "malformed");
  }

  return validated.data;
}
