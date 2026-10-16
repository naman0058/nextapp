import type { TimedSegment, TimedWord } from "@/features/video/types/captions";
import type { TranscriptionApiResult, TranscriptionMode } from "@/features/video/types/transcription";

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

function parseWords(raw: unknown): TimedWord[] {
  if (!Array.isArray(raw)) return [];
  const words: TimedWord[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const word =
      "word" in item && typeof (item as { word: unknown }).word === "string"
        ? (item as { word: string }).word
        : "";
    const start = asNumber((item as { start?: unknown }).start);
    const end = asNumber((item as { end?: unknown }).end);
    if (!word || start == null || end == null) continue;
    words.push({ word, start, end });
  }
  return words;
}

function parseSegments(raw: unknown, withSpeaker = false): TimedSegment[] {
  if (!Array.isArray(raw)) return [];
  const segments: TimedSegment[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const text =
      "text" in item && typeof (item as { text: unknown }).text === "string"
        ? (item as { text: string }).text.trim()
        : "";
    const start = asNumber((item as { start?: unknown }).start);
    const end = asNumber((item as { end?: unknown }).end);
    if (!text || start == null || end == null) continue;
    const speaker =
      withSpeaker &&
      "speaker" in item &&
      typeof (item as { speaker: unknown }).speaker === "string"
        ? (item as { speaker: string }).speaker
        : undefined;
    segments.push({ start, end, text, speaker });
  }
  return segments;
}

export function parseWhisperVerboseJson(
  payload: unknown,
): TranscriptionApiResult {
  const obj = payload as Record<string, unknown>;
  const fullText =
    typeof obj.text === "string" ? obj.text.trim() : "";
  const words = parseWords(obj.words);
  const segments = parseSegments(obj.segments);
  const duration = asNumber(obj.duration) ?? undefined;
  const language =
    typeof obj.language === "string" ? obj.language : undefined;

  return {
    mode: "whisper",
    fullText,
    words,
    segments,
    durationSeconds: duration,
    language,
  };
}

export function parseDiarizedJson(payload: unknown): TranscriptionApiResult {
  const obj = payload as Record<string, unknown>;
  const segments = parseSegments(obj.segments, true);
  const fullText = segments.map((s) => s.text).join(" ").trim();
  const words: TimedWord[] = [];
  for (const seg of segments) {
    const parts = seg.text.split(/\s+/).filter(Boolean);
    if (parts.length === 0) continue;
    const duration = Math.max(seg.end - seg.start, 0.01);
    const step = duration / parts.length;
    parts.forEach((word, i) => {
      words.push({
        word,
        start: seg.start + i * step,
        end: seg.start + (i + 1) * step,
        speaker: seg.speaker,
      });
    });
  }
  return {
    mode: "diarize",
    fullText,
    words,
    segments,
    language:
      typeof obj.language === "string" ? obj.language : undefined,
  };
}

export function normalizeTranscriptionResult(
  mode: TranscriptionMode,
  payload: unknown,
): TranscriptionApiResult {
  return mode === "diarize"
    ? parseDiarizedJson(payload)
    : parseWhisperVerboseJson(payload);
}
