import "server-only";

import { AI_REQUEST_TIMEOUT_MS } from "@/features/accessibility/constants/aiLimits";

const DEFAULT_VISION_MODEL = "gpt-5";
const DEFAULT_IMAGE_DETAIL = "auto";
const DEFAULT_CAPTION_MODEL = "whisper-1";
const DEFAULT_DIARIZATION_MODEL = "gpt-4o-transcribe-diarize";
const DEFAULT_TEXT_MODEL = "gpt-5";

export function getOpenAiApiKey(): string | undefined {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key || undefined;
}

export function isOpenAiConfigured(): boolean {
  return Boolean(getOpenAiApiKey());
}

export function getVisionModel(): string {
  return process.env.OPENAI_VISION_MODEL?.trim() || DEFAULT_VISION_MODEL;
}

export function getImageDetail(): "auto" | "low" | "high" {
  const detail = process.env.OPENAI_IMAGE_DETAIL?.trim().toLowerCase();
  if (detail === "low" || detail === "high" || detail === "auto") {
    return detail;
  }
  return DEFAULT_IMAGE_DETAIL;
}

export function getCaptionModel(): string {
  return process.env.OPENAI_CAPTION_MODEL?.trim() || DEFAULT_CAPTION_MODEL;
}

export function getDiarizationModel(): string {
  return (
    process.env.OPENAI_DIARIZATION_MODEL?.trim() || DEFAULT_DIARIZATION_MODEL
  );
}

export function getTextModel(): string {
  return process.env.OPENAI_TEXT_MODEL?.trim() || DEFAULT_TEXT_MODEL;
}

export function isRemediationModelConfigured(): boolean {
  return Boolean(process.env.OPENAI_REMEDIATION_MODEL?.trim());
}

export function getRemediationModel(): string {
  const model = process.env.OPENAI_REMEDIATION_MODEL?.trim();
  if (!model) {
    throw new Error("OPENAI_REMEDIATION_MODEL is not configured.");
  }
  return model;
}

export function getRemediationTimeoutMs(): number {
  const raw = process.env.OPENAI_REMEDIATION_TIMEOUT_MS?.trim();
  if (raw) {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed) && parsed >= 15_000) {
      return Math.min(parsed, 180_000);
    }
  }
  return getAiRequestTimeoutMs();
}

export function isAiRemediationEnabled(): boolean {
  const flag = process.env.AI_REMEDIATION_ENABLED?.trim().toLowerCase();
  if (flag === "0" || flag === "false") return false;
  return true;
}

function parsePositiveIntEnv(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return parsed;
}

export function getMaxAiRemediationsPerSession(): number {
  return parsePositiveIntEnv(
    "MAX_AI_REMEDIATIONS_PER_SESSION",
    12,
  );
}

export function getMaxAiRemediationsPerScan(): number {
  return parsePositiveIntEnv("MAX_AI_REMEDIATIONS_PER_SCAN", 8);
}

export function getAiRequestTimeoutMs(): number {
  const raw = process.env.OPENAI_REQUEST_TIMEOUT_MS?.trim();
  if (!raw) return AI_REQUEST_TIMEOUT_MS;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 15_000) {
    return AI_REQUEST_TIMEOUT_MS;
  }
  return Math.min(parsed, 180_000);
}
