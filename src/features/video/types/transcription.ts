import type { TimedSegment, TimedWord } from "@/features/video/types/captions";

export type TranscriptionMode = "whisper" | "diarize";

export type TranscriptionApiResult = {
  mode: TranscriptionMode;
  language?: string;
  fullText: string;
  words: TimedWord[];
  segments: TimedSegment[];
  durationSeconds?: number;
};
