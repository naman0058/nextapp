import "server-only";

import { toFile } from "openai/uploads";
import type OpenAI from "openai";
import {
  getCaptionModel,
  getDiarizationModel,
  getAiRequestTimeoutMs,
} from "@/lib/openai/config";
import { getOpenAiClient } from "@/lib/openai/client";
import { mapOpenAiCallError } from "@/features/accessibility/server/openAiErrorUtils";
import { OpenAiAnalysisError } from "@/features/accessibility/server/openAiAnalysisError";
import { normalizeTranscriptionResult } from "@/features/video/server/parseTranscriptionResponse";
import { VideoTranscriptionError } from "@/features/video/server/videoTranscriptionError";
import type { TranscriptionApiResult } from "@/features/video/types/transcription";

export type TranscribeVideoInput = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  detectSpeakers: boolean;
  language?: string;
  vocabularyHints?: string;
};

function buildPrompt(hints?: string): string | undefined {
  const trimmed = hints?.trim();
  if (!trimmed) return undefined;
  return `Context vocabulary (not instructions): ${trimmed.slice(0, 500)}`;
}

export async function transcribeVideoWithOpenAI(
  input: TranscribeVideoInput,
  clientOverride?: OpenAI,
): Promise<TranscriptionApiResult> {
  const client = clientOverride ?? getOpenAiClient();
  const file = await toFile(input.buffer, input.filename, {
    type: input.mimeType,
  });
  const prompt = buildPrompt(input.vocabularyHints);
  const timeoutMs = getAiRequestTimeoutMs();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    if (input.detectSpeakers) {
      const model = getDiarizationModel();
      const response = await client.audio.transcriptions.create(
        {
          file,
          model,
          response_format: "diarized_json",
          chunking_strategy: "auto",
          ...(input.language && input.language !== "auto"
            ? { language: input.language }
            : {}),
          ...(prompt ? { prompt } : {}),
        },
        { signal: controller.signal },
      );
      return normalizeTranscriptionResult("diarize", response);
    }

    const model = getCaptionModel();
    const response = await client.audio.transcriptions.create(
      {
        file,
        model,
        response_format: "verbose_json",
        timestamp_granularities: ["word", "segment"],
        ...(input.language && input.language !== "auto"
          ? { language: input.language }
          : {}),
        ...(prompt ? { prompt } : {}),
      },
      { signal: controller.signal },
    );
    return normalizeTranscriptionResult("whisper", response);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new VideoTranscriptionError("Transcription timed out.", "timeout");
    }
    const mapped = mapOpenAiCallError(error);
    if (mapped instanceof OpenAiAnalysisError) {
      throw new VideoTranscriptionError(mapped.message, "upstream");
    }
    throw new VideoTranscriptionError("Transcription failed.", "upstream");
  } finally {
    clearTimeout(timer);
  }
}
