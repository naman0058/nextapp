import OpenAI from "openai";
import { OpenAiAnalysisError } from "@/features/accessibility/server/openAiAnalysisError";

export function isRequestTimeout(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (error.name === "TimeoutError" || error.name === "AbortError") {
    return true;
  }
  const withCode = error as Error & { code?: string };
  if (withCode.code === "ABORT_ERR" || withCode.code === "ETIMEDOUT") {
    return true;
  }
  const cause = (error as Error & { cause?: unknown }).cause;
  if (cause instanceof Error) {
    return cause.name === "TimeoutError" || cause.name === "AbortError";
  }
  return false;
}

export function mapOpenAiCallError(error: unknown): OpenAiAnalysisError {
  if (isRequestTimeout(error)) {
    return new OpenAiAnalysisError(
      "The image analysis request timed out. Try again or use a smaller image.",
      "timeout",
    );
  }

  if (error instanceof OpenAI.APIError) {
    if (error.status === 404 || error.status === 400) {
      return new OpenAiAnalysisError(
        "The configured vision model is unavailable or invalid. Check OPENAI_VISION_MODEL.",
        "upstream",
      );
    }
    if (error.status === 429) {
      return new OpenAiAnalysisError(
        "The AI service is rate limited. Please wait and try again.",
        "upstream",
      );
    }
  }

  if (error instanceof OpenAiAnalysisError) {
    return error;
  }

  return new OpenAiAnalysisError("AI service unavailable.", "upstream");
}
