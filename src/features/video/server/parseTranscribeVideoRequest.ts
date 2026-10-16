import { MAX_VOCABULARY_HINTS_LENGTH } from "@/features/video/constants/videoLimits";
import { isValidMediaRef } from "@/lib/media-storage/mediaRefUtils";

export type TranscribeVideoRequestBody = {
  mediaRef: string;
  language?: string;
  detectSpeakers?: boolean;
  vocabularyHints?: string;
};

export type ParseTranscribeResult =
  | { ok: true; body: TranscribeVideoRequestBody }
  | { ok: false; status: number; message: string };

export function parseTranscribeVideoRequest(body: unknown): ParseTranscribeResult {
  if (!body || typeof body !== "object") {
    return { ok: false, status: 400, message: "Invalid request body." };
  }

  const mediaRef =
    "mediaRef" in body && typeof (body as { mediaRef: unknown }).mediaRef === "string"
      ? (body as { mediaRef: string }).mediaRef.trim()
      : "";

  if (!mediaRef || !isValidMediaRef(mediaRef)) {
    return { ok: false, status: 400, message: "Invalid media reference." };
  }

  if (/^https?:\/\//i.test(mediaRef)) {
    return { ok: false, status: 400, message: "Invalid media reference." };
  }

  const detectSpeakers = Boolean(
    "detectSpeakers" in body && (body as { detectSpeakers: unknown }).detectSpeakers,
  );

  let language: string | undefined;
  if (
    "language" in body &&
    typeof (body as { language: unknown }).language === "string"
  ) {
    const lang = (body as { language: string }).language.trim();
    if (lang && lang !== "auto") {
      language = lang.slice(0, 16);
    }
  }

  let vocabularyHints: string | undefined;
  if (
    "vocabularyHints" in body &&
    typeof (body as { vocabularyHints: unknown }).vocabularyHints === "string"
  ) {
    vocabularyHints = (body as { vocabularyHints: string }).vocabularyHints
      .trim()
      .slice(0, MAX_VOCABULARY_HINTS_LENGTH);
  }

  return {
    ok: true,
    body: { mediaRef, detectSpeakers, language, vocabularyHints },
  };
}
